interface VoteTrackerProps {
  failedVotes: number;
}

export function VoteTracker({ failedVotes }: VoteTrackerProps) {
  const maxVotes = 4;
  
  return (
    <div className="space-y-2 my-8">
      <h3 className="text-lg font-semibold">Vote Tracker</h3>
      <div className="flex items-center gap-2">
        {Array.from({ length: maxVotes }, (_, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
              index < failedVotes
                ? "bg-error text-error-content border-error"
                : "bg-base-200 text-base-content/40 border-base-300"
            }`}
          >
            {index + 1}
          </div>
        ))}
        <span className="ml-2 text-sm text-base-content/80">
          {failedVotes}/{maxVotes} failed votes
        </span>
      </div>
      {failedVotes >= maxVotes && (
        <div className="text-error text-sm font-medium">
          Vote limit reached - Evil wins!
        </div>
      )}
    </div>
  );
}
