import type { Ships } from "../ship/ship";
import type { Player } from "./game";

import { isEqual } from "lodash";
import { initializeGrid } from "../gameboard/gameboard";

interface coordinates {
  x: number;
  y: number;
}

function Coordinates(x: number, y: number): coordinates {
  return { x, y };
}

function shipStats(length: number, sunk: boolean = false) {
  return { length, sunk };
}

export function BattleshipAI(player: Player) {
  let grid = initializeGrid();

  const availableCoordinates = (() => {
    function getAvailableCoordinates() {
      let coordinates: coordinates[] = [];
      let xIndex = 0;
      while (xIndex < 10) {
        for (let yIndex = 0; yIndex < 10; yIndex++) {
          coordinates.push(Coordinates(xIndex, yIndex));
        }
        xIndex++;
      }
      return coordinates;
    }

    let coordinates = getAvailableCoordinates();

    const getRandomCoordinates = () =>
      coordinates[Math.floor(Math.random() * coordinates.length)];

    const contains = (coords: coordinates) => {
      return (
        coordinates.findIndex((coordinates) => isEqual(coordinates, coords)) >=
        0
      );
    };

    const remove = (coords: coordinates) => {
      coordinates = coordinates.filter(
        (coordinates) => !isEqual(coordinates, coords)
      );
    };

    const reset = () => {
      coordinates = getAvailableCoordinates();
    };

    return { getRandomCoordinates, contains, remove, reset };
  })();

  const shipsStats = {
    ships: {
      Carrier: shipStats(5),
      Battleship: shipStats(4),
      Cruiser: shipStats(3),
      Submarine: shipStats(3),
      Destroyer: shipStats(2),
    },

    getMinimumShipLength: function () {
      if (this.ships["Destroyer"].sunk === false) return 2;
      if (
        this.ships["Submarine"].sunk === false ||
        this.ships["Cruiser"].sunk === false
      )
        return 3;
      if (this.ships["Battleship"].sunk === false) return 4;
      return 5;
    },

    areShipsSunk: function () {
      for (const shipName in this.ships) {
        if (this.ships[shipName as keyof Ships].sunk === false) return false;
      }
      return true;
    },

    clear: function () {
      for (const shipName in this.ships) {
        this.ships[shipName as keyof Ships].sunk = false;
      }
    },
  };

  const placeShips = () => {
    const ship = (name: keyof Ships, length: number) => {
      return { name, length };
    };

    let ships = [
      ship("Carrier", 5),
      ship("Battleship", 4),
      ship("Cruiser", 3),
      ship("Submarine", 3),
      ship("Destroyer", 2),
    ];

    const shipsWerePlaced = () => ships.length === 0;
    const getRandomShip = () => ships[Math.floor(Math.random() * ships.length)];

    while (!shipsWerePlaced()) {
      const ship = getRandomShip();
      const shipName = ship.name;

      const maxMainAxisCoordinate = 9 - ship.length - 1;
      let shipWasPlaced = false;

      while (shipWasPlaced === false) {
        let x;
        let y;

        const randomOrientation =
          Math.floor(Math.random() * 2) === 1 ? "horizontal" : "vertical";
        const randomAxisCoordinate = Math.floor(
          Math.random() * maxMainAxisCoordinate + 1
        );
        const randomCrossAxisCoordinate = Math.floor(Math.random() * 10);

        if (randomOrientation === "horizontal") {
          [x, y] = [randomAxisCoordinate, randomCrossAxisCoordinate];
        } else {
          [x, y] = [randomCrossAxisCoordinate, randomAxisCoordinate];
        }

        if (player.placeShip(ship.name, x, y, randomOrientation) === true) {
          ships = ships.filter((ship) => ship.name !== shipName);
          shipWasPlaced = true;
        }
      }
    }
  };

  const attack = () => {
    if (shipsStats.areShipsSunk()) return;

    const coordinates = availableCoordinates.getRandomCoordinates();
    availableCoordinates.remove(coordinates);

    const attackMessage = player.attackEnemy(coordinates.x, coordinates.y);

    if (attackMessage === "Game has finished") return;

    if (
      attackMessage !== "Hit" &&
      attackMessage !== "Miss shot" &&
      !(attackMessage instanceof Error)
    ) {
      const shipName = attackMessage;
      shipsStats.ships[shipName].sunk = true;
    }

    return { coordinates, attackMessage };
  };

  function clearState() {
    grid = initializeGrid();
    availableCoordinates.reset();
    shipsStats.clear();
  }

  return { placeShips, attack, clearState };
}
