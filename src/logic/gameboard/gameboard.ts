import type { Ships } from "../ship/ship";
import { Ship } from "../ship/ship";

interface ShipPosition {
  x: number | null;
  y: number | null;
  orientation: "horizontal" | "vertical" | null;
}

interface shipsPosition {
  Carrier: ShipPosition;
  Battleship: ShipPosition;
  Cruiser: ShipPosition;
  Submarine: ShipPosition;
  Destroyer: ShipPosition;
}

export type getShipsPosition = () => shipsPosition;

export type AttackMessage = "Hit" | "Miss shot" | keyof Ships | Error;

export type placeShip = (
  shipName: keyof Ships,
  x: number,
  y: number,
  orientation: "horizontal" | "vertical"
) => true | Error;

export const SHIPS_LENGTH = {
  Carrier: 5,
  Battleship: 4,
  Cruiser: 3,
  Submarine: 3,
  Destroyer: 2,
};

export function initializeGrid() {
  const rows: Array<Array<any>> = Array.from({ length: 10 }, () => []);
  for (let index = 0; index < 10; index++) {
    for (let index = 0; index < 10; index++) {
      rows[index].push("");
    }
  }

  function at(x: number, y: number): "" | "X" | keyof Ships | null {
    if ([x, y].some((coord) => coord < 0 || coord > 9)) return null;
    return rows[x][y];
  }

  function set(x: number, y: number, value: string | keyof Ships) {
    rows[x][y] = value;
  }

  return { at, set };
}

export function Gameboard() {
  const grid = initializeGrid();

  function placeShip(
    shipName: keyof Ships,
    x: number,
    y: number,
    orientation: "horizontal" | "vertical"
  ) {
    const ship = ships[shipName];

    if (orientation === "horizontal") {
      if (x + ship.getLength() - 1 > 9) {
        return new Error("There is not available space to place this ship");
      }

      for (let xIndex = x; xIndex <= x + ship.getLength() - 1; xIndex++) {
        if (grid.at(xIndex, y) !== "") {
          return new Error("There is already a placed ship");
        }
      }

      for (let xIndex = x; xIndex <= x + ship.getLength() - 1; xIndex++) {
        grid.set(xIndex, y, shipName);
      }
    } else {
      if (y + ship.getLength() - 1 > 9) {
        return new Error("There is not available space to place this ship");
      }

      for (let yIndex = y; yIndex <= y + ship.getLength() - 1; yIndex++) {
        if (grid.at(x, yIndex) !== "") {
          return new Error("There is already a placed ship");
        }
      }

      for (let yIndex = y; yIndex <= y + ship.getLength() - 1; yIndex++) {
        grid.set(x, yIndex, shipName);
      }
    }

    shipsPosition[shipName].x = x;
    shipsPosition[shipName].y = y;
    shipsPosition[shipName].orientation = orientation;

    return true;
  }

  function removeShip(
    shipName: keyof Ships,
    x: number,
    y: number,
    orientation: "horizontal" | "vertical"
  ): boolean | Error {
    const ship = ships[shipName];

    if (orientation === "horizontal") {
      for (let xIndex = x; xIndex <= x + ship.getLength() - 1; xIndex++) {
        if (grid.at(xIndex, y) !== shipName) {
          return new Error("Coordinates to remove ship are not valid");
        }
      }

      for (let xIndex = x; xIndex <= x + ship.getLength() - 1; xIndex++) {
        grid.set(xIndex, y, "");
      }
    } else {
      for (let yIndex = y; yIndex <= y + ship.getLength() - 1; yIndex++) {
        if (grid.at(x, yIndex) !== shipName) {
          return new Error("Coordinates to remove ship are not valid");
        }
      }

      for (let yIndex = y; yIndex <= y + ship.getLength() - 1; yIndex++) {
        grid.set(x, yIndex, "");
      }
    }

    shipsPosition[shipName].x = null;
    shipsPosition[shipName].y = null;
    shipsPosition[shipName].orientation = null;

    return true;
  }

  function receiveAttack(x: number, y: number) {
    const value = grid.at(x, y);

    if (value === null) return new Error("Invalid coordinates");
    if (value === "X") return new Error("Cell has already been attacked");

    grid.set(x, y, "X");

    if (value !== "") {
      const ship = ships[value];
      ship.hit();
      return ship.isSunk() ? value : "Hit";
    }

    return "Miss shot";
  }

  const ships: Ships = {
    Carrier: Ship("Carrier", 5),
    Battleship: Ship("Battleship", 4),
    Cruiser: Ship("Cruiser", 3),
    Submarine: Ship("Submarine", 3),
    Destroyer: Ship("Destroyer", 2),
  };

  function ShipPosition(
    x: number | null = null,
    y: number | null = null,
    orientation: "horizontal" | "vertical" | null = null
  ) {
    return { x, y, orientation };
  }

  const shipsPosition = {
    Carrier: ShipPosition(),
    Battleship: ShipPosition(),
    Cruiser: ShipPosition(),
    Submarine: ShipPosition(),
    Destroyer: ShipPosition(),
  };

  function getShipsPosition() {
    return shipsPosition;
  }

  function areShipsSunk() {
    for (const shipName in ships) {
      if (ships[shipName as keyof Ships].isSunk() === false) return false;
    }
    return true;
  }

  return {
    getShipsPosition,
    placeShip,
    removeShip,
    receiveAttack,
    areShipsSunk,
  };
}
