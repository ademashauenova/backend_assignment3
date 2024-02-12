const express = require('express');
const axios = require('axios');
const https = require('https');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

mongoose.connect('mongodb+srv://ademashauenova:Xjrsg3ko8uEcm1od@cluster0.10jquxy.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', (error) => console.error(error));
mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
    updatedDate: Date,
    deletedDate: Date,
    weatherData: [{
      cityName: String,
      temp: Number,
      feelsLike: Number,
      humidity: Number,
      pressure: Number,
      windSpeed: Number,
      weatherdescription: String,
      icon: String,
      coordinates: {
        lat: Number,
        lon: Number,
      },
      countryCode: String,
      rainVolume: Number,
      mapUrl: String,
      imageURL: String,
      timestamp: { type: Date, default: Date.now },
    }],
    bestSellersData: [{
      title: String,
      author: String,
      description: String,
      publisher: String,
      timestamp: { type: Date, default: Date.now },
    }],
    museumSearchData: [{
      title: String,
      timestamp: { type: Date, default: Date.now },
      artist: String,
      artworks: [{
        title: String,
        artist: String,
        imageUrl: String,
      }],
    }],
});
  
const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

app.set('view engine', 'ejs');


// const isAdmin = (req, res, next) => {
//     const adminUsername = "adema";
//     const adminPassword = "pass";
  
//     if (req.session.user && req.session.user.username === adminUsername && req.session.user.password === adminPassword) {
//       next();
//     } else {
//       res.redirect('/');
//     }
// };

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/main', (req, res) => {
  if (req.session.user) {
    res.render('main', { username: req.session.user.username });
  } else {
    res.redirect('/');
  }
});

app.get('/admin', async (req, res) => {
    const users = await User.find({ deletedDate: { $exists: false } });
    res.render('admin', { users });
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.redirect('/');
  } catch (error) {
    res.redirect('/register');
  }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = user;
      
      if (user.isAdmin) {
        res.redirect('/admin');
      } else {
        res.redirect('/main');
      }
    } else {
      res.redirect('/');
    }
});

app.post('/admin/add', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        isAdmin: req.body.isAdmin === 'on',
      });
      await user.save();
      res.redirect('/admin');
    } catch (error) {
      res.redirect('/admin');
    }
});
  

app.get('/admin/edit/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
  } catch (error) {
    res.redirect('/admin');
  }
});

app.post('/admin/edit/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.username = req.body.username;
    user.isAdmin = req.body.isAdmin === 'on';
    user.updatedDate = new Date();
    await user.save();
    res.redirect('/admin');
  } catch (error) {
    res.redirect('/admin');
  }
});

  
app.post('/admin/delete/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      user.deletedDate = new Date();
      await user.save();
      res.redirect('/admin');
    } catch (error) {
      res.redirect('/admin');
    }
});

app.post('/main', async function (req, res) {
  const cityName = req.body.cityName;

  if (!cityName) {
      res.status(400).send('CityName parameter is required');
      return;
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=2448beca9400d4c1e0c72997e2fa8b57&units=metric`;

  https.get(weatherUrl, async function (response) {
      console.log(response.statusCode);
      let rawData = '';

      response.on('data', function (chunk) {
          rawData += chunk;
      });

      response.on('end', async function () {
          try {
              const weatherdata = JSON.parse(rawData);
              const weatherData = JSON.parse(rawData);

              const temp = weatherdata.main.temp;
              const feelsLike = weatherdata.main.feels_like;
              const humidity = weatherdata.main.humidity;
              const pressure = weatherdata.main.pressure;
              const windSpeed = weatherdata.wind.speed;
              const weatherdescription = weatherdata.weather[0].description;
              const icon = weatherdata.weather[0].icon;
              const imageURL = `https://openweathermap.org/img/wn/${icon}.png`;

              const coordinates = weatherdata.coord;
              const countryCode = weatherdata.sys.country;
              const rainVolume = weatherdata.rain ? weatherdata.rain['1h'] || 0 : 0;

              const mapUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyDD1ogD8nPSLflYFgltd1HZVPDxEk9EkVU&center=${coordinates.lat},${coordinates.lon}&zoom=10`;

              if (req.session.user) {
                const user = await User.findById(req.session.user._id);
                if (!user.weatherData) {
                  user.weatherData = [];
                }
            
                user.weatherData.push({
                  cityName: cityName,
                  temp: temp,
                  feelsLike: feelsLike,
                  humidity: humidity,
                  pressure: pressure,
                  windSpeed: windSpeed,
                  weatherdescription: weatherdescription,
                  icon: icon,
                  coordinates: coordinates,
                  countryCode: countryCode,
                  rainVolume: rainVolume,
                  mapUrl: mapUrl,
                  imageURL: imageURL,
                  timestamp: new Date(),
                });
      
                await user.save();
              }

              const responseData = {
                  temp,
                  imageURL,
                  feelsLike,
                  weatherdescription,
                  humidity,
                  pressure,
                  windSpeed,
                  coordinates,
                  countryCode,
                  rainVolume,
                  mapUrl
              };
      
              res.json(responseData);
          } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Internal Server Error' });
          }
      });
  });
});

app.get('/history', async (req, res) => {
  try {
      if (req.session.user) {
          const user = await User.findById(req.session.user._id);
          res.json(user.weatherData);
      } else {
          res.status(401).json({ error: 'Unauthorized' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/bestsellers', async (req, res) => {
  const { title } = req.query;
  const apikey = 'WJowE5lwzxGfaRheBtK5tjoDyYCGYvS9';

  const userId = req.session.user._id;
  const user = await User.findById(userId);

  const response = await axios.get(`https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?api-key=${apikey}&title=${title}`);
  const book = response.data;
  
  console.log('API Response:', response.data);

  if (!book || book.length === 0) {
      res.status(404).json({ error: 'No books found for the given title' });
      return;
  };

  book.results.forEach(bookItem => {
    user.bestSellersData.push({
      title: bookItem.title,
      author: bookItem.author,
      timestamp: new Date().toLocaleString(),
      description: bookItem.description,
      publisher: bookItem.publisher,
    });
  });

  await user.save();

  res.render("bestsellers", { book, history: user.bestSellersData } );
});


app.get('/museum', async (req, res) => {
  const { title } = req.query;

  if (title) {
    const apikey = '5jLUx1H6';

    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);

      const response = await axios.get(`https://www.rijksmuseum.nl/api/en/collection?key=${apikey}&q=${title}`);
      const artworks = response.data.artObjects;

      console.log('API Response:', response.data);

      if (!artworks || artworks.length === 0) {
        return res.status(404).json({ error: 'No artworks found for the given title' });
      }

      const filteredArtworks = artworks.filter(artwork => {
        return artwork.title.toLowerCase() === title.toLowerCase();
      });

      const searchHistoryEntry = {
        title: title,
        timestamp: new Date(),
        artworks: filteredArtworks.map(artwork => ({
          title: artwork.title,
          artist: artwork.principalOrFirstMaker,
          imageUrl: artwork.webImage ? artwork.webImage.url : null,
        })),
      };

      user.museumSearchData.push(searchHistoryEntry);
      await user.save();

      res.render('museum', { artworks: filteredArtworks, history: user.museumSearchData });
    } catch (error) {
      console.error('Error fetching data from Rijksmuseum API:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.render('museum', { artworks: [], history: [] });
  }
});


app.listen(3000, () => console.log('Server is running on http://localhost:3000'));