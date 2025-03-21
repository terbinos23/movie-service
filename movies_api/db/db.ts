import { Database, OPEN_READONLY } from 'sqlite3';

export const openDatabase = (path: string): Database => {
    const db = new Database(path, OPEN_READONLY, (err: Error | null) => {
        if (err) {
            console.error(`Error opening database at ${path}:`, err.message);
        } else {
            console.log(`Database at ${path} opened successfully`);
        }
    });
    return db;
};
