import { Database } from "sqlite3";

export const fetchRatings = async (db: Database, movieId: string): Promise<null | any[]> => {
    const query = 'SELECT * FROM ratings WHERE movieId = ?';

    return new Promise((resolve, reject) => {
        db.all(query, [movieId], (err: Error | null, ratings: any[]) => {
            if (err) return reject(err);

            if (ratings.length === 0) return resolve(null);
        
            resolve(ratings);
        });
    });
    
};