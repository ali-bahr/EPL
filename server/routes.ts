import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { 
  insertUserSchema, loginSchema, insertStadiumSchema, 
  insertMatchSchema, insertReservationSchema, updateUserSchema 
} from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const requireApproved = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.status !== "approved") {
    return res.status(403).json({ message: "Account not approved" });
  }
  next();
};

const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved" });
    }
    next();
  };
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "egyptian-premier-league-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(data);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      if (user.status === "pending") {
        return res.status(403).json({ message: "Your account is pending approval" });
      }
      
      if (user.status === "rejected") {
        return res.status(403).json({ message: "Your account has been rejected" });
      }
      
      req.session.userId = user.id;
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.patch("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.session.userId!, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/users", requireRole("admin"), async (req, res) => {
    const users = await storage.getAllUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.get("/api/admin/users/pending", requireRole("admin"), async (req, res) => {
    const users = await storage.getPendingUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  });

  app.post("/api/admin/users/:id/approve", requireRole("admin"), async (req, res) => {
    const user = await storage.approveUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.post("/api/admin/users/:id/reject", requireRole("admin"), async (req, res) => {
    const user = await storage.rejectUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  app.delete("/api/admin/users/:id", requireRole("admin"), async (req, res) => {
    const success = await storage.deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  });

  app.get("/api/admin/stats", requireRole("admin"), async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/stadiums", async (req, res) => {
    const stadiums = await storage.getAllStadiums();
    res.json(stadiums);
  });

  app.get("/api/stadiums/:id", async (req, res) => {
    const stadium = await storage.getStadium(req.params.id);
    if (!stadium) {
      return res.status(404).json({ message: "Stadium not found" });
    }
    res.json(stadium);
  });

  app.post("/api/stadiums", requireRole("manager"), async (req, res) => {
    try {
      const data = insertStadiumSchema.parse(req.body);
      const stadium = await storage.createStadium(data);
      res.status(201).json(stadium);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/stadiums/:id", requireRole("manager"), async (req, res) => {
    try {
      const data = insertStadiumSchema.parse(req.body);
      const stadium = await storage.updateStadium(req.params.id, data);
      if (!stadium) {
        return res.status(404).json({ message: "Stadium not found" });
      }
      res.json(stadium);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/stadiums/:id", requireRole("manager"), async (req, res) => {
    const success = await storage.deleteStadium(req.params.id);
    if (!success) {
      return res.status(400).json({ message: "Cannot delete stadium with scheduled matches" });
    }
    res.json({ message: "Stadium deleted" });
  });

  app.get("/api/matches", async (req, res) => {
    const matches = await storage.getAllMatchesWithStadiums();
    res.json(matches);
  });

  app.get("/api/matches/upcoming", async (req, res) => {
    const matches = await storage.getUpcomingMatches();
    res.json(matches);
  });

  app.get("/api/matches/:id", async (req, res) => {
    const match = await storage.getMatchWithStadium(req.params.id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json(match);
  });

  app.post("/api/matches", requireRole("manager"), async (req, res) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      
      const hasConflict = await storage.hasConflictingMatch(data);
      if (hasConflict) {
        return res.status(400).json({ 
          message: "Match conflicts with existing match (same venue or team within 2 hours)" 
        });
      }
      
      const match = await storage.createMatch(data);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/matches/:id", requireRole("manager"), async (req, res) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      
      const hasConflict = await storage.hasConflictingMatch(data, req.params.id);
      if (hasConflict) {
        return res.status(400).json({ 
          message: "Match conflicts with existing match (same venue or team within 2 hours)" 
        });
      }
      
      const match = await storage.updateMatch(req.params.id, data);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/matches/:id", requireRole("manager"), async (req, res) => {
    const success = await storage.deleteMatch(req.params.id);
    if (!success) {
      return res.status(400).json({ message: "Cannot delete match with reservations" });
    }
    res.json({ message: "Match deleted" });
  });

  app.get("/api/manager/stats", requireRole("manager"), async (req, res) => {
    const stats = await storage.getStats();
    const upcomingMatches = await storage.getUpcomingMatches();
    res.json({
      ...stats,
      upcomingMatchesCount: upcomingMatches.length
    });
  });

  app.post("/api/reservations", requireApproved, async (req, res) => {
    try {
      const data = insertReservationSchema.parse(req.body);
      
      const match = await storage.getMatch(data.matchId);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const matchDate = new Date(match.dateTime);
      if (matchDate < new Date()) {
        return res.status(400).json({ message: "Cannot reserve seats for past matches" });
      }
      
      const reservations = await storage.createReservation(req.session.userId!, data);
      res.status(201).json(reservations);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reservations", requireApproved, async (req, res) => {
    const reservations = await storage.getUserReservations(req.session.userId!);
    
    const enriched = await Promise.all(reservations.map(async (r) => {
      const match = await storage.getMatchWithStadium(r.matchId);
      return { ...r, match };
    }));
    
    res.json(enriched);
  });

  app.delete("/api/reservations/:id", requireApproved, async (req, res) => {
    try {
      const success = await storage.cancelReservation(req.params.id, req.session.userId!);
      if (!success) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      res.json({ message: "Reservation cancelled" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/matches/:id/seats", async (req, res) => {
    const reservedSeats = await storage.getReservedSeats(req.params.id);
    res.json(reservedSeats);
  });

  return httpServer;
}
