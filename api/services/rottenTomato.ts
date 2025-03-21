import dotenv  from 'dotenv'
import axios from 'axios';

dotenv.config();

const baseUrl = process.env.OMDB_BASE_URL;
const apikey = process.env.OMDB_API_KEY;

export const getRottenTomatoesScore = async (imdbId: string) => {
  try {
    const response = await axios.get(`${baseUrl}/?i=${imdbId}&apikey=${apikey}`);
    const data = response.data;
    if (data.Ratings) {
      const rottenTomatoesRating = data.Ratings.find((rating: any) => rating.Source === 'Rotten Tomatoes');
      return rottenTomatoesRating ? rottenTomatoesRating.Value : 'N/A';
    }
    return 'N/A';
  } catch (error) {
    console.error('Error fetching Rotten Tomatoes score: ', error);
    return 'N/A';
  }
};