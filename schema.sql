DROP TABLE IF EXISTS movies;

CREATE movies(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    type VARCHAR(255),
    teaser VARCHAR(255),
    wiki_URL VARCHAR(255),
    youtube_URL VARCHAR(255)
);