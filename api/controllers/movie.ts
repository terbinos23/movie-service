import { Database } from 'sqlite3';
import { Request, Response } from 'express';

import { fetchAllMovies, fetchMovie, fetchMovieByGenre, fetchMovieByYear, fetchMovieDetails } from '../services/movieService';


export const getAllMovies = async (db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;

        const movies = await fetchAllMovies(db, page);

        if (movies.length === 0) {
            res.status(404).send('No movies found');
            return;
        }

        res.status(200).send(movies);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
};

export const getMovie = async(db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const movieId = req.params.movieId;

        if (!movieId) {
            res.status(400).send('Movie ID parameter is required');
            return;
        }

        const movie = await fetchMovie(db, movieId);

        if (!movie) {
            res.status(404).send('No movies found');
            return;
        }

        res.status(200).send(movie);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
    
};

export const getMovieDetails = async (db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const movieId = req.params.movieId;

        if (!movieId) {
            res.status(400).send('Movie ID parameter is required');
            return;
        }

        const movieDetail = await fetchMovieDetails(db, movieId);

        if (!movieDetail) {
            res.status(404).send('No movie found');
            return;
        }

        res.status(200).send(movieDetail);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }

};
  
export const getMoviesByYear = async(db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const year = req.params.year.toString();
        const page = parseInt(req.query.page as string) || 1;

        if (!year) {
            res.status(400).send('Year parameter is required');
            return;
        }

        const movie = await fetchMovieByYear(db, year, page);

        if (!movie) {
            res.status(404).send('No movies found');
            return;
        }

        res.status(200).send(movie);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
   
};

export const getMoviesByGenre = async (db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const genre = req.params.genre;
        const page = parseInt(req.query.page as string) || 1;

        if (!genre) {
            res.status(400).send('Genre parameter is required');
            return;
        }

        const movie = await fetchMovieByGenre(db, genre, page);

        if (!movie) {
            res.status(404).send('No movies found');
            return;
        }

        res.status(200).send(movie);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
};
