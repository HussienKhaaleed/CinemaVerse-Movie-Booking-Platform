@echo off
echo ========================================
echo MongoDB Data Migration Script
echo Local MongoDB to Atlas
echo ========================================
echo.

REM Export from local MongoDB
echo Step 1: Exporting data from local MongoDB...
echo.

REM Create export directory
if not exist "mongodb-export" mkdir mongodb-export

REM Export all collections from bookingDB
echo Exporting users...
mongodump --uri="mongodb://localhost:27017/bookingDB" --collection=users --out=mongodb-export

echo Exporting movies...
mongodump --uri="mongodb://localhost:27017/bookingDB" --collection=movies --out=mongodb-export

echo Exporting bookings...
mongodump --uri="mongodb://localhost:27017/bookingDB" --collection=bookings --out=mongodb-export

echo.
echo Export completed! Files saved in mongodb-export folder
echo.

REM Import to Atlas
echo Step 2: Importing data to MongoDB Atlas...
echo.

set ATLAS_URI=mongodb+srv://cinemaverse-admin:1oFt6GALak8ytrMR@cinemaversecluster.yamswzc.mongodb.net/bookingDB

echo Importing users...
mongorestore --uri="%ATLAS_URI%" --collection=users mongodb-export/bookingDB/users.bson

echo Importing movies...
mongorestore --uri="%ATLAS_URI%" --collection=movies mongodb-export/bookingDB/movies.bson

echo Importing bookings...
mongorestore --uri="%ATLAS_URI%" --collection=bookings mongodb-export/bookingDB/bookings.bson

echo.
echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo Your data is now on MongoDB Atlas
pause
