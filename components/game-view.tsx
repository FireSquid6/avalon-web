import { GameState, Knowledge } from "@/lib/engine";
import { GameAction } from "@/lib/engine/actions";
import { ProcessError } from "@/lib/engine/process";

interface GameViewProps {
  knowledge: Knowledge[];
  state: GameState;
  error: ProcessError | null;
  dispatchAction: (action: GameAction) => void;
}

export function GameView({ knowledge, state, dispatchAction, error }: GameViewProps) {
  const knowledgeJson = JSON.stringify(knowledge);
  const stateJson = JSON.stringify(state);
  const errorJson = JSON.stringify(error);

  return (
    <div className="m-4 p-4 flex flex-col">
      <h2 className="text-2xl">Game State</h2>
      <div className="mockup-code w-full">
        <pre>
          {stateJson}
        </pre>
      </div>
      <h2 className="text-2xl">My Knowledge:</h2>
      <div className="mockup-code w-full">
        <pre>
          {knowledgeJson}
        </pre>
      </div>
      <h2 className="text-2xl">Actions:</h2>
      <div className="flex flex-row">
        <div className="flex flex-col">
          <button className="btn" onClick={() => {
            dispatchAction({
              kind: "start",
            });
          }}>
            Start Game
          </button>
        </div>

        <div className="flex flex-col">
          <button className="btn" onClick={() => {
            dispatchAction({
              kind: "vote",
              vote: "Approve"
            });
          }}>
            Vote Yes
          </button>
          <button className="btn" onClick={() => {
            dispatchAction({
              kind: "vote",
              vote: "Reject"
            });
          }}>
            Reject Vote
          </button>
        </div>
        <div className="flex flex-col">
          <button className="btn" onClick={() => {
            dispatchAction({
              kind: "quest",
              action: "Succeed",
            });
          }}>
            Succeed Quest
          </button>
          <button className="btn" onClick={() => {
            dispatchAction({
              kind: "quest",
              action: "Fail",
            });
          }}>
            Reject Vote
          </button>
        </div>
      </div>
      <h2 className="text-2xl">Errors:</h2>
      <div className="mockup-code w-full">
        <pre>
          {errorJson}
        </pre>
      </div>

    </div>
  )

}
