import type { AttackMessage } from "../logic/gameboard/gameboard";

import { BattleShipGame } from "../logic/game/game";
import { AI } from "./DOM";
import { initializeDOMView } from "./DOM";

import { createElement } from "../utils/createElement";
import { Gameboard } from "./Gameboard";
import { markGameboardCell } from "./Gameboard";

let gameboards: { "1": HTMLElement; "2": HTMLElement } = {
  "1": null,
  "2": null,
};

function restartGame() {
  BattleShipGame.restart();
  AI.clearState();
  AI.placeShips();
  initializeDOMView();
}

export async function handleTurn(
  playerId: "1" | "2",
  x: number | null = null,
  y: number | null = null
) {
  let currentActionMessage: string = "";

  function currentActionMessageHasBeenSet() {
    return new Promise((resolve) => {
      function check() {
        if (currentActionMessage !== "") {
          resolve(true);
        } else {
          setTimeout(() => {
            check();
          }, 500);
        }
      }
      check();
    });
  }

  let attackMessage;

  const currentPlayerId = BattleShipGame.getCurrentPlayerId();
  const enemyId = playerId === "1" ? "2" : "1";
  const enemyGameboard = gameboards[enemyId];

  const gameHasFinished = () => BattleShipGame.getGameStatus() === "finished";

  if (playerId !== currentPlayerId || gameHasFinished()) return;

  if (playerId === "1") {
    const player = BattleShipGame.players[playerId];

    if (x === null && y === null) {
      currentActionMessage = "It's your turn";
      displayActionMessage(currentActionMessage);
      return;
    }

    attackMessage = player.attackEnemy(x, y);

    if (attackMessage instanceof Error) {
      markGameboardCell(enemyGameboard, attackMessage, x, y);
      return;
    }

    switch (attackMessage) {
      case "Hit":
        currentActionMessage = "It’s a hit!";
        break;

      case "Miss shot":
        currentActionMessage = "Miss shot";
        break;

      default:
        currentActionMessage = `You have a sunk a ${attackMessage}`;
        break;
    }
  } else {
    displayActionMessage("Enemy is attacking");

    setTimeout(() => {
      const AIAttackData = AI.attack();

      attackMessage = AIAttackData.attackMessage;
      x = AIAttackData.coordinates.x;
      y = AIAttackData.coordinates.y;

      switch (attackMessage) {
        case "Hit":
          currentActionMessage = `Enemy hit your ${BattleShipGame.players[
            enemyId
          ].getShipNameAt(x, y)}`;
          break;

        case "Miss shot":
          currentActionMessage = "Miss shot!";
          break;

        default:
          currentActionMessage = `Enemy sunk your ${attackMessage}`;
          break;
      }
    }, 3000);
  }

  await currentActionMessageHasBeenSet();
  displayActionMessage(currentActionMessage);
  markGameboardCell(enemyGameboard, attackMessage as AttackMessage, x, y);

  if (gameHasFinished()) {
    if (playerId === "1") {
      currentActionMessage = "You won";
    } else {
      currentActionMessage = "Game over";
    }

    setTimeout(() => {
      displayActionMessage(currentActionMessage);
    }, 3000);

    return;
  }

  setTimeout(() => {
    handleTurn(enemyId);
  }, 2000);
}

function displayActionMessage(message: string) {
  gameCurrentAction.textContent = message;
}

const gameCurrentAction = createElement(`
<div class="game-current-action"></div>
`);

export function initializeRunningGameView() {
  const root = createElement(`
<main data-game-status="running">
  <header>
      <h1>BattleShip</h1>
  </header>
</main>
`);

  const gameboardsContainer = createElement(`
<div class="gameboards-container"></div>
`);

  const playerGameboard = Gameboard("player", "attack");
  const enemyGameboard = Gameboard("enemy", "attack");

  gameboards["1"] = playerGameboard.querySelector(".gameboard");
  gameboards["2"] = enemyGameboard.querySelector(".gameboard");

  gameboardsContainer.appendChild(playerGameboard);
  gameboardsContainer.appendChild(enemyGameboard);

  const restartButton = createElement(`
<button type="button" class="game-cta">Restart</button>
`);

  restartButton.addEventListener("click", restartGame);

  root.appendChild(gameCurrentAction);
  root.appendChild(gameboardsContainer);
  root.appendChild(restartButton);

  document.body.appendChild(root);
  handleTurn("1");
}
