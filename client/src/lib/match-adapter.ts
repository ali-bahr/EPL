import type { MatchWithStadium } from "@shared/schema";

export interface ApiStadium {
  id: string;
  name: string;
  numberOfRows?: number;
  seatsPerRow?: number;
}

export interface ApiTeam {
  id: string;
  name: string;
  logo?: string;
  stadium?: ApiStadium;
}

export interface ApiOfficial {
  id: string;
  name: string;
  isInternational?: boolean;
  createdAt?: string;
  updatedOn?: string;
}

export interface ApiMatch {
  id: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  stadium?: ApiStadium;
  referee?: ApiOfficial;
  linesman1?: ApiOfficial;
  linesman2?: ApiOfficial;
  scheduledDateTime?: string;
  reservedSeats?: Array<{ row: number; seat: number }>;
}

export interface MatchListResponse {
  items?: ApiMatch[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

const unknownStadium: ApiStadium = {
  id: "",
  name: "Unknown Stadium",
  numberOfRows: 0,
  seatsPerRow: 0,
};

const safeDate = (value?: string) => value || new Date().toISOString();

export function adaptMatch(match: ApiMatch): MatchWithStadium {
  const stadium = match.stadium || match.homeTeam?.stadium || match.awayTeam?.stadium || unknownStadium;

  return {
    id: match.id,
    homeTeamId: match.homeTeam?.id || "",
    awayTeamId: match.awayTeam?.id || "",
    homeTeam: match.homeTeam?.name || "Unknown Team",
    awayTeam: match.awayTeam?.name || "Unknown Team",
    stadiumId: stadium.id || "",
    dateTime: safeDate(match.scheduledDateTime),
    mainRefereeId: match.referee?.id || "",
    linesman1Id: match.linesman1?.id || "",
    linesman2Id: match.linesman2?.id || "",
    mainReferee: match.referee?.name || "TBD",
    linesman1: match.linesman1?.name || "TBD",
    linesman2: match.linesman2?.name || "TBD",
    stadium: {
      id: stadium.id || "",
      name: stadium.name || "Unknown Stadium",
      numberOfRows: stadium.numberOfRows ?? 0,
      seatsPerRow: stadium.seatsPerRow ?? 0,
    },
    reservedSeats: match.reservedSeats || [],
  };
}

export function adaptMatchList(response: MatchListResponse): MatchWithStadium[] {
  console.log("adaptMatchList called with:", response);
  console.log("response.items:", response?.items);
  console.log("items is array?", Array.isArray(response?.items));
  const items = response?.items || [];
  console.log("items to map:", items, "length:", items.length);
  const adapted = items.map(adaptMatch);
  console.log("adapted matches:", adapted);
  return adapted;
}

export interface CreateMatchRequest {
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  refereeId: string;
  linesman1Id: string;
  linesman2Id: string;
  scheduledDateTime: string;
}

export function mapToCreateMatchRequest(
  homeTeamId: string,
  awayTeamId: string,
  stadiumId: string,
  refereeId: string,
  linesman1Id: string,
  linesman2Id: string,
  scheduledDateTime: string
): CreateMatchRequest {
  return {
    homeTeamId,
    awayTeamId,
    stadiumId,
    refereeId,
    linesman1Id,
    linesman2Id,
    scheduledDateTime: new Date(scheduledDateTime).toISOString(),
  };
}
