import { BattleShipGame } from "../logic/game/game";

import { createElement } from "../utils/createElement";
import { initializeDOMView } from "./DOM";
import { Gameboard } from "./Gameboard";
import { ShipSelect } from "./ShipSelect";
import { ShipSelectedOption } from "./ShipSelectOption";

function startGame() {
  const gameHasStarted = BattleShipGame.start();
  if (!gameHasStarted) return;
  initializeDOMView();
}

export function initializePausedGameView() {
  const root = createElement(`
<main data-game-status="paused">
    <header>
        <h1>BattleShip</h1>
        <h3 class="gameboard-header">Place your ships</h3>
    </header>
</main>
`);

  const gameboard = Gameboard("player", "place-ship");

  const container = createElement(`
<div class="container"></div>
`);

  const startButton = createElement(`
<button type="button" class="game-cta">Start</button>
`);

  startButton.addEventListener("click", startGame);

  const shipSelectedOption = ShipSelectedOption();

  container.appendChild(startButton);
  container.appendChild(shipSelectedOption);

  root.appendChild(gameboard);
  root.appendChild(container);
  root.appendChild(ShipSelect);

  document.body.appendChild(root);
}
