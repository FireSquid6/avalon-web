export interface QuestWithResult {
  index: number;
  failsRequired: number;
  players: number;
  result: "Success" | "Failure" | "Pending";
  failsGiven: number;
  playersOnQuest: string[];
}

interface QuestListProps {
  quests: QuestWithResult[];
}

export function Quest({ quests }: QuestListProps) {
  const getQuestStatusColor = (result: QuestWithResult["result"]) => {
    switch (result) {
      case "Success": return "text-success";
      case "Failure": return "text-error";
      case "Pending": return "text-base-content";
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
      <h3 className="text-xl font-semibold">Quests</h3>
      <div className="space-y-1">
        {quests.map((quest) => (
          <div>
            <div key={quest.index} className="flex items-center gap-3 text-xs sm:text-sm md:text-md">
              <span className={`font-mono ${getQuestStatusColor(quest.result)}`}>
                {getQuestStatusIcon(quest.result)}
              </span>
              <span className={`font-bold ${getQuestStatusColor(quest.result)}`}>Quest {quest.index + 1}:</span>
              <span className="text-base-content/80">
                {quest.players} players
              </span>
              <span className="text-base-content/60">•</span>
              <span className="text-base-content/80">
                {quest.failsRequired} fail{quest.failsRequired !== 1 ? 's' : ''} required
              </span>
              <span className={`ml-auto font-medium ${getQuestStatusColor(quest.result)}`}>
                {quest.result}{quest.result === "Failure" ? ` with ${quest.failsGiven} fails` : ""}
              </span>
            </div>
            <ul className={`ml-8 list-disc ${getQuestStatusColor(quest.result)}`}>
              {quest.playersOnQuest.map((p, i) => (
                <li className="text-xs sm:text-sm md:text-md" key={i}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
