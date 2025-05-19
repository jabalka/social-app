import type { NextApiResponseServerIO } from "@/types/socket";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { Server as IOServer, Socket } from "socket.io";

const SECRET = process.env.NEXTAUTH_SECRET;
console.log("[WebSocket] API Route Loaded Successfully");

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("[WebSocket] Initializing Socket.IO server...");

    const httpServer = res.socket.server as unknown as HTTPServer;
    const io = new IOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.use(async (socket: Socket, next) => {
      try {
        // Get the raw cookie header from the handshake.
        const cookieHeader = socket.handshake.headers.cookie || "";
        console.log("[Socket] Handshake cookies:", cookieHeader);

        // Parse cookies into a key/value object.
        const parsedCookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return [name, rest.join("=")];
          })
        );

        // Try to get a non-split token first.
        let fullToken = parsedCookies["authjs.session-token"];
        if (!fullToken) {
          const tokenParts = Object.keys(parsedCookies).filter((key) =>
            key.startsWith("authjs.session-token.")
          );
          if (tokenParts.length > 0) {
            tokenParts.sort((a, b) => {
              const aIndex = parseInt(a.split(".").pop() || "0", 10);
              const bIndex = parseInt(b.split(".").pop() || "0", 10);
              return aIndex - bIndex;
            });
            fullToken = tokenParts.map((key) => parsedCookies[key]).join("");
          }
        }
        console.log("[Socket] Reassembled token:", fullToken);

        // Reconstruct the cookie header for getToken.
        const customCookieHeader = fullToken
          ? `authjs.session-token=${fullToken}`
          : cookieHeader;

        // Optionally, try passing { raw: true } to getToken for debugging.
        const token = await getToken({
          req: { headers: { cookie: customCookieHeader } },
          secret: SECRET,
        });
        const tokenRaw = await getToken({
          req: { headers: { cookie: customCookieHeader } },
          secret: SECRET,
          raw: true,
        });
        console.log("[Socket] Raw getToken result:", tokenRaw);

        
        if (!token) {
          console.log("[Socket] Unauthorized connection attempt");
          return next(new Error("Unauthorized"));
        }
        socket.data.user = {
          id: token.sub,
          email: token.email,
          name: token.name,
        };

        console.log(`[Socket] Authenticated: ${socket.data.user.email}`);
        next();
      } catch (error) {
        console.error("[Socket] Authentication error:", error);
        next(new Error("Internal server error"));
      }
    });

    io.on("connection", (socket) => {
      console.log(`[Socket Connected] ${socket.id} (user: ${socket.data.user?.email})`);
      socket.on("join:conversation", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`[Socket] ${socket.data.user.email} joined ${conversationId}`);
      });
      socket.on("leave:conversation", (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`[Socket] ${socket.data.user.email} left ${conversationId}`);
      });
      socket.on("message:send", (messageData) => {
        const { conversationId } = messageData;
        io.to(conversationId).emit("message:new", {
          ...messageData,
          sender: socket.data.user,
        });
      });
      socket.on("message:read", ({ conversationId, userId }) => {
        socket.to(conversationId).emit("message:read", {
          conversationId,
          userId,
          readAt: new Date().toISOString(),
        });
      });
      socket.on("disconnect", () => {
        console.log(`[Socket] Disconnected: ${socket.id} (${socket.data.user?.email})`);
      });
    });
    res.socket.server.io = io;
  }

  res.end();
}