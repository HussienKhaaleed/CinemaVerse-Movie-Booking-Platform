# CinemaVerse - Movie Booking Platform

<div align="center">
  <br>
  <p>A full-stack movie booking application built with Angular and Node.js</p>
  
  ![Angular](https://img.shields.io/badge/Angular-20.3-dd0031)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
  ![PrimeNG](https://img.shields.io/badge/PrimeNG-20.2-213a73)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)
  ![Stripe](https://img.shields.io/badge/Stripe-Payment-6772e5)
</div>

## Overview

CinemaVerse is a comprehensive movie booking platform where users can browse movies, view details, book tickets, manage favorites, and complete purchases via integrated Stripe payments. The application features both user-facing components for browsing and booking, and an admin panel for content management with role-based access control.

## Features

### User Features

- **Movie Browsing**: Browse movies with filter options by genre/category
- **Movie Details**: View comprehensive movie information with poster images and descriptions
- **User Authentication**: Register, login with email/password or Google authentication
- **Shopping Cart**: Add movies to cart, adjust quantities, and calculate totals
- **Favorites**: Save and manage favorite movies
- **Reviews & Ratings**: Submit reviews and ratings for movies
- **Ticket Booking**: Book movie tickets with specific show times
- **Payment Processing**: Secure checkout with Stripe integration
- **Booking History**: View past and upcoming bookings

### Admin Features

- **Movie Management**: Add, update, and delete movies with image upload
- **User Management**: View and manage user accounts
- **Access Control**: Role-based permissions (admin vs regular users)

## Tech Stack

### Frontend

- **Angular**: Latest version with standalone components
- **PrimeNG**: UI component library for styled interface elements
- **TailwindCSS**: Utility-first CSS framework for custom styling
- **RxJS**: Reactive programming for handling asynchronous operations

### Backend

- **Node.js & Express**: RESTful API framework
- **MongoDB & Mongoose**: Database and ODM for data storage
- **JWT Authentication**: Secure user authentication and authorization
- **bcrypt**: Password hashing for security
- **Google Auth Library**: OAuth authentication with Google
- **Stripe**: Payment processing for ticket bookings
- **Multer**: File uploads for movie posters

## Project Structure

### Frontend Structure

```
Frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── about/
│   │   │   ├── carousel-item/
│   │   │   ├── cart-button/
│   │   │   ├── dashboard/
│   │   │   ├── favorite-button/
│   │   │   ├── movie-card/
│   │   │   ├── movie-detail/
│   │   │   ├── movie-filter/
│   │   │   ├── navbar/
│   │   │   ├── review-form/
│   │   │   └── review-list/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── favorite.service.ts
│   │   │   ├── http.service.ts
│   │   │   └── movie.service.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── assets/
│   └── environments/
└── package.json
```

### Backend Structure

```
Backend/
├── app.js            # Express application setup
├── server.js         # Server startup
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── bookingController.js  # Booking and payment processing
│   ├── moviesController.js   # Movie CRUD operations
│   └── usersController.js    # User management
├── models/
│   ├── bookingModel.js       # Booking schema
│   ├── moviesModel.js        # Movie schema
│   └── usersModel.js         # User schema
├── routes/
│   ├── authRoute.js          # Authentication routes
│   ├── bookingRoute.js       # Booking routes
│   ├── moviesRoute.js        # Movie routes
│   └── usersRoute.js         # User routes
└── public/
    └── moviePosters/        # Storage for uploaded movie posters
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login with email and password
- `POST /api/v1/auth/google` - Login with Google OAuth

### Movies

- `GET /api/v1/movies` - Get all movies
- `POST /api/v1/movies` - Add a new movie (admin only)
- `GET /api/v1/movies/:id` - Get a specific movie
- `PATCH /api/v1/movies/:id` - Update a movie (admin only)
- `DELETE /api/v1/movies/:id` - Delete a movie (admin only)

### Bookings

- `POST /api/v1/bookings/create-checkout-session` - Create Stripe checkout session
- `POST /api/v1/bookings/webhook` - Handle Stripe webhook events
- `GET /api/v1/bookings/my-bookings` - Get user's bookings

## Authentication

The application implements a comprehensive authentication system:

- JWT-based authentication with token expiry
- Password hashing with bcrypt
- Google OAuth integration
- Protected routes with middleware
- Cookie and Authorization header support

## Booking & Payment Flow

1. User selects a movie and show time
2. User specifies number of tickets
3. System redirects to Stripe checkout
4. Upon successful payment, Stripe webhook creates booking record
5. User can view booking in "My Bookings" section

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account
- Google OAuth credentials (for Google login)

### Environment Variables

Create a `.env` file in the Backend directory with:

```
MONGODB_CONNECTION_STRING=your_mongodb_uri
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
FRONTEND_URL=http://localhost:4200
```

### Backend Setup

1. Navigate to the Backend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `src/environments/environment.ts` with your API URL
4. Start the development server:
   ```bash
   ng serve
   ```
5. Access the application at `http://localhost:4200`

## Future Enhancements

- Seat selection functionality
- Email notifications for bookings
- Admin dashboard with analytics
- Multiple payment methods
- Mobile app version

## Contributors
- Hussein Khaled
- Abdelrahman Mohamed
- Abdelrahman Osama
- Mohab Islam
- Sahl Mohamed
- Mahmoud Magdy
