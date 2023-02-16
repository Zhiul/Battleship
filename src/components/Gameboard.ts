import type { Ships } from "../logic/ship/ship";
import type { AttackMessage } from "../logic/gameboard/gameboard";

import { state } from "./PausedGameState";

import hitIcon from "../assets/hit.svg";
import missShotIcon from "../assets/miss-shot.png";

import { handleTurn } from "./RunningGame";

import { createElement } from "../utils/createElement";
import { player } from "./DOM";
import { Ship } from "./Ship";

const GAMEBOARD_TEMPLATE = (() => {
  const element = createElement(`
  <div class="gameboard-container">
    <h3 class="gameboard-header"></h3>
  <div class="gameboard">
  </div>
  `);
  const gameboard = element.querySelector(".gameboard");

  const cell = document.createElement("div");
  cell.classList.add("gameboard-cell");

  for (let y = 9; y >= 0; y--) {
    for (let x = 0; x <= 9; x++) {
      const cellNode = cell.cloneNode(true) as HTMLElement;
      cellNode.dataset.x = x.toString();
      cellNode.dataset.y = y.toString();

      gameboard.appendChild(cellNode);
    }
  }

  return element;
})();

export function markGameboardCell(
  gameboardElement: HTMLElement,
  attackMessage: AttackMessage,
  x: number,
  y: number
) {
  function gameboardCellIcon(icon: string, x: number, y: number) {
    const node: HTMLElement = createElement(
      `<div class="attack-message"></div>`
    );
    node.style.backgroundImage = `url(${icon})`;

    node.style.setProperty("--x", x.toString());
    node.style.setProperty("--y", y.toString());

    node.dataset.x = x.toString();
    node.dataset.y = y.toString();

    return node;
  }

  let icon;

  if (attackMessage instanceof Error) {
    const cellElement = gameboardElement.querySelector(
      `.gameboard-cell[data-x='${x}'][data-y='${y}']`
    );

    if (cellElement.classList.contains("error")) return;

    cellElement.classList.add("error");
    cellElement.addEventListener("animationend", () => {
      cellElement.classList.remove("error");
    });
    return;
  }

  if (attackMessage === "Miss shot") {
    icon = missShotIcon;
  } else {
    icon = hitIcon;
  }

  const cellIcon = gameboardCellIcon(icon, x, y);
  gameboardElement.appendChild(cellIcon);
}

export const Gameboard = (
  user: "player" | "enemy",
  mode: "place-ship" | "attack"
) => {
  const node = GAMEBOARD_TEMPLATE.cloneNode(true) as HTMLElement;
  const gameboard = node.querySelector(".gameboard");

  function removeShip(
    shipName: keyof Ships,
    x: number,
    y: number,
    orientation: "horizontal" | "vertical"
  ): boolean | Error {
    const removeShipMessage = player.removeShip(shipName, x, y, orientation);

    const prevShipElement = gameboard.querySelector(
      `.ship[data-ship-name='${shipName}']`
    );

    prevShipElement.remove();

    return removeShipMessage;
  }

  function placeShip(
    shipName: keyof Ships,
    x: number,
    y: number,
    orientation: "horizontal" | "vertical"
  ) {
    const prevShipElement = gameboard.querySelector(
      `.ship[data-ship-name='${shipName}']`
    ) as HTMLElement;

    if (prevShipElement) {
      removeShip(
        shipName,
        parseInt(prevShipElement.dataset.x),
        parseInt(prevShipElement.dataset.y),
        prevShipElement.dataset.orientation as "horizontal" | "vertical"
      );
    }

    const placeShipMessage = player.placeShip(shipName, x, y, orientation);
    if (placeShipMessage !== true) return;

    const ship = Ship(shipName, true, orientation, x, y);

    gameboard.appendChild(ship);
  }

  function handleDragOver(e: Event) {
    e.preventDefault();
    return false;
  }

  function handleDrop(e: DragEvent) {
    e.stopPropagation();
    const shipElementData = JSON.parse(e.dataTransfer.getData("text/plain"));

    const shipElementX = e.clientX - shipElementData.offsetX;
    const shipElementY = e.clientY - shipElementData.offsetY;

    const cell = document.elementFromPoint(
      shipElementX,
      shipElementY
    ) as HTMLElement;
    if (!cell.matches(".gameboard-cell")) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    placeShip(shipElementData.shipName, x, y, shipElementData.orientation);
  }

  function handleClick(e: Event) {
    const desktopResolution = window.matchMedia("(min-width: 820px)");
    if (desktopResolution.matches === true) return;

    const cell = e.target as HTMLElement;
    const shipName = state.selectedShip;
    const orientation = state.orientation;

    if (!cell.matches(".gameboard-cell")) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    placeShip(shipName, x, y, orientation);
  }

  if (mode === "place-ship") {
    gameboard.addEventListener("dragover", handleDragOver);
    gameboard.addEventListener("click", handleClick);
    gameboard.addEventListener("drop", handleDrop);
  }

  if (user === "player" && mode === "attack") {
    const shipsPosition = player.getShipsPosition();

    for (const shipName in shipsPosition) {
      const x = shipsPosition[shipName as keyof Ships].x;
      const y = shipsPosition[shipName as keyof Ships].y;
      const orientation = shipsPosition[shipName as keyof Ships].orientation;

      const ship = Ship(shipName as keyof Ships, false, orientation, x, y);
      gameboard.appendChild(ship);
    }
  }

  function handleReceiveAttack(enemyId: "1" | "2", x: number, y: number) {
    handleTurn(enemyId, x, y);
  }

  if (user === "enemy" && mode === "attack") {
    gameboard.addEventListener("click", (e) => {
      const cell = e.target as HTMLElement;
      if (!cell.matches(".gameboard-cell")) return;

      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);

      handleReceiveAttack("1", x, y);
    });
  }

  const header = (node as HTMLElement).querySelector(".gameboard-header");
  header.textContent = user === "player" ? "FRIENDLY WATERS" : "ENEMY WATERS";
  return node;
};
