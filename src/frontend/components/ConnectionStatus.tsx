

export interface ConnectionStatusProps {
  connected: boolean;
  gameId: string;
  onReconnect: () => void;
}

export function ConnectionStatus({ connected, gameId, onReconnect }: ConnectionStatusProps) {
  const words = connected ? "Connected to game" : "Disconnected from game"
  return (
    <div className="flex flex-row mx-4 align-middle my-auto">
      <span className="my-auto">{words}</span>
      <span className="font-mono bg-base-300 mx-2 p-1 rounded-lg">
        {gameId}
      </span>
      {connected ? (
        <></>
      ) : (
        <button
          className="mx-2 btn-sm btn"
          onClick={onReconnect}
        >
          Reconnect
        </button>

      )}
    </div>
  )
}
