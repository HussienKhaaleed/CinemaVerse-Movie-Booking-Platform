//bookingController.js
const Stripe = require("stripe");
const BookingModel = require("../models/bookingModel");
const MovieModel = require("../models/moviesModel");
const UserModel = require("../models/usersModel");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // throw an informative error when used (not at module load time)
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. Set it in .env.",
    );
  }
  return Stripe(key);
}

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "items array is required with at least one item",
      });
    }

    // Validate and fetch all movies
    const movieIds = items.map(item => item.movieId);
    const movies = await MovieModel.find({ _id: { $in: movieIds } });

    if (movies.length !== movieIds.length) {
      return res.status(404).json({ 
        status: "fail", 
        message: "One or more movies not found" 
      });
    }

    const moviesMap = movies.reduce((map, movie) => {
      map[movie._id.toString()] = movie;
      return map;
    }, {});

    const stripe = getStripe();

    // Create line items for each movie in cart
    const line_items = items.map(item => {
      const movie = moviesMap[item.movieId];
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: movie.title,
            images: [
              `${req.protocol}://${req.get("host")}/moviePosters/${movie.posterImage}`,
            ],
          },
          unit_amount: movie.price * 100, // amount in cents
        },
        quantity: item.ticketsCount,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      customer_email: req.user.email,
      line_items,
      metadata: {
        userId: req.user._id.toString(),
        items: JSON.stringify(items), // Store all items for webhook processing
      },
    });

    res.status(200).json({
      status: "success",
      sessionUrl: session.url,
    });
  } catch (err) {
    next(err);
  }
};

//Get webhook from stripe when payment is successful
//Create bookings in DB

exports.handleStripeWebhook = async (req, res) => {
  let event;
  try {
    const stripe = getStripe();
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log("Webhook verified:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const userId = metadata.userId;
      const items = JSON.parse(metadata.items || "[]");
      const amountPaid = session.amount_total / 100;

      const user = await UserModel.findById(userId);
      if (!user) {
        console.error("User not found for webhook session:", userId);
        return res.status(400).send("User not found");
      }

      // Create a booking for each movie in the order
      for (const item of items) {
        const movie = await MovieModel.findById(item.movieId);
        if (!movie) {
          console.error("Movie not found for webhook session:", item.movieId);
          continue; // Skip this item but process others
        }

        const showTime = item.showTime ? new Date(item.showTime) : new Date();

        const existingBooking = await BookingModel.findOne({
          user: user._id,
          movie: movie._id,
          showTime,
          ticketsCount: item.ticketsCount,
        });

        if (!existingBooking) {
          await BookingModel.create({
            user: user._id,
            movie: movie._id,
            showTime,
            ticketsCount: item.ticketsCount,
            amountPaid: movie.price * item.ticketsCount, // Store individual movie amount
            paymentStatus: "paid",
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error processing webhook event:", err);
    res.status(400).send(`Webhook Internal Error: ${err.message}`);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    console.log("=== GET MY BOOKINGS DEBUG ===");
    console.log("User ID from token:", req.user._id);
    console.log("User ID type:", typeof req.user._id);
    
    const bookings = await BookingModel.find({ user: req.user._id });
    
    console.log("Found bookings count:", bookings.length);
    console.log("Bookings data:", JSON.stringify(bookings, null, 2));
    
    res.status(200).json({
      status: "success",
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("Error in getMyBookings:", err);
    next(err);
  }
};
