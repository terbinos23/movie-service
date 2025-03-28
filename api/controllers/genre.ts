import { Database } from 'sqlite3';
import { Request, Response } from 'express';

import { fetchAllGenres } from '../services/genreService';

export const getAllGenres = async (db: Database, _: Request, res: Response): Promise<void> => {
    try {
        const genres = await fetchAllGenres(db);

        if (!genres) {
            res.status(404).send('No genres found');
            return;
        }

        res.status(200).send(genres);
    } catch (err) {
        res.status(500).json(JSON.stringify(err));
    }
    
};
