import { getBlankState } from "@/lib/engine/logic";
import { test, expect } from "bun:test";


test("Works with a simple five player game", () => {
  const basicState = getBlankState("game-1", "jon", []);
})

// works with lady of the lake

