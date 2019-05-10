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
const twilio = require('twilio');

/*
  ejs set to index.ejs found in Views folder
*/
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine','ejs')
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', {
    weather: null,
    cityName: null,
    cityTemp: null,
    cityHumidity: null,
    cityWind: null,
    error: null
  });
})

app.post('/', function (req, res) {
  let city = req.body.city;
  // API call for weather data
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
  request(url, function (err, response, body) {
    if(err){
      res.render('index', {
        weather: null,
        cityName: null,
        cityTemp: null,
        cityHumidity: null,
        cityWind: null,
        error: 'Error, please try again'
      });
    } else {
      let weather = JSON.parse(body);
      if(weather.main == undefined) {
        res.render('index', {
          weather: null,
          cityName: null,
          cityTemp: null,
          cityHumidity: null,
          cityWind: null,
          error: 'Error, please try again'
        });
      } else {
        let tempQuery = `${weather.main.temp}`;
        let cityQuery = `${weather.name}`;
        let humitidyQuery = `${weather.main.humidity}`;
        let windQuery = `${weather.wind.speed}`;
        res.render('index', {
          cityHumidity: humitidyQuery,
          cityWind: windQuery,
          cityName: cityQuery,
          cityTemp: tempQuery,
          error: null
        });
        console.log(weather);
        for (let i = 0; i < `${weather.weather.length}`; i++) {
          if (`${weather.weather[i].main}` == 'Rain') {
            console.log('Rain!');
            sendRainMessage();
          }
        }
      }
    }
  });
})

/* Traversal Functions */

function traverseWeather(obj, prop, defaultval) {
  if (typeof defaultval == 'undefined') defaultval = null;
  prop = prop.split('.');
  for (let i = 0; i < prop.length; i++) {
    if (typeof obj[prop[i]] == 'undefined')
      return defaultval;
    obj = obj[prop[i]];
  }
  return obj;
}

/* START Twilio */

let client = new twilio('AC512696f090a2bf651bc12c9f043d80a7','80d8b3220d2961000af816022037c7e6');
function sendRainMessage() {
  client.messages.create({
    to: 'RECIPIENT',
    from: 'TWILIO NUMBER',
    body: 'It may rain today! So remember to bring an umbrella!'
  });
}

/* END Twilio */


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
