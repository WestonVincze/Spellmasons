import type * as PIXI from 'pixi.js';
import * as Image from '../graphics/Image';
import type * as Player from './Player';
import { addPixiSprite, containerUnits, pixiText } from '../graphics/PixiUtils';
import { IUnit, takeDamage } from './Unit';
import { checkIfNeedToClearTooltip } from '../graphics/PlanningView';
import { explainManaOverfill } from '../graphics/Jprompt';
import { MESSAGE_TYPES } from '../types/MessageTypes';
import floatingText from '../graphics/FloatingText';
import * as CardUI from '../graphics/ui/CardUI';
import * as Cards from '../cards';
import * as config from '../config';
import { chooseObjectWithProbability } from '../mathematics/math';
import seedrandom from 'seedrandom';
import { Vec2 } from '../mathematics/Vec';

export const PICKUP_RADIUS = config.COLLISION_MESH_RADIUS;
export interface IPickup {
  x: number;
  y: number;
  radius: number;
  name: string;
  description: string;
  imagePath: string;
  image?: Image.IImageAnimated;
  // Only can be picked up once
  singleUse: boolean;
  // Only can be picked up by players
  playerOnly: boolean;
  // Pickups optionally have a "time limit" and will disappear after this many turns
  turnsLeftToGrab?: number;
  // Defines custom behavior when turnsLeftToGrab reaches 0
  onTurnsLeftDone?: (self: IPickup) => Promise<void>;
  text?: PIXI.Text;
  // effect is ONLY to be called within triggerPickup
  // returns true if the pickup did in fact trigger - this is useful
  // for preventing one use health potions from triggering if the unit
  // already has max health
  effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => boolean | undefined;
}
interface IPickupSource {
  name: string;
  description: string;
  imagePath: string;
  animationSpeed?: number;
  singleUse: boolean;
  playerOnly?: boolean;
  turnsLeftToGrab?: number;
  scale: number;
  probability: number;
  effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => boolean | undefined;
}
export function copyForPredictionPickup(p: IPickup): IPickup {
  // Remove image and text since prediction pickups won't be rendered
  const { image, text, ...rest } = p;
  return {
    ...rest
  }
}

export function create({ pos, pickupSource, onTurnsLeftDone }:
  {
    pos: Vec2, pickupSource: IPickupSource, onTurnsLeftDone?: (self: IPickup) => Promise<void>
  }) {
  const { name, description, imagePath, effect, scale, singleUse, animationSpeed, playerOnly = false, turnsLeftToGrab } = pickupSource;
  const { x, y } = pos
  const self: IPickup = {
    x,
    y,
    radius: PICKUP_RADIUS,
    name,
    description,
    imagePath,
    // Pickups are stored in containerUnits so that they
    // will be automatically z-indexed
    image: Image.create({ x, y }, imagePath, containerUnits, { animationSpeed, loop: true }),
    singleUse,
    playerOnly,
    effect,
    onTurnsLeftDone
  };
  if (self.image) {
    self.image.sprite.scale.x = scale;
    self.image.sprite.scale.y = scale;
  }
  if (turnsLeftToGrab) {
    self.turnsLeftToGrab = turnsLeftToGrab;

    // Only add timeCircle and text if the pickup has an image (meaning it is rendered)
    // Prediction pickups are not rendered and don't need these.
    if (self.image) {

      const timeCircle = addPixiSprite('time-circle.png', self.image.sprite);
      timeCircle.anchor.x = 0;
      timeCircle.anchor.y = 0;

      self.text = pixiText(`${turnsLeftToGrab}`, { fill: 'white', align: 'center' });
      self.text.anchor.x = 0;
      self.text.anchor.y = 0;
      // Center the text in the timeCircle
      self.text.x = 8;
      self.image.sprite.addChild(self.text);
    }
  }

  window.underworld.addPickupToArray(self, false);

  return self;
}

export function syncImage(pickup: IPickup) {
  if (pickup.image) {
    pickup.image.sprite.x = pickup.x;
    pickup.image.sprite.y = pickup.y;
  }
}
export function setPosition(pickup: IPickup, x: number, y: number) {
  pickup.x = x;
  pickup.y = y;
  Image.setPosition(pickup.image, { x, y });
}
export type IPickupSerialized = Omit<IPickup, "image" | "effect"> & {
  image?: Image.IImageAnimatedSerialized
};
export function serialize(p: IPickup): IPickupSerialized {
  // effect is a callback and cannot be serialized
  const { effect, ...rest } = p;
  const serialized: IPickupSerialized = {
    ...rest,
    image: p.image ? Image.serialize(p.image) : undefined,
  };
  return serialized;
}
// Reinitialize a pickup from another pickup object, this is used in loading game state after reconnect
export function load(pickup: IPickup) {
  // Get the pickup object
  let foundPickup = pickups.find((p) => p.imagePath == pickup.imagePath);
  if (foundPickup) {
    // TODO verify that complex pickup behavior like onTurnsLeftDone still work after load, traps
    // probably don't work after load because callbacks can't be serialized
    const self = { ...create({ pos: pickup, pickupSource: foundPickup }), ...pickup };
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
  const didTrigger = pickup.effect({ unit, player });
  // Only remove pickup if it triggered AND is a singleUse pickup
  if (pickup.singleUse && didTrigger) {
    removePickup(pickup);
  }
}

const manaPotionRestoreAmount = 40;
const healthPotionRestoreAmount = 5;
const spike_damage = 6;
export const pickups: IPickupSource[] = [
  {
    imagePath: 'pickups/spikes',
    animationSpeed: -0.5,
    playerOnly: false,
    singleUse: true,
    name: 'Spike Pit',
    probability: 70,
    scale: 1,
    description: `Deals ${spike_damage} to any unit (including NPCs) that touches it`,
    effect: ({ unit, player }: { unit?: IUnit; player?: Player.IPlayer }) => {
      if (unit) {
        takeDamage(unit, spike_damage, false)
        return true;
      }
      return false;
    }
  },
  {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    singleUse: false,
    name: 'Portal',
    probability: 0,
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
      return true;
    },
  },
  {
    imagePath: 'pickups/card',
    name: 'Cards',
    description: 'Grants the player a new spell',
    probability: 10,
    singleUse: true,
    scale: 0.5,
    turnsLeftToGrab: 4,
    playerOnly: true,
    effect: ({ unit, player }) => {
      if (player) {
        const numCardsToGive = 1;
        for (let i = 0; i < numCardsToGive; i++) {
          const cardsToChooseFrom = Object.values(Cards.allCards).filter(card => !player.cards.includes(card.id));
          const card = chooseObjectWithProbability(cardsToChooseFrom, seedrandom());
          if (card) {
            CardUI.addCardToHand(card, player);
          } else {
            floatingText({
              coords: {
                x: player.unit.x,
                y: player.unit.y
              },
              text: `You have all of the cards already!`
            });
          }
        }
        return true;
      }
      return false;
    },
  },
  {
    imagePath: 'pickups/manaPotion',
    animationSpeed: 0.2,
    name: 'Mana Potion',
    description: `Restores ${manaPotionRestoreAmount} mana.  May overfill mana.`,
    probability: 80,
    singleUse: true,
    scale: 1.0,
    playerOnly: true,
    effect: ({ unit, player }) => {
      if (player) {
        player.unit.mana += manaPotionRestoreAmount;
        explainManaOverfill();
        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the mana bar
        // (note: this would be auto corrected on the next mouse move anyway)
        window.underworld.syncPlayerPredictionUnitOnly();
        return true;
      }
      return false;
    },
  },
  {
    imagePath: 'pickups/healthPotion',
    animationSpeed: 0.2,
    name: 'Health Potion',
    probability: 80,
    scale: 1.0,
    playerOnly: true,
    singleUse: true,
    description: `Restores ${healthPotionRestoreAmount} health.`,
    effect: ({ player }) => {
      if (player && player.unit.health < player.unit.healthMax) {
        takeDamage(player.unit, -healthPotionRestoreAmount, false);
        // Cap health at max
        player.unit.health = Math.min(player.unit.health, player.unit.healthMax);
        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the health bar
        // (note: this would be auto corrected on the next mouse move anyway)
        window.underworld.syncPlayerPredictionUnitOnly();
        return true;
      }
      return false;
    },
  },
];