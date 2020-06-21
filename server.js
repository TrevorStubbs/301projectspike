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
app.get('/search', searchLoop);
app.all('*', errorRoute);

function homeRoute(req, res) {
    console.log('Am I on?');
    res.status(200).render('index.ejs');
}

// Get movies
// select 9 movies from the list
// put those movies into a constructor function
// ping openmovies to get posters

function searchLoop(req, res) {
    let searchedItem = req.body;

    let url = `https://tastedive.com/api/similar?$q=${searchedItem}&type=movies&k=${TD_API_KEY}&info=1`;

    superagent.get(url)
        .then(results => {
            console.log(results);
        })

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
