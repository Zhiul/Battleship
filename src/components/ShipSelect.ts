import { state } from "./PausedGameState";

import { createElement } from "../utils/createElement";
import { Ships } from "../logic/ship/ship";
import { ShipSelectOption } from "./ShipSelectOption";

const SHIP_SELECT_TEMPLATE = (() => {
  const element = createElement(`<div class="ship-select"></div>`);
  return element;
})();

export const ShipSelect = (() => {
  const node = SHIP_SELECT_TEMPLATE.cloneNode(true);
  ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"].forEach(
    (shipName: keyof Ships) => {
      const isSelected = shipName === state.selectedShip;
      const ShipSelectOptionElement = ShipSelectOption(shipName, isSelected);
      node.appendChild(ShipSelectOptionElement);
    }
  );
  return node;
})();
