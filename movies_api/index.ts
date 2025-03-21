import dotenv  from 'dotenv'
import express from 'express';

import healthRouter from './routes/health';
import genresRouter from './routes/genres';
import ratingsRouter from './routes/ratings';
import moviesRouter from './routes/movies';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(logger)

app.get('/', (_, res) => {
  res.send('Welcome to the movie API!');
});

// Register all routes
app.use('/heartbeat', healthRouter);
app.use('/genres', genresRouter);
app.use('/movies', moviesRouter);
app.use('/ratings', ratingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
