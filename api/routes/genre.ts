import path from 'path';
import { Request, Response, Router } from 'express';

import { openDatabase } from '../db/db';
import { getAllGenres } from '../controllers/genre';

const router = Router();
const moviesDB = openDatabase(path.resolve(__dirname,'../db/movies.db'));

router.get('/all', (req: Request, res: Response) => { 
  getAllGenres(moviesDB, req, res)
});

export default router;
