import path from 'path';
import { Request, Response, Router } from 'express';

import { openDatabase } from '../db/db';
import { getRating } from '../controllers/ratings';

const router = Router();
const ratingsDB = openDatabase(path.resolve(__dirname,'../db/ratings.db'));

router.get('/:movieId', (req: Request, res: Response) => {
  getRating(ratingsDB, req, res)
});

export default router;
