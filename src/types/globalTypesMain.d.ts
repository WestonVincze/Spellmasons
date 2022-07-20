import type * as PIXI from 'pixi.js';
import type * as Player from '../entity/Player';
import type * as Unit from '../entity/Unit';
import type Underworld from '../Underworld';
import type PieClient from '@websocketpie/client';
import type { Vec2 } from '../jmath/Vec';
import type { LevelData } from '../Underworld';
import type { View } from '../views';
import type { Faction } from './commonTypes';
import type { IPickup } from '../entity/Pickup';
import type { ForceMove } from '../jmath/moveWithCollision';
import type { IHostApp } from '../network/networkUtil';

declare global {
    var pixi: typeof PIXI | undefined;
    var SPELLMASONS_PACKAGE_VERSION: string;
    var latencyPanel: Stats.Panel;
    var runPredictionsPanel: Stats.Panel;
    var underworld: Underworld;
    // A reference to the player instance of the client playing on this instance
    var player: Player.IPlayer | undefined;
    // Globals needed for Golems-menu
    // pie will be undefiend for Headless server
    var pie: PieClient | IHostApp;
    var connect_to_wsPie_server: (wsUri?: string) => Promise<void>;
    var joinRoom: (_room_info: any) => (undefined | Promise<unknown>);
    var setupPixiPromise: Promise<void>;
    var pixiPromiseResolver: () => void;
    // Svelte menu handles
    var exitCurrentGame: () => void;
    var closeMenu: () => void;
    // Sets which route of the menu is available; note, the view must also
    // be set to Menu in order to SEE the menu
    var setMenu: (route: string) => void;
    // Used to tell the menu if a game is ongoing or not
    var updateInGameMenuStatus: () => void;
    // The menu will call this if the user chooses to skip the tutorial
    var skipTutorial: () => void;

    var save: (title: string) => void;
    var load: (title: string) => void;
    var getAllSaveFiles: () => string[];
    // Save pie messages for later replay
    var saveReplay: (title: string) => void;
    // Used to replay onData messages for development
    var replay: (title: string) => void;
    // Current client's id
    var clientId: string;
    var animatingSpells: boolean;
    var view: View;
    // For development use
    var giveMeCard: (cardId: string, quantity: number) => void;
    // Set to true in developer console to see debug information
    var showDebug: boolean;
    // Draw the "walk rope" to show a player how far they can travel.
    var walkPathGraphics: PIXI.Graphics | undefined;
    // Graphics for drawing debug information, use window.showDebug = true
    // to show at runtime. Automatically draws pathing bounds, walls, etc
    var debugGraphics: PIXI.Graphics | undefined;
    // Graphics for drawing debug information a-la-carte
    var devDebugGraphics: PIXI.Graphics | undefined;
    // Shows radiuses for spells
    var radiusGraphics: PIXI.Graphics | undefined;
    // Graphics to show what other players are thinking
    var thinkingPlayerGraphics: PIXI.Graphics | undefined;
    // Graphics for drawing unit health and mana bars
    var unitOverlayGraphics: PIXI.Graphics | undefined;
    // Graphics for drawing the spell effects during the dry run phase
    var predictionGraphics: PIXI.Graphics | undefined;
    // Graphics for rendering above board and walls but beneath units and doodads,
    // see containerPlanningView for exact render order.
    var planningViewGraphics: PIXI.Graphics | undefined;
    // Graphics for debugging the cave
    var debugCave: PIXI.Graphics | undefined;
    var allowCookies: boolean;
    var playMusic: () => void;
    var changeVolume: (volume: number) => void;
    var changeVolumeMusic: (volume: number) => void;
    var changeVolumeGame: (volume: number) => void;
    var volume: number = 1.0;
    var volumeMusic: number;
    var volumeGame: number;
    var startSingleplayer: () => Promise<void>;
    var startMultiplayer: (wsPieUrl: string) => Promise<void>;
    // Used to ensure that the current client's turn doesn't end while they are still walking
    // If they invoke endMyTurn() while they are walking, it will wait until they are done
    // walking to end their turn.  If they are not walking, it will end immediately.
    // This property will always be a promise, since it is set immediately below as a resolved
    // promise.  This is so that the promise is always resolved UNLESS the player is currently
    // walking.
    var playerWalkingPromise: Promise<void>;
    // makes a pop up prompting the user to accept cookies
    var cookieConsentPopup: (forcePopup: boolean) => void;
    // A zoom value that the camera zoom will lerp to
    var zoomTarget: number;
    // A list of enemy ids that have been encountered by this client
    // Used to introduce new enemies
    var enemyEncountered: string[];
    // Make me superhuman (used for dev)
    var superMe: () => void;
    // A local copy of underworld.units used to predict damage and mana use from casting a spell
    var predictionUnits: Unit.IUnit[] | undefined;
    // A local copy of underworld.pickups used to predict effect from casting a spell
    var predictionPickups: IPickup[] | undefined;
    // Shows icons above the heads of enemies who will damage you next turn
    var attentionMarkers: { imagePath: string, pos: Vec2 }[];
    // Shows icon for units that will be successfully resurrected
    var resMarkers: Vec2[];
    // Keep track of the LevelData from the last level that was created in
    // case it needs to be sent to another client
    var lastLevelCreated: LevelData;
    // True if client player has casted this turn;
    // Used to prompt before ending turn without taking any action
    var castThisTurn: boolean;
    // Turns on fps monitoring
    var monitorFPS: () => void;
    // A hash of the last thing this client was thinking
    // Used with MESSAGE_TYPES.PLAYER_THINKING so other clients 
    // can see what another client is planning.
    // The hash is used to prevent sending the same data more than once
    var lastThoughtsHash: string;
    var playerThoughts: { [clientId: string]: { target: Vec2, cardIds: string[] } };
    // A list of units and pickups and an endPosition that they are moved to via a "force",
    // like a push or pull or explosion.
    var forceMove: ForceMove[];
    // Middle Mouse Button Down
    // Note: do NOT set directly, use setMMBDown instead
    var MMBDown: boolean;
    // Used to set MMBDown so it will affect CSS too
    var setMMBDown: (isDown: boolean) => void;
    // Right Mouse Button Down
    // Note: do NOT set directly, use setRMBDown instead
    var RMBDown: boolean;
    // Used to set Right mouse button down
    var setRMBDown: (isDown: boolean) => void;
    var notifiedOutOfStamina: boolean;
    // Allows manually overriding the underworld seed via the JS console
    var seedOverride: string | undefined;
    // devMode: auto picks character and upgrades
    var devMode: boolean;
    // Used for development to debug the original information used to make a map
    var map: any;
    var devSpawnUnit: (unitId: string, faction: Faction) => void;
    var devSpawnAllUnits: () => void;
    var devRemoveAllEnemies: () => void;
    // true if this instance is the headless server with no visuals or audio, just the game logic
    var headless: boolean;
    // Move audio functions into global so they can be injected IF audio is supported
    var playNextSong: () => void | undefined;
    var playSFX: (path?: string) => void | undefined;
    var playSFXKey: (key: string) => void | undefined;
    var sfx: { [key: string]: string } | undefined;
    // svelte menu function to attempt to autoconnect if the queryString holds the info
    var tryAutoConnect: () => void;
    // Returns true if client is playing singleplayer OR if hostapp
    var isHost: () => boolean;
}
