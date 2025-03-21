import path from 'path';
import { Request, Response, Router } from 'express';

import { openDatabase } from '../db/db';
import { getGenreList } from '../controllers/genres';

const router = Router();
const moviesDB = openDatabase(path.resolve(__dirname,'../db/movies.db'));

router.get('/all', (req: Request, res: Response) => { 
  getGenreList(moviesDB, req, res)
});

export default router;
