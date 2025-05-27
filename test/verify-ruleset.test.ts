import { test, expect } from "bun:test";
import type { Rule } from "@/engine";
import { validateRuleeset } from "@/engine/logic";


const tests: { ruleset: Rule[], players: number, passes: boolean }[] = [
  {
    ruleset: ["Oberon", "Mordred"],
    players: 5,
    passes: false,
  },
  {
    ruleset: ["Mordred"],
    players: 5,
    passes: true,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana"],
    players: 7,
    passes: true,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana"],
    players: 6,
    passes: false,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana"],
    players: 8,
    passes: true,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana", "Oberon"],
    players: 8,
    passes: false,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana", "Oberon"],
    players: 9,
    passes: true,
  },
  {
    ruleset: ["Mordred", "Percival and Morgana", "Oberon"],
    players: 10,
    passes: true,
  },
];


test("Test all rulesets", () => {
  for (const t of tests) {
    const result = validateRuleeset(t.ruleset, t.players);

    if (t.passes) {
      expect(result).toBe(true);
    } else {
      expect(result).not.toBe(true);
    }
  }
});
