export class Deck {
  cards: string[] = [];
  constructor() {
    const ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "T",
      "J",
      "Q",
      "K",
      "A",
    ];
    const suits = ["h", "d", "c", "s"];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(rank + suit);
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(i: number = 1) {
    return this.cards.splice(0, i);
  }

  evaluate(hand: string[]) {}
}
