import { Route, setRoute } from './routes';
import AnimationTimeline from './AnimationTimeline';
import type * as Player from './Player';
import type Game from './Game';

window.animationTimeline = new AnimationTimeline();
setRoute(Route.Menu);

declare global {
  interface Window {
    latencyPanel: Stats.Panel;
    animationTimeline: AnimationTimeline;
    game: Game;
    // A reference to the player instance of the client playing on this instance
    player: Player.IPlayer;
    pie: any;
    save: (title: string) => void;
    load: (title: string) => void;
    // Save pie messages for later replay
    saveReplay: (title: string) => void;
    // Used to replay onData messages for development
    replay: (title: string) => void;
    // Current clients id
    clientId: string;
    // Shows the "planningView" where golems can attack,
    // allows for left clicking to ping to other players
    planningViewActive: boolean;
    animatingSpells: boolean;
  }
}
