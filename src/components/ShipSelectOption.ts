import { state, setSelectedShip, setOrientation } from "./PausedGameState";

import { createElement } from "../utils/createElement";
import { Ships } from "../logic/ship/ship";
import { Ship } from "./Ship";

const SHIP_SELECT_OPTION_TEMPLATE = (() => {
  const element = createElement(`
    <button class="ship-select-option">
        <h5 class="ship-title"></h5>
    </button>
      `);
  return element;
})();

export const ShipSelectOption = (shipName: keyof Ships, selected: boolean) => {
  function handleClick(e: Event) {
    const selectedShip = e.currentTarget as HTMLElement;
    const prevSelectedShip = document.querySelector(
      ".ship-select-option[data-selected='true']"
    ) as HTMLElement;

    if (prevSelectedShip) prevSelectedShip.dataset.selected = "false";

    setSelectedShip(shipName);
    selectedShip.dataset.selected = "true";

    const selectedShipTitle = document.querySelector(
      ".selected-ship-option .ship-title"
    ) as HTMLElement;

    selectedShipTitle.textContent = shipName;

    const selectedShipOptionContainer = document.querySelector(
      ".selected-ship-option-container"
    ) as HTMLElement;

    selectedShipOptionContainer.removeChild(
      selectedShipOptionContainer.firstElementChild as HTMLElement
    );

    selectedShipOptionContainer.appendChild(
      Ship(shipName, true, state.orientation)
    );
  }

  const node = SHIP_SELECT_OPTION_TEMPLATE.cloneNode(true) as HTMLElement;
  if (selected) node.dataset.selected = "true";
  (node.querySelector(".ship-title") as HTMLElement).textContent = shipName;
  const ship = Ship(shipName);
  node.insertAdjacentElement("afterbegin", ship);

  node.addEventListener("click", handleClick);
  return node;
};

const SHIP_SELECTED_OPTION_TEMPLATE = (() => {
  const element = createElement(`
    <div class="selected-ship-option">
        <h5 class="ship-title"></h5>

        <div class="orientation-switch">
            <h4 class="orientation-switch-title">Orientation</h4>
            <div class="orientation-switch-buttons">
                <button class="orientation-switch-button" type="button" data-selected="true">Horizontal</button>
                <button class="orientation-switch-button" type="button" data-selected="false">Vertical</button>
            </div>
        </div>

        <div class="selected-ship-option-container">
        </div>
  </div>
`);
  return element;
})();

export const ShipSelectedOption = () => {
  function handleOrientationClick(
    e: Event,
    orientation: "horizontal" | "vertical"
  ) {
    setOrientation(orientation);

    const currentOrientationElement = e.currentTarget as HTMLElement;

    const prevOrientationElement = document.querySelector(
      ".orientation-switch-button[data-selected='true']"
    ) as HTMLElement;

    prevOrientationElement.dataset.selected = "false";

    currentOrientationElement.dataset.selected = "true";

    const selectedShipElement = document.querySelector(
      ".selected-ship-option-container .ship"
    ) as HTMLElement;
    selectedShipElement.dataset.orientation = orientation;
  }

  const node = SHIP_SELECTED_OPTION_TEMPLATE.cloneNode(true) as HTMLElement;
  const shipTitle = node.querySelector(".ship-title") as HTMLElement;

  const orientationButtons = node.querySelectorAll(
    ".orientation-switch-button"
  );

  const horizontalOrientationButton = orientationButtons[0];
  const verticalOrientationButton = orientationButtons[1];

  horizontalOrientationButton.addEventListener("click", (e) => {
    handleOrientationClick(e, "horizontal");
  });
  verticalOrientationButton.addEventListener("click", (e) => {
    handleOrientationClick(e, "vertical");
  });

  shipTitle.textContent = state.selectedShip;
  const shipContainer = node.querySelector(
    ".selected-ship-option-container"
  ) as HTMLElement;
  const ship = Ship(state.selectedShip, true, state.orientation);
  shipContainer.appendChild(ship);

  return node;
};
