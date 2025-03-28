import { Database } from 'sqlite3';
import { Request, Response } from 'express';

import { fetchRatings } from '../services/ratingService';

export const getRatings = async (db: Database, req: Request, res: Response): Promise<void> => {
    try {
        const movieId = req.params.movieId;

        if (!movieId) {
            res.status(400).send('Movie ID parameter is required');
            return;
        }

        const rating = await fetchRatings(db, movieId);

        if (!rating) {
            res.status(404).send('No rating found');
            return;
        }

        res.status(200).send(rating);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
    
};
