import { useGameContext } from "./GameContext";

export function DebugGameRender() {
  const { state, knowledge } = useGameContext();
  const stateJson = JSON.stringify(state, null, 2);
  const knowledgeJson = JSON.stringify(knowledge, null, 2);

  return (
    <div>
      <pre>
        {stateJson}
      </pre>
      <pre>
        {knowledgeJson}
      </pre>
    </div>
  )


}
