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
  userName: string; // Backend uses userName, not username
  username?: string; // Keep for backward compatibility
  password?: string; // Not returned by backend
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string; // Backend returns "Male"/"Female" strings
  city: string;
  address?: string | null;
  email: string;
  roles?: string[]; // Backend returns roles array
  role?: UserRole; // Keep for backward compatibility
  status?: UserStatus; // Optional - backend might not have this
}

export const insertUserSchema = z.object({
  userName: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  gender: z.enum(["Male", "Female"]),
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  email: z.string().email("Invalid email address"),
  role: z.enum(["fan", "manager"]), // For frontend routing only
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface Stadium {
  id: string;
  name: string;
  numberOfRows: number;
  seatsPerRow: number;
}

export const insertStadiumSchema = z.object({
  name: z.string().min(1, "Stadium name is required"),
  numberOfRows: z.number().min(1, "Must have at least 1 row").max(200, "Maximum 200 rows"),
  seatsPerRow: z.number().min(1, "Must have at least 1 seat per row").max(1000, "Maximum 1000 seats per row"),
});

export type InsertStadium = z.infer<typeof insertStadiumSchema>;

export interface Referee {
  id: string;
  name: string;
  isInternational: boolean;
  createdAt: string;
  updatedOn: string;
}

export const insertRefereeSchema = z.object({
  name: z.string().min(1, "Referee name is required"),
  isInternational: z.boolean().default(false),
});

export type InsertReferee = z.infer<typeof insertRefereeSchema>;

export interface Linesman {
  id: string;
  name: string;
  isInternational: boolean;
  createdAt: string;
  updatedOn: string;
}

export const insertLinesmanSchema = z.object({
  name: z.string().min(1, "Linesman name is required"),
  isInternational: z.boolean().default(false),
});

export type InsertLinesman = z.infer<typeof insertLinesmanSchema>;

export interface Team {
  id: string;
  name: string;
  logo: string;
  stadium?: {
    id: string;
    name: string;
    numberOfRows: number;
    seatsPerRow: number;
  };
  stadiumId?: string;
}

export const insertTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  logo: z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
  stadiumId: z.string().min(1, "Stadium is required"),
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  dateTime: string;
  mainRefereeId: string;
  linesman1Id: string;
  linesman2Id: string;
  // Optional: Keep these for backward compatibility or display
  homeTeam?: string;
  awayTeam?: string;
  mainReferee?: string;
  linesman1?: string;
  linesman2?: string;
}

export const insertMatchSchema = z.object({
  homeTeamId: z.string().min(1, "Home team is required"),
  awayTeamId: z.string().min(1, "Away team is required"),
  stadiumId: z.string().min(1, "Stadium is required"),
  dateTime: z.string().min(1, "Date and time is required"),
  mainRefereeId: z.string().min(1, "Main referee is required"),
  linesman1Id: z.string().min(1, "First linesman is required"),
  linesman2Id: z.string().min(1, "Second linesman is required"),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
  message: "Home team and away team must be different",
  path: ["awayTeamId"],
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
