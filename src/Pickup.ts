import * as Image from './Image';
import type * as Player from './Player';
import { containerUnits } from './PixiUtils';
import type { IUnit } from './Unit';
import { checkIfNeedToClearTooltip } from './ui/PlanningView';
import { explainManaOverfill } from './Jprompt';
import { MESSAGE_TYPES } from './MessageTypes';

export const PICKUP_RADIUS = 32;
export interface IPickup {
  x: number;
  y: number;
  name: string;
  description: string;
  imagePath: string;
  image: Image.IImage;
  // Only can be picked up once
  singleUse: boolean;
  // Only can be picked up by players
  playerOnly: boolean;
  // effect is ONLY to be called within triggerPickup
  effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => void;
}
interface IPickupSource {
  name: string;
  description: string;
  imagePath: string;
  animationSpeed?: number;
  playerOnly?: boolean;
  scale: number;
  effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => void;
}

export function create(
  x: number,
  y: number,
  pickupSource: IPickupSource,
  singleUse: boolean,
  animationSpeed: number = 0.1,
  playerOnly: boolean,
): IPickup {
  const { name, description, imagePath, effect, scale } = pickupSource;
  const self: IPickup = {
    x,
    y,
    name,
    description,
    imagePath,
    // Pickups are stored in containerUnits so that they
    // will be automatically z-indexed
    image: Image.create({ x, y }, imagePath, containerUnits, { animationSpeed, loop: true }),
    singleUse,
    playerOnly,
    effect,
  };
  self.image.sprite.scale.x = scale;
  self.image.sprite.scale.y = scale;

  window.underworld.addPickupToArray(self);

  return self;
}
export function setPosition(pickup: IPickup, x: number, y: number) {
  pickup.x = x;
  pickup.y = y;
  Image.setPosition(pickup.image, { x, y });
}
export type IPickupSerialized = Omit<IPickup, "image" | "effect"> & {
  image: Image.IImageSerialized
};
export function serialize(p: IPickup): IPickupSerialized {
  // effect is a callback and cannot be serialized
  const { effect, ...rest } = p;
  const serialized: IPickupSerialized = {
    ...rest,
    image: Image.serialize(p.image),
  };
  return serialized;
}
// Reinitialize a pickup from another pickup object, this is used in loading game state after reconnect
export function load(pickup: IPickup) {
  // Get the pickup object
  let foundPickup = pickups.find((p) => p.imagePath == pickup.imagePath);
  // If it does not exist, perhaps it is a special pickup such as a portal
  if (!foundPickup) {
    foundPickup = specialPickups[pickup.imagePath];
  }
  if (foundPickup) {
    const self = create(
      pickup.x,
      pickup.y,
      foundPickup,
      pickup.singleUse,
      0.1,
      pickup.playerOnly,
    );
    return self;
  } else {
    throw new Error(`Could not load pickup with path ${pickup.imagePath}`);
  }
}
export function removePickup(pickup: IPickup) {
  Image.cleanup(pickup.image);
  window.underworld.removePickupFromArray(pickup);
  checkIfNeedToClearTooltip();
}
export function triggerPickup(pickup: IPickup, unit: IUnit) {
  const player = window.underworld.players.find((p) => p.unit === unit);
  if (pickup.playerOnly && !player) {
    // If pickup is playerOnly, do not trigger if a player is not the one triggering it
    return;
  }
  pickup.effect({ unit, player });
  if (pickup.singleUse) {
    removePickup(pickup);
  }
}

// Special pickups are not stored in the pickups array because they shouldn't be
// randomly selected when adding pickups to a generated level.
export const specialPickups: { [image: string]: IPickupSource } = {
  'portal': {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    name: 'Portal',
    scale: 1,
    description:
      'Takes you to the next level when all players are either in the portal or dead.',
    effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => {
      // Only send the ENTER_PORTAL message from
      // the client of the player that entered the portal
      if (player && player == window.player) {
        window.pie.sendData({
          type: MESSAGE_TYPES.ENTER_PORTAL
        });
      }
      // Move the player unit so they don't continue to trigger the pickup more than once
      if (player && player.unit) {
        player.unit.resolveDoneMoving();
        player.unit.x = NaN;
        player.unit.y = NaN;
      }
    },
  },
};
const manaPotionRestoreAmount = 40;
const healthPotionRestoreAmount = 10;
export const pickups: IPickupSource[] = [
  {
    imagePath: 'pickups/mana-potion',
    name: 'Mana Potion',
    description: `Restores ${manaPotionRestoreAmount} mana.  May overfill mana.`,
    scale: 0.5,
    effect: ({ unit, player }) => {
      if (player) {
        player.unit.mana += manaPotionRestoreAmount;
        explainManaOverfill();
        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the mana bar
        // (note: this would be auto corrected on the next mouse move anyway)
        window.underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
  {
    imagePath: 'pickups/health-potion.png',
    name: 'Health Potion',
    scale: 0.5,
    description: `Restores ${healthPotionRestoreAmount} health.`,
    effect: ({ unit, player }) => {
      if (player) {
        player.unit.health += healthPotionRestoreAmount;
        // Cap health at max
        player.unit.health = Math.min(player.unit.health, player.unit.healthMax);
        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the health bar
        // (note: this would be auto corrected on the next mouse move anyway)
        window.underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
];