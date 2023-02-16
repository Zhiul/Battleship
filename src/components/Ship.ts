import type { Ships } from "../logic/ship/ship";
import { createElement } from "../utils/createElement";

import carrierBackground from "../assets/carrier.png";
import battleShipBackground from "../assets/battleship.png";
import cruiserBackground from "../assets/cruiser.png";
import submarineBackground from "../assets/submarine.png";
import destroyerBackground from "../assets/destroyer.png";
import { isNumber } from "lodash";

const ShipDataElement = (background: string, length: string) => {
  return { background, length };
};

const SHIPS_DATA = {
  Carrier: ShipDataElement(carrierBackground, "5"),
  Battleship: ShipDataElement(battleShipBackground, "4"),
  Cruiser: ShipDataElement(cruiserBackground, "3"),
  Submarine: ShipDataElement(submarineBackground, "3"),
  Destroyer: ShipDataElement(destroyerBackground, "2"),
};

const SHIP_TEMPLATE = (() => {
  const element = createElement(`
    <span class="ship">
      <span class="ship-bg"></span>
    </span>
    `);
  return element;
})();

export const Ship = (
  shipName: keyof Ships,
  draggable: boolean = false,
  orientation: "horizontal" | "vertical" = "horizontal",
  x?: number,
  y?: number
) => {
  function handleDragStart(e: DragEvent) {
    this.style.opacity = "0.9";
    e.dataTransfer.effectAllowed = "move";

    const orientation = (e.target as HTMLElement).dataset.orientation;

    const rect = (e.target as HTMLElement).getBoundingClientRect();

    let x;
    let y;

    const gameboard = document.querySelector(".gameboard");

    const prevShipElement = gameboard.querySelector(
      `.ship[data-ship-name='${shipName}']`
    ) as HTMLElement;

    if (prevShipElement) {
      x = prevShipElement.dataset.x;
      y = prevShipElement.dataset.y;
    } else {
      x = (e.target as HTMLElement).dataset.x;
      y = (e.target as HTMLElement).dataset.y;
    }

    let offsetX = e.clientX - rect.x;
    let offsetY = 0;

    if (orientation === "horizontal") {
      offsetY = e.clientY - rect.y;
    } else {
      offsetY = e.clientY - rect.bottom + 25;
    }

    const data = {
      shipName,
      x,
      y,
      orientation,
      offsetX,
      offsetY,
    };

    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  }

  function handleDragEnd() {
    this.style.opacity = "1";
  }

  const node = SHIP_TEMPLATE.cloneNode(true) as HTMLElement;
  node.dataset.shipName = shipName;
  node.dataset.orientation = orientation;

  if (isNumber(x) && isNumber(y)) {
    node.dataset.x = x.toString();
    node.dataset.y = y.toString();

    node.style.setProperty("--x", x.toString());
    node.style.setProperty("--y", y.toString());
  }

  const shipBackground = node.querySelector(".ship-bg") as HTMLElement;
  shipBackground.style.backgroundImage = `url(${SHIPS_DATA[shipName].background})`;
  node.style.setProperty("--length", SHIPS_DATA[shipName].length);

  if (draggable) {
    node.draggable = true;
    node.addEventListener("dragstart", handleDragStart);
    node.addEventListener("dragend", handleDragEnd);
  }

  return node;
};
