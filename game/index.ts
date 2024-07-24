import type { ServerWebSocket } from "bun";
import { lucia } from "lib/auth";
import { db } from "lib/db";
import { users } from "lib/schema";
import { Game } from "lib/game";

// types
type User = typeof users.$inferSelect;
type Socket = ServerWebSocket<any>;

// queue is set of users and their websocket connection
const userToGame = new Map<string, string>();
const games = new Map<string, Game>();
const queue = new Map<Socket, User>();

// Handle incoming messages
const handleMessage = async (
  ws: Socket,
  user: User,
  event: string,
  data: any,
) => {
  switch (event) {
    case "join":
      console.log(user.username, "buying in for", data);
      queue.set(ws, user);

      if (queue.size === 2) {
        const game = new Game();
        games.set(game.id, game);
        for (const [ws, user] of queue) {
          userToGame.set(user.id, game.id);
          ws.send(JSON.stringify({ event: "start", data: game.id }));
        }
        queue.clear();
      }
      break;

    case "bet":
    case "fold":
    case "call":
    case "check":
    case "raise":
      const gameId = userToGame.get(user.id);
      if (!gameId || !games.has(gameId)) return;
      const game = games.get(gameId);
      if (game && game.turn === user.id) {
        game.handleAction(user, event, data);
      }
      break;
  }
};

const server = Bun.serve({
  async fetch(request, server) {
    // Check if the request is authenticated
    const cookies = request.headers.get("Cookie");
    const sessionId = lucia.readSessionCookie(cookies ?? "");
    if (!sessionId) return new Response("Unauthorized", { status: 401 });
    const { user, session } = await lucia.validateSession(sessionId);
    if (!session) return new Response("Unauthorized", { status: 401 });

    // get id from the url query params
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || null;

    // Upgrade the request to a websocket connection
    if (server.upgrade(request, { data: { user, id } })) {
      return;
    }

    return new Response("Upgrade failed", { status: 5000 });
  },

  websocket: {
    message(ws, message) {
      const { user, id } = ws.data as { user: User; id: string | null };
      if (!user) return;
      const { event, data } = JSON.parse(message as string);
      handleMessage(ws, user, event, data);
    },

    open(ws) {
      const { user, id } = ws.data as { user: User; id: string | null };
      console.log("Client connected:", user?.username);
      if (id) {
        const game = games.get(id);
        if (game && game.id == userToGame.get(user.id)) {
          game.addPlayer(user, ws);
        } else {
          console.log("Game not found", id);
          ws.send(JSON.stringify({ event: "error", data: "Game not found" }));
        }
      }
    },

    close(ws) {
      const { user, id } = ws.data as { user: User; id: string | null };
      if (queue.has(ws)) queue.delete(ws);
      console.log("Client disconnected:", user?.username);
    },
  },
});

console.log("Server started at", server.url.href);
