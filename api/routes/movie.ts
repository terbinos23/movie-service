import path from 'path';
import { Request, Response, Router } from 'express';

import { openDatabase } from '../db/db';
import { getAllMovies, getMovie, getMovieDetails, getMoviesByYear, getMoviesByGenre } from '../controllers/movie';


const router = Router();
const moviesDB = openDatabase(path.resolve(__dirname,'../db/movies.db'));

router.get('/all', (req: Request, res: Response) => {
  getAllMovies(moviesDB, req, res)
});

router.get('/:movieId', (req: Request, res: Response) => {
  getMovie(moviesDB, req, res)
});

router.get('/:movieId/details', (req: Request, res: Response) => {
  getMovieDetails(moviesDB, req, res)
});

router.get('/year/:year', (req: Request, res: Response) => {
  getMoviesByYear(moviesDB, req, res)
});

router.get('/genre/:genre', (req: Request, res: Response) => {
  getMoviesByGenre(moviesDB, req, res)
});

export default router;
