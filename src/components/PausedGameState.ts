import { Ships } from "../logic/ship/ship";

interface state {
  orientation: "horizontal" | "vertical";
  selectedShip: keyof Ships;
}

export const state: state = {
  orientation: "horizontal",
  selectedShip: "Carrier",
};

export const setOrientation = (newOrientation: "horizontal" | "vertical") => {
  state.orientation = newOrientation;
};

export const setSelectedShip = (shipName: keyof Ships) => {
  state.selectedShip = shipName;
};
