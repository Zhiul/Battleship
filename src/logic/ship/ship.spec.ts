import { Ship } from "./ship";

describe("Ship tests", () => {
  it("Ship returns name", () => {
    const ship = Ship("Destroyer", 2);
    expect(ship.getName()).toBe("Destroyer");
  });

  it("Ship is not sunk if it has not been attacked 'length' number of times", () => {
    const ship = Ship("Destroyer", 2);
    expect(ship.isSunk()).toBe(false);
  });

  it("Ship is sunk if it has been attacked 'length' number of times", () => {
    const ship = Ship("Destroyer", 2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
