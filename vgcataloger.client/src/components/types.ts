export interface Game {
    id: number;
    title: string;
    developers: string[];
    publishers: string[];
    platforms: string[];
    genres: string[];
    tags: string[];
    releaseDate: string;
    statuses: string[];
    userRating?: number;
    catalogs: string[];
    steamAppId?: number;
}

export interface PagedResult {
    items: Game[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface SteamApp {
    appid: number;
    name: string;
}
