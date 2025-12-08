import type { Stadium } from "@shared/schema";

export interface ApiStadium {
  id: string;
  name: string;
  numberOfRows: number;
  seatsPerRow: number;
}

export interface StadiumListResponse {
  items?: ApiStadium[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export function adaptStadium(stadium: ApiStadium): Stadium {
  return {
    id: stadium.id,
    name: stadium.name,
    numberOfRows: stadium.numberOfRows ?? 0,
    seatsPerRow: stadium.seatsPerRow ?? 0,
  };
}

export function adaptStadiumList(response: StadiumListResponse): Stadium[] {
  return (response?.items || []).map(adaptStadium);
}

export interface CreateStadiumRequest {
  name: string;
  numberOfRows: number;
  seatsPerRow: number;
}

export function mapToCreateStadiumRequest(
  name: string,
  numberOfRows: number,
  seatsPerRow: number
): CreateStadiumRequest {
  return {
    name,
    numberOfRows,
    seatsPerRow,
  };
}
