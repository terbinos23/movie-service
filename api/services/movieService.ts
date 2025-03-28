import path from 'path';

import { Database } from 'sqlite3';
import { Movie } from '../models/movie';
import { MovieDetail } from '../models/movieDetail';
import { getRottenTomatoesScore } from './rottenTomato';

const ratingsDBPath = path.resolve(__dirname,'../db/ratings.db');
let isRatingsDBAttached = false; // Track if the ratings DB is already attached

export const fetchAllMovies = async (db: Database, page: number): Promise<Movie[]> => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        LIMIT ? OFFSET ?;
    `;

    return new Promise((resolve, reject) => {
        db.all(query, [limit, offset], (err: Error | null, movies: Movie[]) => {
            if (err) return reject(err);
            if (movies.length === 0) return resolve([]);

            const formattedMovies = movies.map(movie => ({
                ...movie,
                budget: `$${parseInt(movie.budget).toLocaleString()}`,
            }));
            resolve(formattedMovies);
        });
    });
};

export const fetchMovie = async (db: Database, movieId: string): Promise<Movie | null> => {
    const query = 'SELECT * FROM movies WHERE movieId = ?';

    return new Promise((resolve, reject) => {
        db.all(query, [movieId], (err: Error | null, movies: Movie[]) => {
            if (err) return reject(err);

            if (movies.length === 0) {
                return resolve(null); // No movie found
            }

            // Return the first movie (assuming movieId is unique)
            resolve(movies[0]);
        });
    });
};

export const fetchMovieDetails = async (db: Database, movieId: string): Promise<MovieDetail | null> => {
    const query = 'SELECT * FROM movies WHERE movieId = ?';

    return new Promise((resolve, reject) => {
        // Attach the ratings DB only once during the lifetime of the db connection
        if (!isRatingsDBAttached) {
            db.run(`ATTACH DATABASE '${ratingsDBPath}' AS ratings_db`, (err) => {
                if (err) return reject(`Error attaching database: ${err.message}`);

                isRatingsDBAttached = true; // Mark as attached
                executeQuery(); // Proceed with the query after attaching the DB
            });
        } else {
            executeQuery(); // If already attached, just proceed with the query
        }

        function executeQuery() {
            db.serialize(() => {
                const query = `
                    SELECT 
                        m.imdbId, 
                        m.overview, 
                        m.title, 
                        m.productionCompanies, 
                        m.releaseDate,
                        m.budget,
                        m.runtime, 
                        m.genres,
                        r.rating
                    FROM movies AS m
                    JOIN ratings_db.ratings AS r 
                        ON m.movieId = r.movieId
                    WHERE m.movieId = ?;
                `;
                db.all(query, [movieId], async (err: Error | null, movies: Movie[]) => {
                    if (err) return reject(err);

                    if (movies.length === 0) return resolve(null);

                    const imdbId = movies[0].imdbId;
                    const { rating, ...movieWithoutRatings } = movies[0];

                    try {
                        const rottenTomatoesResponse = await getRottenTomatoesScore(imdbId);
                        
                        const movieDetails: MovieDetail = {
                            ...movieWithoutRatings,
                            language: rottenTomatoesResponse.language,
                            ratings: [
                                {
                                    source: 'Rating API',
                                    score: rating,
                                },
                                {
                                    source: 'Rotten Tomatoes (via OMDB)',
                                    score: rottenTomatoesResponse.rating,
                                },
                            ],
                        };

                        resolve(movieDetails);
                    } catch (err) {
                        reject(`Error fetching Rotten Tomatoes score: ${JSON.stringify(err)}`);
                    }
                    
                });

            });
        }

    });
};

export const fetchMovieByYear = async (db: Database, year: string, page: number): Promise<Movie[] | null> => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        WHERE strftime('%Y', releaseDate) = ?
        ORDER BY releaseDate DESC
        LIMIT ? OFFSET ?;
    `;

    return new Promise((resolve, reject) => {
        db.all(query, [year, limit, offset], (err: Error | null, movies: Movie[]) => {
            if (err) return reject(err);

            if (movies.length === 0) {
                return resolve(null); // No movie found
            }

            // Format the movies data
            const formattedMovies: Movie[] = movies.map(movie => ({
                ...movie,
                budget: `$${movie.budget.toLocaleString()}`,
            }));

            resolve(formattedMovies);
        });
    });
};

export const fetchMovieByGenre = async (db: Database, genre: string, page: number): Promise<Movie[] | null> => {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
        SELECT imdbId, title, genres, releaseDate, budget
        FROM movies
        LIMIT ? OFFSET ?;
    `;

    return new Promise((resolve, reject) => {
        db.all(query, [limit, offset], (err: Error | null, movies: Movie[]) => {
            if (err) return reject(err);

            if (movies.length === 0) {
                return resolve(null); // No movies found
            }

            // Filter the movies based on the genre
            const filteredMovies: Movie[] = movies.filter((movie: Movie) => {
                const genres = JSON.parse(movie.genres);
                // Check if the genre exists in the movie's genres list
                return genres.some((g: any) => g.name.toLowerCase() === genre.toLowerCase());
            }).map(movie => ({
                ...movie,
                budget: `$${movie.budget.toLocaleString()}`,
            }));

            if (filteredMovies.length === 0) {
                return resolve(null);
            }

            resolve(filteredMovies);
        });
    });
};
