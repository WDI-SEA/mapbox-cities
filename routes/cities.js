const express = require('express');
const router = express.Router();
const mbClient = require('@mapbox/mapbox-sdk');
const mbGeocode = require('@mapbox/mapbox-sdk/services/geocoding');
const db = require('../models')

const mb = mbClient({ accessToken: process.env.MAPBOX_KEY })
const geocode = mbGeocode(mb);

router.get('/search', function (req, res) {
  res.render('cities/search');
});

router.get('/results', function (req, res) {
  geocode.forwardGeocode({
    query: `${req.query.city}, ${req.query.state}`,
    types: ['place'],
    countries: ['us']
  }).send()
  .then(function(response) {
    let results = response.body.features.map(result => {
      return {
        name: result.place_name,
        lat: result.center[1],
        long: result.center[0]
      }
    })
    res.render('cities/results', { query: req.query, results });
  })
});

router.post('/add', function (req, res) {
  console.log(req.body)
  // add a city to the cities table in our db
  db.city.findOrCreate({
    where: {
      name: req.body.name
    },
    defaults: {
      lat: req.body.lat,
      long: req.body.long
    }
  })
  .then(function([city, created]){
    console.log(`${city.name} was ${created ? 'created' : 'found'}`)
    res.redirect('/favorites')
  })
})

router.get('/favorites', function (req, res) {
  // TODO retreive all cities
  db.city.findAll()
  .then(function(cities) {
    res.render('cities/favorites', { cities })
  })
})

module.exports = router;