import type { Role } from "@/engine"

export type KnowledgeType = "Role" | "None" | "Team" | "Magic User"
export type KnowledgeMatrix = Record<Role, Record<Role, KnowledgeType>>; 

const matrix: KnowledgeMatrix = {
  "Arthurian Servant": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "None",
    "Morgana": "None",
    "Mordred": "None",
    "Oberon": "None",
    "Assassin": "None",
  },
  "Percival": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "Magic User",
    "Mordredic Servant": "None",
    "Morgana": "Magic User",
    "Mordred": "None",
    "Oberon": "None",
    "Assassin": "None",
  },
  "Merlin": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "Team",
    "Morgana": "Team",
    "Mordred": "None",
    "Oberon": "Team",
    "Assassin": "Team",
  },
  "Mordredic Servant": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "Team",
    "Morgana": "Team",
    "Mordred": "Team",
    "Oberon": "None",
    "Assassin": "Team",
  },
  "Morgana": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "Team",
    "Morgana": "Role",
    "Mordred": "Team",
    "Oberon": "None",
    "Assassin": "Team",
  },
  "Mordred": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "Team",
    "Morgana": "Team",
    "Mordred": "Role",
    "Oberon": "None",
    "Assassin": "Team",
  },
  "Assassin": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "Team",
    "Morgana": "Team",
    "Mordred": "Team",
    "Oberon": "None",
    "Assassin": "Role",
  },
  "Oberon": {
    "Arthurian Servant": "None",
    "Percival": "None",
    "Merlin": "None",
    "Mordredic Servant": "None",
    "Morgana": "None",
    "Mordred": "None",
    "Oberon": "Role",
    "Assassin": "None",
  },
}

export function RulesDisplay() {
  return (
    <>
      <h1 className="text-4xl mt-16 mb-8">Rules</h1>
      <article className="mb-16">
        <h2>Summary and Objective</h2>
        <p>Avalon is a game of hidden loyalty. Players are either loyal Arthurian servants or secretly evil servants of Mordred</p>
        <p>Good wins the game if three out of five quests are successful. Evil wins if three out of five quests fail, Merlin is assassinated, or voting is thrown into chaos.</p>
        <p>Communication is vital--but can be sabotaged. Players can say anything during the game. The forces of Arthur work to uncover truth.</p>

        <h2>Game Play</h2>
        <p>Avalon is played through multiple rounds, each with a nomination, voting, and questing phase.</p>

        <h3>Nomination</h3>
        <p>During the nomination phase, all players can discuss freely. One player is the monarch (starts at a random player), who can choose a set of players to participate in the quest (either 2, 3, 4, or 5 depending on player count and quest number).</p>
        <p>It's important to discuss <em>lots</em> in this phase. </p>

        <h3>Voting</h3>
        <p>After the quest participants are selected, each player gets to vote for the team. If {">50%"} of the players vote to allow the quest, the quest happens. Otherwise, the monarch is passed directly to the next person.</p>
        <p>If four quests are vetoed in a row, the evil team wins.</p>

        <h3>Questing</h3>
        <p>Each player on the quest can choose to either <em>Fail</em> or <em>Pass</em> the quest. Players on the good team should always pass the quest. Players on the evil team may choose to either fail the quest to move their goals forward, or pass the quest to blend in.</p>
        <p>The number of failed quests is revealed, but not specifically which person on the quest chose to fail it.</p>
        <p>After the quest is concluded, the monarch passes to the next player.</p>

        <h2>Roles</h2>

        <h3>Merlin🧙‍♂️</h3>
        <p>Merlin is the crux of the good team. He knows who all of the evil players are (except for Mordred), but cannot make his knowledge obvious to the Assassin. Merlin must work to guide the discussion away from nominating evil players for the quest, without revealing that he has more knowledge than he should.</p>

        <h3>Mordredic Servant 🔴</h3>
        <p>All evil players are mordredic servants. They work to fail quests and discover who Merlin is. They know who their teammates are.</p>

        <h3>Assassin 🥷</h3>
        <p>The assassin is a Mordredic servant that works to figure out who Merlin is. If three quests are passed, the assassin gets to pick a player to assassinate as one last chance. If they successfully kill Merlin, the evil team wins.</p>

        <h3>Arthurian Servant 🔵</h3>
        <p>All players without a specific role are arthurian servants. They know nothing, and must deduce who is Merlin and who is secretly a servant of Mordred.</p>

        <h3>Percival (optional) 👦</h3>
        <p>Percival must be played with Morgana. He acts as an assistant to Merlin--he knows two players, one that's Morgana and one that's Merlin, but can't distinguish which is which.</p>
        <p>Morgana and Percival are highly recommended for games of 7+ players.</p>

        <h3>Morgana (optional)🧝‍♀️</h3>
        <p>Morgana is a mordredic servant that works to fool Percival. If Morgana successfully tricks Percival into thinking she is Merlin, the game will most likely end in an evil victory.</p>
        <p>Morgana and Percival are highly recommended for games of 7+ players.</p>

        <h3>Mordred (optional) 🧛</h3>
        <p>Mordred is a special role that acts as a Mordredic Servant but is invisible to Merlin.</p>
        <p>While Mordred can be played in a 5 or 6 person game, doing so will make the evil team too strong. Mordred is best saved for 7+ player games.</p>

        <h3>Oberon (optional) 🧟</h3>
        <p>Oberon is a mordredic servant, but does not know his teammates and is unknown to his teammates. Additionally, he can only play fail cards and cannot deceive by playing success cards.</p>

        <h2>Optional Rules</h2>
        <h3>Lady of the Lake</h3>
        <p>The lady of the lake allows one player to know the true role of another at the end of the second, third, and fourth quest. When used, the lady of the lake is then passed to the player it was used on.</p>
        <p>The lady of the lake tends to provide an advantage for the good team, but if used cleverly by the evil players it can cause great discord.</p>

        <h3>Quickshot Assassin</h3>
        <p>Quickshot assassin is a special ruleset that forces the assassin to take their target before the game is over and without discussing with their teammates.</p>
        <p>It's a good rule to use in games of 5 or 6 players, where the evil players already have a 25% chance of just guessing Merlin. Experienced groups of players may prefer it as well for the extra challenge.</p>

        <h3>Clock</h3>
        <p>The clock puts a timer on certain phases of the game to prevent filibustering. Recommended for experienced players.</p>

        <h3>Visible Teammate Roles</h3>
        <p>Visible teammate roles allows players on the evil team to know exactly which role the others have. This gives them the ability to coordinate better (i.e. hiding Mordred).</p>

        <h2>Knowledge Table</h2>
        <p>It can be confusing to remember who knows what! Here's a helpful table:</p>
        <KnowledgeTable matrix={matrix} />
      </article>
    </>
  )

}

interface KnowledgeTableProps {
  matrix: KnowledgeMatrix
}

function KnowledgeTable({ matrix }: KnowledgeTableProps) {
  const roles = Object.keys(matrix) as Role[]
  
  const getRoleEmoji = (role: Role): string => {
    switch (role) {
      case "Arthurian Servant": return "🔵"
      case "Percival": return "👦"
      case "Merlin": return "🧙‍♂️"
      case "Mordredic Servant": return "🔴"
      case "Morgana": return "🧝‍♀️"
      case "Mordred": return "🧛"
      case "Oberon": return "🧟"
      case "Assassin": return "🥷"
      default: return "❓"
    }
  }
  
  const getKnowledgeAbbreviation = (knowledge: KnowledgeType): string => {
    switch (knowledge) {
      case "Role": return "R"
      case "Team": return "T"
      case "Magic User": return "M"
      case "None": return "N"
      default: return "?"
    }
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <th className="bg-base-200 w-32">Role</th>
            {roles.map(role => (
              <th key={role} className="bg-base-200 w-8 text-center" title={role}>
                {getRoleEmoji(role)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="group">
          {roles.map(observerRole => (
            <tr key={observerRole} className="group/row hover:brightness-110 group-hover:brightness-75 hover:!brightness-110">
              <td className="font-medium bg-base-100 w-32">
                {observerRole}
              </td>
              {roles.map(targetRole => {
                const knowledge = matrix[observerRole][targetRole]
                return (
                  <td 
                    key={targetRole} 
                    className={`text-center w-8 ${
                      knowledge === 'Role' ? 'bg-info text-info-content' :
                      knowledge === 'Team' ? 'bg-success text-success-content' :
                      knowledge === 'Magic User' ? 'bg-secondary text-secondary-content' :
                      'bg-base-100'
                    }`}
                    title={`${observerRole} sees ${targetRole} as ${knowledge}`}
                  >
                    {getKnowledgeAbbreviation(knowledge)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-info text-info-content rounded flex items-center justify-center font-bold">R</span>
          <span>Knows exactly which player has this role</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-success text-success-content rounded flex items-center justify-center font-bold">T</span>
          <span>Sees the team affiliation of the player with this role</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-secondary text-secondary-content rounded flex items-center justify-center font-bold">M</span>
          <span>Sees that this player could either be Morgana or Merlin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-base-100 border border-base-300 rounded flex items-center justify-center font-bold">N</span>
          <span>No knowledge. Appears as an Arthurian Servant</span>
        </div>
      </div>
    </div>
  )
}
