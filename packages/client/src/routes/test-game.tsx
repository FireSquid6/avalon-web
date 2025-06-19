import { createFileRoute } from '@tanstack/react-router'
import type { GameState } from 'engine'
import type { GameAction } from 'engine/actions'
import { generateKnowledgeMap, getBlankState } from 'engine/logic'
import { processAction, ProcessError } from 'engine/process'
import { useState } from 'react'
import { GameContextProvider } from '../components/GameContext'
import { DebugGameRender } from '../components/GameRender'
import { usePushError } from '../lib/errors'
import { Modal } from '../components/Modal'
import { DebugActions } from '../components/DebugActions'
import { DropdownInput } from '../components/DropdownInput'
import { GameRender } from '../components/game'
import { viewStateAs } from 'engine/view'

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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pushError = usePushError();

  const act = (a: GameAction) => {
    const result = processAction({ state, action: a, actorId: viewingUser });

    if (result instanceof ProcessError) {
      pushError(new Error(`Engine error: ${result.type} - ${result.reason}`))
      return;
    }

    console.log(result);
    setState(result);
  }

  const batchVote = (vote: "Approve" | "Reject") => {
    let newState = state;
    for (const player of players) {
      const result = processAction({
        state: newState,
        action: {
          kind: "vote",
          vote: vote,
        },
        actorId: player,
      });

      if (result instanceof ProcessError) {
        pushError(new Error(`Engine error: ${result.type} - ${result.reason}`))
        return;
      }
      newState = result;
    }
    setState(newState);
  }

  const map = generateKnowledgeMap(state);
  const knowledge = map[viewingUser] ?? [];
  const view = viewStateAs(state, viewingUser);

  const quickReject = () => {
    batchVote("Reject");
  }

  const quickApprove = () => {
    batchVote("Approve");
  }

  return (
    <GameContextProvider data={{
      state: view,
      knowledge: knowledge,
      viewingUser,
      chat: () => {},
      messages: [],
      act,
    }}>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position="top-left"
        title="Debug Menu"
      >
        <div className="flex flex-col">
          <div className="flex flex-row">
            <button 
              className="btn btn-primary m-2"
              type="button"
              onClick={quickApprove}
            >
              Quick Approve
            </button>
            <button 
              className="btn btn-primary m-2"
              type="button"
              onClick={quickReject}
            >
              Quick Reject
            </button>

          </div>
          <DropdownInput
            label="Selected Player"
            value={viewingUser}
            onChange={(s) => setViewingUser(s)}
            options={players}
          />

          <DebugActions act={act} />

          <DebugGameRender />
        </div>
      </Modal>
      <div className="fixed top-0 right-0">
        <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
          Debug
        </button>
      </div>
      <GameRender />
    </GameContextProvider>
  )



}
