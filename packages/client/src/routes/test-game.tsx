import { createFileRoute } from '@tanstack/react-router'
import type { GameState } from 'engine'
import type { GameAction } from 'engine/actions'
import { generateKnowledgeMap, getBlankState } from 'engine/logic'
import { processAction, ProcessError } from 'engine/process'
import { useState } from 'react'
import { GameContextProvider } from '../components/GameContext'
import { DebugGameRender } from '../components/GameRender'
import { viewStateAs } from 'engine/view'
import { usePushError } from '../lib/errors'

export const Route = createFileRoute('/test-game')({
  component: RouteComponent,
})


const players = ["Jonathan", "Sarah", "Aidan", "Evie", "Caroline", "Kaela", "Hunter", "Reed"]

function getInitialState() {
  const state = getBlankState("state", "Jonathan", ["Quickshot Assassin", "Lady of the Lake", "Mordred", "Percival and Morgana"], 8);

  for (const p of players) {
    state.players.push({
      id: p,
      displayName: p,
    });

    state.tableOrder.push(p);
  }

  return state;
}

function RouteComponent() {
  const [state, setState] = useState<GameState>(getInitialState());
  const [viewingUser, setViewingUser] = useState<string>("Jonathan");
  const pushError = usePushError();

  const act = (a: GameAction) => {
    const result = processAction({ state, action: a, actorId: viewingUser });

    if (result instanceof ProcessError) {
      pushError(new Error(`Engine error: ${result.type} - ${result.reason}`))
      return;
    }

    setState(result);
  }
  const map = generateKnowledgeMap(state);
  const view = viewStateAs(state, viewingUser);
  const knowledge = map[viewingUser] ?? [];

  return (
    <>
      <GameContextProvider data={{
        state: view,
        knowledge: knowledge,
        viewingUser,
        act,
      }}>
        <DebugGameRender />
      </GameContextProvider>
    </>
  )



}
