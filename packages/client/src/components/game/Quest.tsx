export interface QuestWithResult {
  index: number;
  failsRequired: number;
  players: number;
  result: "Success" | "Failure" | "Pending";
}

interface QuestListProps {
  quests: QuestWithResult[];
}

export function Quest({ quests }: QuestListProps) {
  const getQuestStatusColor = (result: QuestWithResult["result"]) => {
    switch (result) {
      case "Success": return "text-success";
      case "Failure": return "text-error";
      case "Pending": return "text-base-content/60";
    }
  };

  const getQuestStatusIcon = (result: QuestWithResult["result"]) => {
    switch (result) {
      case "Success": return "✓";
      case "Failure": return "✗";
      case "Pending": return "○";
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Quests</h3>
      <div className="space-y-1">
        {quests.map((quest) => (
          <div key={quest.index} className="flex items-center gap-3 text-sm">
            <span className={`font-mono ${getQuestStatusColor(quest.result)}`}>
              {getQuestStatusIcon(quest.result)}
            </span>
            <span className="font-medium">Quest {quest.index + 1}:</span>
            <span className="text-base-content/80">
              {quest.players} player{quest.players !== 1 ? 's' : ''}
            </span>
            <span className="text-base-content/60">•</span>
            <span className="text-base-content/80">
              {quest.failsRequired} fail{quest.failsRequired !== 1 ? 's' : ''} required
            </span>
            <span className={`ml-auto font-medium ${getQuestStatusColor(quest.result)}`}>
              {quest.result}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
