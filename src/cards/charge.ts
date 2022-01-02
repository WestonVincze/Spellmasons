import * as Unit from '../Unit';
import type { Spell } from '.';
import { drawSwapLine } from '../ui/PlanningView';

const id = 'charge';
const spell: Spell = {
  card: {
    id,
    thumbnail: 'charge.png',
    probability: 5,
    description: `
Moves the caster in a straight line towards the initial target
if the target is on the same horizontal or vertical axis as the caster.
    `,
    effect: async (state, dryRun) => {
      const { casterUnit, targets } = state;
      const originalTarget = targets[0];

      if (dryRun) {
        drawSwapLine(casterUnit, originalTarget);
      } else {
        Unit.setLocation(casterUnit, originalTarget);
      }
      return state;
    },
  },
};
export default spell;
