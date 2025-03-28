import path from 'path';
import { Request, Response, Router } from 'express';

import { openDatabase } from '../db/db';
import { getRatings } from '../controllers/rating';

const router = Router();
const ratingsDB = openDatabase(path.resolve(__dirname,'../db/ratings.db'));

router.get('/:movieId', (req: Request, res: Response) => {
  getRatings(ratingsDB, req, res)
});

export default router;
