import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getRating = (db: Database, req: Request, res: Response): void => {
    const movieId = req.params.movieId;

    if (!movieId) {
        res.status(400).send('Movie ID parameter is required');
        return;
    }
    const query = 'SELECT * FROM ratings WHERE movieId = ?';

    db.all(query, [movieId], (err: Error | null, rows: any[]) => {
        if (err) {
            res.status(500).send(JSON.stringify(err));
            return; // Ensure to return after sending a response
        }

        if (rows.length === 0) {
            res.status(404).send('No ratings found'); // Send a response for 404
            return; // Ensure to return after sending a response
        }

        res.send(rows);
    });
};
