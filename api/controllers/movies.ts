import path from 'path';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';
import { getRottenTomatoesScore } from '../services/rottenTomato';
import { Movie } from '../models/movie';
import { MovieDetail } from '../models/movieDetail';

const ratingsDBPath = path.resolve(__dirname,'../db/ratings.db');

export const getAllMovies = (db: Database, req: Request, res: Response): void => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    // SQL query to get the list of movies with the selected columns
    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [limit, offset], (err: Error | null, movies: Movie[]) => {
        if (err) {
            res.status(500).send(JSON.stringify(err));
            return; // Ensure to return after sending a response
        }
        if (movies.length === 0) {
            res.status(404).send('No movies found'); // Send a response for 404
            return; // Ensure to return after sending a response
        }

        // Format the movies data
        const formattedMovies = movies.map(movie => ({
            ...movie,
            // Format the budget in dollars (adding comma separation and dollar sign)
            budget: `$${movie.budget.toLocaleString()}`,
        }));

        res.send(formattedMovies);
  });
};

export const getMovie = (db: Database, req: Request, res: Response): void => {
    const movieId = req.params.movieId;

    if (!movieId) {
        res.status(400).send('Movie ID parameter is required');
        return;
    }
    const query = 'SELECT * FROM movies WHERE movieId = ?';

    db.all(query, [movieId], (err: Error | null, movies:  Movie[]) => {
        if (err) {
            res.status(500).send(JSON.stringify(err));
            return; // Ensure to return after sending a response
        }

        if (movies.length === 0) {
            res.status(404).send('Movie not found'); // Send a response for 404
            return; // Ensure to return after sending a response
        }

        res.send(movies);
    });
};

export const getMovieDetails = (db: Database, req: Request, res: Response): void => {
    // Attaching the ratings database to join
    db.serialize(() => {
        // Attach the second database (ratings.db)
        db.run(`ATTACH DATABASE '${ratingsDBPath}' AS ratings_db`, (err) => {
            if (err) {
                res.status(500).send(`Error attaching database: ${err.message}`);
                return;
            }
            const query = `
                SELECT 
                    m.imdbId, 
                    m.overview, 
                    m.title, 
                    m.productionCompanies, 
                    m.releaseDate, 
                    m.budget,
                    m.language,
                    m.runtime, 
                    m.language, 
                    m.genres,
                    r.rating
                FROM movies AS m
                JOIN ratings_db.ratings AS r 
                    ON m.movieId = r.movieId
                WHERE m.movieId = ?;
            `;
            db.all(query, [req.params.movieId], (err: Error | null, movies: Movie[]) => {
                if (err) {
                    res.status(500).send(JSON.stringify(err));
                    return;
                }
        
                if (movies.length === 0) {
                    res.status(404).send('Movie not found'); // Send a response for 404
                    return;
                }
                const imdbId = movies[0].imdbId;
                const { rating, ...movieWithoutRatings } = movies[0];
                getRottenTomatoesScore(imdbId)
                    .then((rottenTomatoesScore: number) => {
                        const movieDetails: MovieDetail = {
                            ...movieWithoutRatings,
                            ratings: [
                                {
                                    source: 'Rating API',
                                    score: movies[0].rating,
                                },
                                {
                                    source: 'Rotten Tomatoes (via OMDB)',
                                    score: rottenTomatoesScore,
                                },
                            ]
                        };
        
                    res.send(movieDetails);
                })
                .catch((err: any) => {
                    res.status(500).send(`Error fetching Rotten Tomatoes score: ${JSON.stringify(err)}`);
                });
            
            });
        })
    });
    
  };
  
export const getMoviesByYear = (db: Database, req: Request, res: Response): void => {
    const year = req.params.year.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    if (!year) {
        res.status(400).send('Year parameter is required');
        return;
    }

    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        WHERE strftime('%Y', releaseDate) = ?
        ORDER BY releaseDate DESC
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [year, limit, offset], (err: Error | null, movies: Movie[]) => {
        if (err) {
            res.status(500).send(JSON.stringify(err));
            return; // Ensure to return after sending a response
        }
        if (movies.length === 0) {
            res.status(404).send('No movies found'); // Send a response for 404
            return; // Ensure to return after sending a response
        }

        // Format the movies data
        const formattedMovies: Movie[] = movies.map(movie => ({
            ...movie,
            budget: `$${movie.budget.toLocaleString()}`,
        }));

        res.send(formattedMovies);
  });
};

export const getMoviesByGenre = (db: Database, req: Request, res: Response): void => {
    const genre = req.params.genre;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    if (!genre) {
        res.status(400).send('Genre parameter is required');
        return;
    }

    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [limit, offset], (err: Error | null, movies: Movie[]) => {
        if (err) {
            res.status(500).send(JSON.stringify(err));
            return; // Ensure to return after sending a response
        }
        if (movies.length === 0) {
            res.status(404).send('No movies found'); // Send a response for 404
            return; // Ensure to return after sending a response
        }

        // Filter the movies based on the genre
        const filteredMovies = movies.filter((movie: Movie) => {
            const genres = JSON.parse(movie.genres);
            // Check if the genre exists in the movie's genres list
            return genres.some((g: any) => g.name.toLowerCase() === genre.toLowerCase());
        });

        if (filteredMovies.length === 0) {
            res.status(404).send('No movies found for the given genre');
            return;
        }

        // Format the movies data
        const formattedMovies: Movie[] = filteredMovies.map(movie => ({
            ...movie,
            budget: `$${movie.budget.toLocaleString()}`,
        }));

        res.send(formattedMovies);
  });
};
