





# MongoDB App Documentation

## Table of Contents
- Project Overview
- Installation
- NPM Packages
- API Usage
  - Openweather API
  - Google Maps API
  - Additional APIs
- Design Decisions

## Project Overview

The Weather App is a web application built using Express.js, Bootstrap, and jQuery. It provides weather information, NYT best sellers lists, and artworks from the Rijksmuseum API. The app is organized into three main sections: Weather, NYT Best Sellers, and Rijksmuseum.

## Installation

1. Clone the repository: `git clone https://github.com/ademashauenova/backend_assignment3.git`
2. Navigate to the project folder: `cd backend_assignment3`
3. Install dependencies: `npm install`
4. Run the server: `nodemon app.js`
5. Open your browser and visit `http://localhost:3000`

## npm packages/dependencies

- Express.js
- axios
- mongoose
- express-session
- bcrypt
- ejs

## API Usage

### Weather API
Endpoint: /main
Method: POST
Parameters: cityName
Response: JSON object containing weather details such as temperature, feels like, humidity, pressure, wind speed, and more.

### Google Maps API
Method: GET
Parameters: latitude, longitude
Response: Map visually showcasing the location of cities based on latitude and longitude.

### NYT Best Sellers API
Endpoint: /bestsellers
Method: GET
Parameter: title
Response: Info about books from NYT bestsellers lists searched by user.

### Rijksmuseum API
Endpoint: /museum
Method: GET
Parameter: title (e.g. The Night Watch, The Milkmaid, etc.)
Response: Info about the paintings from Rijksmuseum API searched by user.


## Design Decisions

### Navbar
The app features a responsive navigation bar fixed to the top, providing easy access to different sections: Weather, Book Bestsellers, and Rijksmuseum.

### Database Structure
Used MongoDB to store user data and their historical searches.

### Session Management
Implemented Express session for user authentication.

### Password Security
Used bcrypt to hash and store user passwords securely.

### Password Information
Admin Credentials:
Username: adema
Password: pass

## Responsiveness
The website is designed to be responsive, with media queries adjusting panel sizes for optimal viewing on various screen sizes.
