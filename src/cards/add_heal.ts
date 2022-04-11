import * as Unit from '../Unit';
import { Spell, targetsToUnits } from '.';

const id = 'heal';
const healAmount = 3;

const spell: Spell = {
  card: {
    id,
    manaCost: 10,
    healthCost: 0,
    probability: 50,
    thumbnail: 'heal.png',
    description: `
Heals all targets ${healAmount} HP.
Will not heal beyond maximum health.
    `,
    effect: async (state, dryRun) => {
      for (let unit of targetsToUnits(state.targets)) {
        const damage = -healAmount;
        Unit.takeDamage(unit, damage, dryRun, state);
      }
      return state;
    },
  },
};
export default spell;
