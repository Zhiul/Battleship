import { Ships } from "../ship/ship";
import {
  Gameboard,
  placeShip,
  SHIPS_LENGTH,
  getShipsPosition,
  AttackMessage,
} from "../gameboard/gameboard";

export interface Player {
  isTurn: () => boolean;
  getShipsPosition: getShipsPosition;
  getShipNameAt: (x: number, y: number) => keyof Ships | Error;
  placeShip: placeShip;
  removeShip: (
    shipName: keyof Ships,
    x: number,
    y: number,
    orientation: "horizontal" | "vertical"
  ) => boolean | Error;
  hasPlacedShips: () => boolean;
  receiveAttack: (x: number, y: number) => AttackMessage;
  attackEnemy: (x: number, y: number) => AttackMessage | "Game has finished";
  clearMatchState: () => void;
  areShipsSunk: () => boolean;
}

function Game() {
  let gameStatus: "paused" | "running" | "finished" = "paused";
  const getGameStatus = () => gameStatus;
  const getCurrentPlayerId = () => (players["1"].isTurn() ? "1" : "2");

  let winner: Player | null = null;
  const getWinner = () => winner;

  const players = {
    "1": Player("1", "2", true),
    "2": Player("2", "1", false),
  };

  function Player(id: "1" | "2", enemyId: "1" | "2", turn: boolean): Player {
    let gameboard = Gameboard();

    const toggleTurn = () => {
      turn = !turn;
    };

    const isTurn = () => turn;

    const getShipsPosition = () => gameboard.getShipsPosition();

    const getShipNameAt = (x: number, y: number): keyof Ships | Error => {
      const shipsPositions = getShipsPosition();

      let shipName;
      for (const ship in shipsPositions) {
        const shipPosition = shipsPositions[ship as keyof Ships];

        if (shipPosition.x === null) continue;
        if (shipPosition.y === null) continue;

        if (
          (x >= shipPosition.x &&
            x <= x + SHIPS_LENGTH[ship as keyof Ships] - 1 &&
            y === shipPosition.y) ||
          (y >= shipPosition.y &&
            y <= y + SHIPS_LENGTH[ship as keyof Ships] - 1 &&
            x === shipPosition.x)
        ) {
          shipName = ship as keyof Ships;
          break;
        }
      }

      if (!shipName) return new Error("No ship found");
      return shipName;
    };

    const attackEnemy = (x: number, y: number) => {
      if (gameStatus !== "running" || !isTurn())
        return new Error("Game has finished");

      const enemy = players[enemyId];
      const attackMessage = enemy.receiveAttack(x, y);
      if (attackMessage instanceof Error === false) toggleTurn();
      return handleAttack(id, enemyId, attackMessage);
    };

    const receiveAttack = (x: number, y: number) => {
      const attackMessage = gameboard.receiveAttack(x, y);
      if (attackMessage instanceof Error === false) {
        toggleTurn();
      }
      return attackMessage;
    };

    let placedShipsNumber = 0;
    const hasPlacedShips = () => placedShipsNumber === 5;

    const placeShip = (
      shipName: keyof Ships,
      x: number,
      y: number,
      orientation: "horizontal" | "vertical"
    ) => {
      const shipWasPlaced = gameboard.placeShip(shipName, x, y, orientation);
      if (shipWasPlaced === true) {
        placedShipsNumber++;
      }
      return shipWasPlaced;
    };

    const removeShip = (
      shipName: keyof Ships,
      x: number,
      y: number,
      orientation: "horizontal" | "vertical"
    ): boolean | Error => {
      if (gameStatus !== "paused") return false;

      const removeShipMessage = gameboard.removeShip(
        shipName,
        x,
        y,
        orientation
      );

      if (removeShipMessage) {
        placedShipsNumber--;
      }
      return true;
    };

    const clearMatchState = () => {
      if (id === "1") {
        turn = true;
      } else {
        turn = false;
      }

      gameboard = Gameboard();
      placedShipsNumber = 0;
    };

    const areShipsSunk = () => gameboard.areShipsSunk();

    return {
      isTurn,
      getShipsPosition,
      getShipNameAt,
      placeShip,
      removeShip,
      hasPlacedShips,
      receiveAttack,
      attackEnemy,
      clearMatchState,
      areShipsSunk,
    };
  }

  function setWinner(playerId: "1" | "2") {
    winner = players[playerId];
    gameStatus = "finished";
  }

  function handleAttack(
    id: "1" | "2",
    enemyId: "1" | "2",
    attackMessage: AttackMessage
  ) {
    const enemy = players[enemyId];

    if (typeof attackMessage === "string" && enemy.areShipsSunk()) {
      setWinner(id);
    }
    return attackMessage;
  }

  function start() {
    if (!players[1].hasPlacedShips() || !players[2].hasPlacedShips())
      return false;
    gameStatus = "running";
    return true;
  }

  function restart() {
    winner = null;
    players["1"].clearMatchState();
    players["2"].clearMatchState();
    gameStatus = "paused";
  }

  return {
    getGameStatus,
    getCurrentPlayerId,
    players,
    getWinner,
    start,
    restart,
  };
}

export const BattleShipGame = Game();
