import { Gameboard } from "./gameboard";

const gameboard = Gameboard();

describe("Gameboard tests", () => {
  it("Gameboard can place ship", () => {
    expect(gameboard.placeShip("Destroyer", 0, 0, "horizontal")).toBe(true);
    expect(gameboard.placeShip("Cruiser", 0, 1, "horizontal")).toBe(true);
  });

  it("Gameboard cannot place ship if there is no space", () => {
    expect(gameboard.placeShip("Battleship", 7, 0, "horizontal")).toEqual(
      new Error("There is not available space to place this ship")
    );
  });

  it("Gameboard cannot place ship in position that could overlap another ship", () => {
    expect(gameboard.placeShip("Battleship", 0, 1, "vertical")).toEqual(
      new Error("There is already a placed ship")
    );
  });

  it("Gameboard areShipsSunk method returns false if all ships are not sunk", () => {
    expect(gameboard.areShipsSunk()).toBe(false);
  });

  it("Gameboard can receive attacks", () => {
    expect(gameboard.receiveAttack(3, 3)).toBe("Miss shot");
  });

  it("Gameboard ships can receive attacks", () => {
    expect(gameboard.receiveAttack(0, 1)).toBe("Hit");
  });

  it("Gameboard cannot receive attacks in cells that are already attacked", () => {
    expect(gameboard.receiveAttack(0, 1)).toEqual(
      new Error("Cell has already been attacked")
    );
  });
});
