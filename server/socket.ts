import { Server } from "socket.io";
import { storage } from "./storage";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a match room
    socket.on("join-match", (matchId: string) => {
      socket.join(`match:${matchId}`);
      console.log(`Client ${socket.id} joined match:${matchId}`);
    });

    // Leave a match room
    socket.on("leave-match", (matchId: string) => {
      socket.leave(`match:${matchId}`);
      console.log(`Client ${socket.id} left match:${matchId}`);
    });

    // Request current reserved seats for a match
    socket.on("get-reserved-seats", async (matchId: string) => {
      const reservedSeats = await storage.getReservedSeats(matchId);
      socket.emit("reserved-seats-updated", { matchId, reservedSeats });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

// Helper function to broadcast seat updates
export function broadcastSeatUpdate(io: Server, matchId: string, reservedSeats: Array<{ row: number; seat: number }>) {
  io.to(`match:${matchId}`).emit("reserved-seats-updated", { matchId, reservedSeats });
}
