interface Ship {
  getName(): string;
  getLength(): number;
  hit(): void;
  isSunk(): boolean;
}

export type Ships = {
  Carrier: Ship;
  Battleship: Ship;
  Cruiser: Ship;
  Submarine: Ship;
  Destroyer: Ship;
};

export function Ship(name: string, length: number): Ship {
  const getName = () => name;
  const getLength = () => length;

  let hitsNumber = 0;
  const isSunk = () => hitsNumber === length;

  const hit = () => {
    if (isSunk()) return;
    hitsNumber++;
  };

  return { getName, getLength, hit, isSunk };
}
