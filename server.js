/*
  Express for deployment
  Body parser for parsing for weatherQuery
  API key used from openweathermap.org
*/
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');
const apiKey = '67f615aee5bd8a92aa50191e57c29320';

/*
  ejs set to index.ejs found in Views folder
*/
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine','ejs')
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = req.body.city;
  // API call for weather data
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = JSON.parse(body);
      if(weather.main == undefined) {
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let tempQuery = `${weather.main.temp}`;
        let cityQuery = `${weather.name}`;
        let humitidyQuery = `${weather.main.humidity}`;
        let windQuery = `${weather.wind.speed}`;
        res.render('index', {cityHumidity: humitidyQuery, cityWind: windQuery, cityName: cityQuery, cityTemp: tempQuery, error: null});
        console.log(weather);
      }
    }
  });
})



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
