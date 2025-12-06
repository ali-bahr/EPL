import { 
  type User, type InsertUser, type UpdateUser,
  type Stadium, type InsertStadium,
  type Match, type InsertMatch, type MatchWithStadium,
  type Reservation, type InsertReservation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  approveUser(id: string): Promise<User | undefined>;
  rejectUser(id: string): Promise<User | undefined>;

  getStadium(id: string): Promise<Stadium | undefined>;
  createStadium(stadium: InsertStadium): Promise<Stadium>;
  updateStadium(id: string, data: InsertStadium): Promise<Stadium | undefined>;
  deleteStadium(id: string): Promise<boolean>;
  getAllStadiums(): Promise<Stadium[]>;

  getMatch(id: string): Promise<Match | undefined>;
  getMatchWithStadium(id: string): Promise<MatchWithStadium | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, data: InsertMatch): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;
  getAllMatches(): Promise<Match[]>;
  getAllMatchesWithStadiums(): Promise<MatchWithStadium[]>;
  getUpcomingMatches(): Promise<MatchWithStadium[]>;
  hasConflictingMatch(match: InsertMatch, excludeId?: string): Promise<boolean>;

  getReservation(id: string): Promise<Reservation | undefined>;
  createReservation(userId: string, data: InsertReservation): Promise<Reservation[]>;
  cancelReservation(id: string, userId: string): Promise<boolean>;
  getUserReservations(userId: string): Promise<Reservation[]>;
  getMatchReservations(matchId: string): Promise<Reservation[]>;
  getReservedSeats(matchId: string): Promise<Array<{ row: number; seat: number }>>;
  isSeatReserved(matchId: string, row: number, seat: number): Promise<boolean>;

  getStats(): Promise<{
    totalUsers: number;
    pendingUsers: number;
    totalMatches: number;
    totalReservations: number;
    totalStadiums: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stadiums: Map<string, Stadium>;
  private matches: Map<string, Match>;
  private reservations: Map<string, Reservation>;

  constructor() {
    this.users = new Map();
    this.stadiums = new Map();
    this.matches = new Map();
    this.reservations = new Map();
    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: "admin123",
      firstName: "System",
      lastName: "Administrator",
      birthDate: "1990-01-01",
      gender: "male",
      city: "Cairo",
      email: "admin@epl.eg",
      role: "admin",
      status: "approved"
    });

    const stadium1Id = randomUUID();
    const stadium2Id = randomUUID();
    this.stadiums.set(stadium1Id, {
      id: stadium1Id,
      name: "Cairo International Stadium",
      rows: 10,
      seatsPerRow: 20
    });
    this.stadiums.set(stadium2Id, {
      id: stadium2Id,
      name: "Borg El Arab Stadium",
      rows: 8,
      seatsPerRow: 15
    });

    const now = new Date();
    const match1Date = new Date(now);
    match1Date.setDate(match1Date.getDate() + 7);
    const match2Date = new Date(now);
    match2Date.setDate(match2Date.getDate() + 14);

    const match1Id = randomUUID();
    const match2Id = randomUUID();
    this.matches.set(match1Id, {
      id: match1Id,
      homeTeam: "Al Ahly",
      awayTeam: "Zamalek",
      stadiumId: stadium1Id,
      dateTime: match1Date.toISOString(),
      mainReferee: "Ibrahim Nour El Din",
      linesman1: "Mahmoud Ashour",
      linesman2: "Ahmed Hassan"
    });
    this.matches.set(match2Id, {
      id: match2Id,
      homeTeam: "Pyramids FC",
      awayTeam: "Al Masry",
      stadiumId: stadium2Id,
      dateTime: match2Date.toISOString(),
      mainReferee: "Mohamed El Banna",
      linesman1: "Khaled Mahmoud",
      linesman2: "Tarek Magdy"
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      status: "pending"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: UpdateUser): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      gender: data.gender,
      city: data.city,
      address: data.address,
      ...(data.password && { password: data.password })
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getPendingUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.status === "pending");
  }

  async approveUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    user.status = "approved";
    this.users.set(id, user);
    return user;
  }

  async rejectUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    user.status = "rejected";
    this.users.set(id, user);
    return user;
  }

  async getStadium(id: string): Promise<Stadium | undefined> {
    return this.stadiums.get(id);
  }

  async createStadium(stadium: InsertStadium): Promise<Stadium> {
    const id = randomUUID();
    const newStadium: Stadium = { ...stadium, id };
    this.stadiums.set(id, newStadium);
    return newStadium;
  }

  async updateStadium(id: string, data: InsertStadium): Promise<Stadium | undefined> {
    const stadium = this.stadiums.get(id);
    if (!stadium) return undefined;
    const updated: Stadium = { ...stadium, ...data };
    this.stadiums.set(id, updated);
    return updated;
  }

  async deleteStadium(id: string): Promise<boolean> {
    const hasMatches = Array.from(this.matches.values()).some(m => m.stadiumId === id);
    if (hasMatches) return false;
    return this.stadiums.delete(id);
  }

  async getAllStadiums(): Promise<Stadium[]> {
    return Array.from(this.stadiums.values());
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchWithStadium(id: string): Promise<MatchWithStadium | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    const stadium = this.stadiums.get(match.stadiumId);
    if (!stadium) return undefined;
    const reservedSeats = await this.getReservedSeats(id);
    return { ...match, stadium, reservedSeats };
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const newMatch: Match = { ...match, id };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async updateMatch(id: string, data: InsertMatch): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    const updated: Match = { ...match, ...data };
    this.matches.set(id, updated);
    return updated;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const hasReservations = Array.from(this.reservations.values()).some(r => r.matchId === id);
    if (hasReservations) return false;
    return this.matches.delete(id);
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async getAllMatchesWithStadiums(): Promise<MatchWithStadium[]> {
    const matches = Array.from(this.matches.values());
    const result: MatchWithStadium[] = [];
    for (const match of matches) {
      const stadium = this.stadiums.get(match.stadiumId);
      if (stadium) {
        const reservedSeats = await this.getReservedSeats(match.id);
        result.push({ ...match, stadium, reservedSeats });
      }
    }
    return result.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  async getUpcomingMatches(): Promise<MatchWithStadium[]> {
    const all = await this.getAllMatchesWithStadiums();
    const now = new Date();
    return all.filter(m => new Date(m.dateTime) > now);
  }

  async hasConflictingMatch(match: InsertMatch, excludeId?: string): Promise<boolean> {
    const matchDate = new Date(match.dateTime);
    const twoHours = 2 * 60 * 60 * 1000;
    
    for (const existing of this.matches.values()) {
      if (excludeId && existing.id === excludeId) continue;
      
      const existingDate = new Date(existing.dateTime);
      const timeDiff = Math.abs(matchDate.getTime() - existingDate.getTime());
      
      if (timeDiff < twoHours) {
        if (existing.stadiumId === match.stadiumId) return true;
        if (existing.homeTeam === match.homeTeam || existing.awayTeam === match.homeTeam) return true;
        if (existing.homeTeam === match.awayTeam || existing.awayTeam === match.awayTeam) return true;
      }
    }
    return false;
  }

  async getReservation(id: string): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async createReservation(userId: string, data: InsertReservation): Promise<Reservation[]> {
    const reservations: Reservation[] = [];
    
    for (const seat of data.seats) {
      const isReserved = await this.isSeatReserved(data.matchId, seat.row, seat.seat);
      if (isReserved) {
        throw new Error(`Seat ${seat.row + 1}-${seat.seat + 1} is already reserved`);
      }
    }

    for (const seat of data.seats) {
      const id = randomUUID();
      const ticketNumber = `EPL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const reservation: Reservation = {
        id,
        matchId: data.matchId,
        odId: userId,
        seatRow: seat.row,
        seatNumber: seat.seat,
        ticketNumber,
        creditCardLast4: data.creditCardNumber.slice(-4),
        createdAt: new Date().toISOString()
      };
      this.reservations.set(id, reservation);
      reservations.push(reservation);
    }
    
    return reservations;
  }

  async cancelReservation(id: string, userId: string): Promise<boolean> {
    const reservation = this.reservations.get(id);
    if (!reservation) return false;
    if (reservation.odId !== userId) return false;
    
    const match = this.matches.get(reservation.matchId);
    if (!match) return false;
    
    const matchDate = new Date(match.dateTime);
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    
    if (matchDate.getTime() - now.getTime() < threeDays) {
      throw new Error("Cannot cancel reservation within 3 days of match");
    }
    
    return this.reservations.delete(id);
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(r => r.odId === userId);
  }

  async getMatchReservations(matchId: string): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(r => r.matchId === matchId);
  }

  async getReservedSeats(matchId: string): Promise<Array<{ row: number; seat: number }>> {
    const reservations = await this.getMatchReservations(matchId);
    return reservations.map(r => ({ row: r.seatRow, seat: r.seatNumber }));
  }

  async isSeatReserved(matchId: string, row: number, seat: number): Promise<boolean> {
    const reservations = await this.getMatchReservations(matchId);
    return reservations.some(r => r.seatRow === row && r.seatNumber === seat);
  }

  async getStats(): Promise<{
    totalUsers: number;
    pendingUsers: number;
    totalMatches: number;
    totalReservations: number;
    totalStadiums: number;
  }> {
    const users = Array.from(this.users.values());
    return {
      totalUsers: users.length,
      pendingUsers: users.filter(u => u.status === "pending").length,
      totalMatches: this.matches.size,
      totalReservations: this.reservations.size,
      totalStadiums: this.stadiums.size
    };
  }
}

export const storage = new MemStorage();
