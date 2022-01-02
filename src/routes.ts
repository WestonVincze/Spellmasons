import { addPixiContainersForRoute, recenterStage } from './PixiUtils';
import {
  clickHandler,
  clickHandlerOverworld,
  contextmenuHandler,
  endTurnBtnListener,
  keydownListener,
  keyupListener,
  mousemoveHandler,
} from './ui/eventListeners';
import * as Overworld from './overworld';
import { turn_phase } from './Underworld';
import { createUpgradeElement, generateUpgrades } from './Upgrade';
import { View } from './views';

export enum Route {
  // Overworld is where players, as a team, decide which level to tackle next
  Overworld,
  // Underworld contains the grid with levels and casting
  Underworld,
  // Post combat
  Upgrade,
}
// temp for testing
window.setRoute = setRoute;

export function setRoute(r: Route) {
  console.log('Set game route', Route[r]);
  for (let route of Object.keys(Route)) {
    document.body.classList.remove(`route-${route}`);
  }
  document.body.classList.add(`route-${Route[r]}`);
  window.route = r;
  if (window.view === View.Game) {
    addPixiContainersForRoute(r);
  }

  // Remove previous event listeners:
  removeOverworldEventListeners();
  removeUnderworldEventListeners();
  switch (r) {
    case Route.Overworld:
      // Picking a level brings players to Underworld from Overworld
      const overworld = Overworld.generate();
      window.overworld = overworld;
      Overworld.draw(overworld);
      addOverworldEventListeners();

      break;
    case Route.Underworld:
      // Set the first turn phase
      window.underworld.setTurnPhase(turn_phase.PlayerTurns);
      addUnderworldEventListeners();
      // Beating a level takes players from Underworld to Upgrade
      break;
    case Route.Upgrade:
      const elUpgradePicker = document.getElementById('upgrade-picker');
      const elUpgradePickerContent = document.getElementById(
        'upgrade-picker-content',
      );
      elUpgradePicker && elUpgradePicker.classList.remove('active');
      elUpgradePicker && elUpgradePicker.classList.add('active');
      const player = window.underworld.players.find(
        (p) => p.clientId === window.clientId,
      );
      if (player) {
        const upgrades = generateUpgrades(player);
        const elUpgrades = upgrades.map((upgrade) =>
          createUpgradeElement(upgrade, player),
        );
        if (elUpgradePickerContent) {
          elUpgradePickerContent.innerHTML = '';
          for (let elUpgrade of elUpgrades) {
            elUpgradePickerContent.appendChild(elUpgrade);
          }
        }
      } else {
        console.error('Upgrades cannot be generated, player not found');
      }
      break;
  }
  // Recentering should happen after stage setup
  // because, for example, route Overworld requires up-to-date knowledge
  // of the overworld to center the camera
  recenterStage();
}
const elEndTurnBtn: HTMLButtonElement = document.getElementById(
  'endTurn',
) as HTMLButtonElement;
elEndTurnBtn.addEventListener('click', endTurnBtnListener);

function addOverworldEventListeners() {
  // Add keyboard shortcuts
  document.body.addEventListener('click', clickHandlerOverworld);
}
function removeOverworldEventListeners() {
  document.body.removeEventListener('click', clickHandlerOverworld);
}
function addUnderworldEventListeners() {
  // Add keyboard shortcuts
  window.addEventListener('keydown', keydownListener);
  window.addEventListener('keyup', keyupListener);
  document.body.addEventListener('contextmenu', contextmenuHandler);
  document.body.addEventListener('click', clickHandler);
  document.body.addEventListener('mousemove', mousemoveHandler);
}

function removeUnderworldEventListeners() {
  // Remove keyboard shortcuts
  window.removeEventListener('keydown', keydownListener);
  window.removeEventListener('keyup', keyupListener);
  // Remove mouse and click listeners
  document.body.removeEventListener('contextmenu', contextmenuHandler);
  document.body.removeEventListener('click', clickHandler);
  document.body.removeEventListener('mousemove', mousemoveHandler);
}
