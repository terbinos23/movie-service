import { Database } from "sqlite3";

export const fetchAllGenres = async (db: Database): Promise<null | any[]> => {
    const query = 'SELECT * FROM movies;';

    return new Promise((resolve, reject) => {
        db.all(query, [], (err: Error | null, rows: any[]) => {
            if (err) return reject(err);

            if (rows.length === 0) return resolve(null);
            
            const genreList: any[] = [];

            for (const row of rows) {
                const genres = JSON.parse(row.genres);
                for (const genre of genres) {
                    if (!genreList.find(listItem => listItem.name === genre.name)) {
                        genreList.push(genre);
                    }
                }
            }
            resolve(genreList);
        });
    });
};