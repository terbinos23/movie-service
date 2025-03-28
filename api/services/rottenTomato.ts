import dotenv  from 'dotenv'
import axios from 'axios';

dotenv.config();

const baseUrl = process.env.OMDB_BASE_URL;
const apikey = process.env.OMDB_API_KEY;

interface rottenTomatoData {
  rating: number,
  language: string
}

export const getRottenTomatoesScore = async (imdbId: string): Promise<rottenTomatoData> => {
  try {
    const response = await axios.get(`${baseUrl}/?i=${imdbId}&apikey=${apikey}`);
    const data = response.data;
    let rottenTomatoData: rottenTomatoData = {
      rating: 0,
      language: 'None'
    };

    if (data.Ratings) {
      const rottenTomatoesRating = data.Ratings.find((rating: any) => rating.Source === 'Rotten Tomatoes');
      rottenTomatoData.rating = rottenTomatoesRating ? rottenTomatoesRating.Value : 0;
    }
    if (data.Language) {
      rottenTomatoData.language = data.Language;
    }

    return rottenTomatoData;
    
  } catch (error) {
    console.error('Error fetching Rotten Tomatoes score: ', error);
    return {rating: 0, language: 'None'};
  }
};