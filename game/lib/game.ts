import type { ServerWebSocket } from "bun";
import { users } from "lib/schema";
import { generateId } from "lucia";
import { Deck } from "lib/deck";

// types
type User = typeof users.$inferSelect;
type Socket = ServerWebSocket<any>;

export class Game {
  id = generateId(15);
  deck = new Deck();
  started = false;
  turn = "";

  round = 0; // 0 = pre-flop, 1 = flop, 2 = turn, 3 = river
  step = 0; // 2 when both players have acted

  players = new Map<string, { user: User; socket: Socket }>();

  pot = 0;
  communityCards: string[] = [];
  hands = new Map<string, string[]>();
  lastAction: { action: string; amount: number | null } | null = null;

  constructor() {
    console.log("Game created", this.id);
  }

  start() {
    this.started = true;
    console.log("Game started", this.id);

    // deal hands
    for (const [id] of this.players) {
      this.hands.set(id, this.deck.deal(2));
    }

    // randomly choose player to start
    const playerIds = Array.from(this.players.keys());
    this.turn = playerIds[Math.floor(Math.random() * playerIds.length)];

    this.broadcastState();
  }

  next() {
    this.step++;
    this.turn = this.getOtherPlayer(this.turn)!;

    if (this.step === 2) {
      this.step = 0;
      this.round++;
      this.handleRound();
    }

    this.broadcastState();
  }

  handleRound() {
    switch (this.round) {
      case 1: // flop
        this.communityCards.push(...this.deck.deal(3));
        break;
      case 2: // turn
        this.communityCards.push(...this.deck.deal(1));
        break;
      case 3: // river
        this.communityCards.push(...this.deck.deal(1));
        break;
    }
  }

  handleAction(user: User, action: string, amount: number) {
    console.log(user.username, action, amount || "");
    switch (action) {
      case "bet":
      case "raise":
        this.pot += amount;
        this.step = 0;
        break;
      case "call":
        const otherAmount = this.lastAction?.amount || 0;
        this.pot += otherAmount;
        break;
      case "fold":
        console.log(user.username, "folded");
        this.players.delete(user.id);
        break;
    }
    this.lastAction = { action, amount };
    this.next();
  }

  addPlayer(user: User, socket: Socket) {
    this.players.has(user.id)
      ? console.log(`${user.username} Rejoined`)
      : console.log(`${user.username} Joined`);
    this.players.set(user.id, { user, socket });

    if (this.players.size === 2) {
      this.started ? this.broadcastState() : this.start();
    }
  }

  getOtherPlayer(id: string) {
    for (const [otherId] of this.players) {
      if (otherId !== id) {
        return otherId;
      }
    }
  }

  broadcastState() {
    const globalState = {
      pot: this.pot,
      communityCards: this.communityCards,
      lastAction: this.lastAction,
    };

    for (const [id, { socket }] of this.players) {
      const otherId = this.getOtherPlayer(id);
      const hand = this.hands.get(id);
      const playerState = {
        ...globalState,
        opponent: this.players.get(otherId!)?.user,
        hand,
        turn: this.turn === id,
        evaluation: this.deck.evaluate([...hand!, ...this.communityCards]),
      };
      socket.send(JSON.stringify({ event: "state", data: playerState }));
    }
  }
}
