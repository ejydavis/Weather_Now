/*
  Express for deployment
  Body parser for parsing for weatherQuery
  API key used from openweathermap.org
*/
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');
//const apiKey = '67f615aee5bd8a92aa50191e57c29320';
const twilio = require('twilio');
let keys = require('./lib/keys.js');
let wkey = keys.wkey;
let tid = keys.tid;
let tauth = keys.tauth;

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
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${wkey}`
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
        let iconUrl = processIcon(`${weather.weather[0].id}`);
        res.render('index', {
          cityHumidity: humitidyQuery,
          cityWind: windQuery,
          cityName: cityQuery,
          cityTemp: tempQuery,
          cityIconUrl: iconUrl,
          error: null
        });
        console.log(weather);
        for (let i = 0; i < `${weather.weather.length}`; i++) {
          processWeatherId(`${weather.weather[i].id}`);
          if (`${weather.weather[i].main}` == 'Rain') {
            console.log('Rain!');
            sendRainMessage();
          }
        }
      }
    }
  });
})

/* Process IconQuery */

function processIcon(num) {
  if (typeof num == 'undefined') return null;
  if (num >= 200 && num < 300) {
    return 'http://openweathermap.org/img/w/11d.png';
  } else if (num >=300 && num < 400) {
    return 'http://openweathermap.org/img/w/09d.png';
  } else if (num >= 500 && num < 600) {
    return 'http://openweathermap.org/img/w/10d.png';
  } else if (num >= 600 && num < 700) {
    return 'http://openweathermap.org/img/w/13d.png';
  } else if (num >= 700 && num < 800) {
    return 'http://openweathermap.org/img/w/50d.png';
  } else if (num == 800) {
    return 'http://openweathermap.org/img/w/01d.png';
  } else if (num > 800) {
    return 'http://openweathermap.org/img/w/02d.png';
  }
  return null;
}

/* Process WeatherID */

function processWeatherId(id) {
  if (id == 800) {
    sendClearMessage();
  } else if (id >= 600 && id < 700) {
    sendSnowMessage();
  } else if (id >= 300 && id < 600) {
    sendRainMessage();
  } else if (id >= 200 && id < 300) {
    sendThunderMessage();
  }
}

/* START Twilio */

//let client = new twilio('AC512696f090a2bf651bc12c9f043d80a7','80d8b3220d2961000af816022037c7e6');
let client = new twilio(tid,tauth);

function sendRainMessage() {
  client.messages.create({
    to: 'RECIPIENT',
    from: 'TWILIO NUMBER',
    body: 'It may rain today! So remember to bring an umbrella!'
  });
}

function sendClearMessage() {
  client.messages.create({
    to: 'RECIPIENT',
    from: 'TWILIO NUMBER',
    body: 'It is clear today! Have a good one!'
  });
}

function sendThunderMessage() {
  client.messages.create({
    to: 'RECIPIENT',
    from: 'TWILIO NUMBER',
    body: 'Thunderstorm today! Be careful!'
  });
}

function sendSnowMessage() {
  client.messages.create({
    to: 'RECIPIENT',
    from: 'TWILIO NUMBER',
    body: 'It is snowing today!'
  });
}

/* END Twilio */


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
