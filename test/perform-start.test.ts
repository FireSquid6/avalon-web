import { GameState, Knowledge } from "@/lib/engine";
import { getBlankState, insertPlayer } from "@/lib/engine/logic";
import { performStart } from "@/lib/engine/mutators";
import { test, expect } from "bun:test";


test("Works with a simple five player game", () => {
  const basicState = getBlankState("game-1", "player-0", []);
  const knowledge: Record<string, Knowledge[]> = {};
  insertNPlayers(basicState, 5);

  performStart({
    state: basicState,
    knowledge,
    action: { kind: "start" },
    actorId: "player-0",
  });

  expect(Object.keys(knowledge).length).toBe(5);
});

// works with an 8 player game

// works with lady of the lake

function insertNPlayers(state: GameState, n: number) {
  for (let i = 0; i < n; i++) {
    insertPlayer(state, {
      id: `player-${i}`,
      displayName: `Player #${i}`,
    });
  }
}
