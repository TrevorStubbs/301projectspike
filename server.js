'use strict'

const express = require('express');
const app = express();

const superagent = require('superagent');

require('dotenv').config();

// const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);
// client.on('error', err => console.error(err));

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.set('view engine', 'ejs');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.get('/', homeRoute);
// app.get('/search', searchLoop);
app.get('/search', recomendationEngine);
app.all('*', errorRoute);

function homeRoute(req, res) {
  console.log('Am I on?');
  res.status(200).render('index.ejs');
}

// Get movies
// select 9 movies from the list
// put those movies into a constructor function
// ping openmovies to get posters

// ---------- WIP ----------------
// This might not work since there is a limit on how many API calls that can be made.
////////////////////////////////////
// function searchLoop(req, res) {
//   let searchedItem = 'the+fifth+element';

//   let apiKey = process.env.TD_API_KEY;

//   let url = `https://tastedive.com/api/similar?q=movie:${searchedItem}&type=movies&key=${apiKey}`;

// //   let url = `https://tastedive.com/api/similar?q=movie:${searchedItem}&type=movies`;


//   superagent.get(url)
//     .then(results => {
//     //   console.log(results);
//       let outputPlay = results.text;
//     //   console.log(outputPlay);
//       let parsedJSON = JSON.parse(outputPlay);
//       console.log(parsedJSON);
//     }).catch(errorCatch);
// }

// -------------- WIP ------------------
// todo it this way we need to get the movie ID then pass it into the search query.
function recomendationEngine(req, res){
    let searchString = 'hobbit';

    let url = 'https://api.themoviedb.org/3/search/movie';

    // Define the query params
    const queryParams = {
      api_key: process.env.MOVIE_API_KEY,
      query: searchString,
      limit: 20
    }

    superagent(url)
    // using the defined params
    .query(queryParams)
    .then(data => {
        // console.log(data.body.results[0].id);
        let movieId = data.body.results[0].id;

        let idURL = `https://api.themoviedb.org/3/movie/${movieId}/recommendations`;

        let idParams = {
            api_key: process.env.MOVIE_API_KEY,
            page: 2 
        }

        superagent(idURL)
            .query(idParams)
            .then(similarData => {
                console.log('Did I make it?', similarData.body.results);
            }).catch(errorCatch);
    }).catch(errorCatch);
}

function errorCatch(err){
  console.error(err);
}

//when a user clicks the movie's title gets sent to tasteDive and a new set of images get sent.

// need to store all the seen movies to make sure they dont get seen again
// limit the search to 4 times.

//somehow show the history of the searches

// have a start over button that clears all the arrays.

// probably needs a random number helper functions (int).

function errorRoute(req, res){
    console.log('I am not here');
    res.status(200).render('error.ejs');
}

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})
