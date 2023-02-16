import { BattleShipGame } from "../logic/game/game";
import { BattleshipAI } from "../logic/game/AI";

import { initializePausedGameView } from "./PausedGame";
import { initializeRunningGameView } from "./RunningGame";

export const player = BattleShipGame.players["1"];
const AIplayer = BattleShipGame.players["2"];
export const AI = BattleshipAI(AIplayer);
AI.placeShips();

export function initializeDOMView() {
  const main = document.querySelector("main");
  if (main) {
    main.classList.add("fading-out");

    main.addEventListener(
      "animationend",
      () => {
        main.remove();
      },
      { once: true }
    );
  }

  setTimeout(() => {
    const gameStatus = BattleShipGame.getGameStatus();

    switch (gameStatus) {
      case "paused":
        initializePausedGameView();
        break;

      case "running":
        initializeRunningGameView();
        break;
    }

    const main = document.querySelector("main");
    main.classList.add("fading-in");
    main.addEventListener(
      "animationend",
      () => {
        main.classList.remove("fading-in");
      },
      { once: true }
    );
  }, 400);
}
