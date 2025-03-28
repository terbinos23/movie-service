interface Rating {
    source: string;
    score: number;
}

export interface MovieDetail {
    imdbId: string;
    title: string;
    overview: string; // TBD overview may be
    releaseDate: string;
    budget: string;
    runtime: number;
    genres: string;
    language: string;
    productionCompanies: string;
    ratings: Rating[];
}
