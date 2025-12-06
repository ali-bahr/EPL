import { z } from "zod";

export const EGYPTIAN_TEAMS = [
  "Al Ahly",
  "Zamalek",
  "Pyramids FC",
  "Al Masry",
  "Ismaily",
  "Ceramica Cleopatra",
  "Future FC",
  "ENPPI",
  "Smouha",
  "El Gouna",
  "National Bank",
  "Pharco",
  "El Mokawloon",
  "Ghazl El Mahalla",
  "ZED FC",
  "Al Ittihad",
  "Baladeyet El Mahalla",
  "Haras El Hodood"
] as const;

export type EgyptianTeam = typeof EGYPTIAN_TEAMS[number];

export type UserRole = "admin" | "manager" | "fan";
export type UserStatus = "pending" | "approved" | "rejected";
export type Gender = "male" | "female";
export type SeatStatus = "available" | "reserved";

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  city: string;
  address?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(["male", "female"]),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address"),
  role: z.enum(["manager", "fan"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Stadium {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
}

export const insertStadiumSchema = z.object({
  name: z.string().min(1, "Stadium name is required"),
  rows: z.number().min(1, "Must have at least 1 row").max(50, "Maximum 50 rows"),
  seatsPerRow: z.number().min(1, "Must have at least 1 seat per row").max(50, "Maximum 50 seats per row"),
});

export type InsertStadium = z.infer<typeof insertStadiumSchema>;

export interface Match {
  id: string;
  homeTeam: EgyptianTeam;
  awayTeam: EgyptianTeam;
  stadiumId: string;
  dateTime: string;
  mainReferee: string;
  linesman1: string;
  linesman2: string;
}

export const insertMatchSchema = z.object({
  homeTeam: z.enum(EGYPTIAN_TEAMS),
  awayTeam: z.enum(EGYPTIAN_TEAMS),
  stadiumId: z.string().min(1, "Stadium is required"),
  dateTime: z.string().min(1, "Date and time is required"),
  mainReferee: z.string().min(1, "Main referee is required"),
  linesman1: z.string().min(1, "First linesman is required"),
  linesman2: z.string().min(1, "Second linesman is required"),
}).refine(data => data.homeTeam !== data.awayTeam, {
  message: "Home team and away team must be different",
  path: ["awayTeam"],
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;

export interface Reservation {
  id: string;
  matchId: string;
  userId: string;
  seatRow: number;
  seatNumber: number;
  ticketNumber: string;
  creditCardLast4: string;
  createdAt: string;
}

export const insertReservationSchema = z.object({
  matchId: z.string().min(1, "Match is required"),
  seats: z.array(z.object({
    row: z.number().min(0),
    seat: z.number().min(0),
  })).min(1, "Select at least one seat"),
  creditCardNumber: z.string().length(16, "Credit card must be 16 digits"),
  creditCardPin: z.string().min(4, "PIN must be at least 4 digits"),
});

export type InsertReservation = z.infer<typeof insertReservationSchema>;

export interface MatchWithStadium extends Match {
  stadium: Stadium;
  reservedSeats: Array<{ row: number; seat: number }>;
}

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(["male", "female"]),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  password: z.string().optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
