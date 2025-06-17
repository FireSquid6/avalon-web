import { useGameContext } from "./GameContext";

export function DebugGameRender() {
  const { state, knowledge } = useGameContext();
  const knowledgeJson = JSON.stringify(knowledge, null, 2);
  const stateJson = JSON.stringify(state, null, 2);

  return (
    <div className="m-4">
      <p className="text-4xl py-8">State:</p>
      <pre className="rounded-lg p-4 bg-base-200">
        {stateJson}
      </pre>
      <p className="text-4xl py-8">Knowledge:</p>
      <pre className="rounded-lg p-4 bg-base-200">
        {knowledgeJson}
      </pre>
    </div>
  )


}
