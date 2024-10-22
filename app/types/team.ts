export interface NHLTeam {
    abbrev: string;
    awaySplitSquad: boolean;
    darkLogo: string;
    id: number;
    logo: string;
    placeName: {
        default: string;
    };
    placeNameWithPreposition: {
        default: string;
        fr: string;
    };
    radioLink: string;
    score: number;
}