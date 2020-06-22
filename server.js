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
app.get('/search', recommendationEngine);
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
function recommendationEngine(req, res){
  let searchString = 'the fifth element';

  let url = 'https://api.themoviedb.org/3/search/movie';

  // Define the query params
  const queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: searchString,
    limit: 1
  }

  superagent(url)
  // using the defined params
    .query(queryParams)
    .then(data => {
      // console.log(data.body.results[0]);
      let movieId = data.body.results[0].id;
      let movieGenres = data.body.results[0].genre_ids;
      let movieVotes = data.body.results[0].vote_average;

      let idURL = `https://api.themoviedb.org/3/movie/${movieId}/recommendations`;

      let idParams = {
        api_key: process.env.MOVIE_API_KEY,
        page: 1
      }

      superagent(idURL)
        .query(idParams)
        .then(similarData => {
          let similarArray = [];
          for(let i = 0; i < similarData.body.results.length; i++){
            similarArray.push(new Movie(similarData.body.results[i]));
            if(i >= 2){
              break;
            }
          }

          // console.log(similarArray);

          let genreIdURL= 'https://api.themoviedb.org/3/discover/movie?';

          let genreParams = {
            api_key: process.env.MOVIE_API_KEY,
            with_genres: movieGenres
          }

          superagent(genreIdURL)
            .query(genreParams)
            .then(genreResults => {
              let genreArray = []
              for (let i = 0; i < genreResults.body.results.length; i++){
                genreArray.push(new Movie(genreResults.body.results[i]));
                if(i >= 2){
                  break;
                }
              }

              let votesParams = {
                api_key: process.env.MOVIE_API_KEY,
                vote_average: movieVotes
              }

              superagent(genreIdURL)
                .query(votesParams)
                .then((votesResults => {
                  // console.log(votesResults.body.results);
                  let votesArray = [];
                  for(let i = 0; i < votesResults.body.results.length; i++){
                    votesArray.push(new Movie(votesResults.body.results[i]));
                    if(i >= 2){
                      break;
                    }
                  }

                  let finalOutputArray = [similarArray, genreArray, votesArray];

                  console.log('final output array:', finalOutputArray);

                  res.status(200).render('data.ejs', { frontView: finalOutputArray });
                })).catch(errorCatch);
            }).catch(errorCatch)
        }).catch(errorCatch)
    }).catch(errorCatch);
}

function errorCatch(err){
  console.error(err);
}

function Movie(obj){
  this.title = obj.title;
  this.genre = obj.genre_ids;
  this.overview = obj.overview;
  this.poster = obj.poster_path;
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
