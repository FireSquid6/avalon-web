import type { GameAction } from "engine/actions";
import type { Player, Rule } from "engine";
import { VoteActionComponent } from "./VoteAction";
import { NominateActionComponent } from "./NominateAction";
import { QuestActionComponent } from "./QuestAction";
import { LadyActionComponent } from "./LadyAction";
import { AssassinateActionComponent } from "./AssassinateAction";
import { StartActionComponent } from "./StartAction";
import { RulesetModificationActionComponent } from "./RulesetModificationAction";
import { AbortGame }  from "./AbortAction";

interface ActionRendererProps {
  availableActions: string[];
  onAction: (action: GameAction) => void;
  players?: Player[];
  requiredCount?: number;
  currentRuleset?: Rule[];
  currentMaxPlayers?: number;
  disabled?: boolean;
  extras?: React.ReactNode;
}

export function ActionRenderer({
  availableActions,
  onAction,
  players = [],
  requiredCount = 0,
  currentRuleset = [],
  currentMaxPlayers = 10,
  disabled = false,
  extras = null,
}: ActionRendererProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sticky bottom-10 left-1/2 mt-4">
      {extras}
      {availableActions.map(action => {
        switch (action) {
          case "vote":
            return (
              <VoteActionComponent
                key={action}
                onAction={onAction}
                disabled={disabled}
              />
            );
          case "nominate":
            return (
              <NominateActionComponent
                key={action}
                onAction={onAction}
                players={players}
                requiredCount={requiredCount}
                disabled={disabled}
              />
            );
          case "quest":
            return (
              <QuestActionComponent
                key={action}
                onAction={onAction}
                disabled={disabled}
              />
            );
          case "lady":
            return (
              <LadyActionComponent
                key={action}
                onAction={onAction}
                players={players}
                disabled={disabled}
              />
            );
          case "assassinate":
            return (
              <AssassinateActionComponent
                key={action}
                onAction={onAction}
                players={players}
                disabled={disabled}
              />
            );
          case "start":
            return (
              <StartActionComponent
                key={action}
                onAction={onAction}
                disabled={disabled}
              />
            );
          case "ruleset":
            return (
              <RulesetModificationActionComponent
                key={action}
                onAction={onAction}
                currentRuleset={currentRuleset}
                currentMaxPlayers={currentMaxPlayers}
                disabled={disabled}
              />
            );
          case "abort":
            return (
              <AbortGame
                key={action}
                onAction={onAction}
                disabled={disabled}
              />
            )
          default:
            return null;
        }
      })}
    </div>
  );
}
