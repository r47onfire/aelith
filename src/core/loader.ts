import * as Y from "yjs";
import { Keys } from "../config/keys";
import { Store } from "./store";

/**
 * Stores the data for the world, the loaded mods, etc
 */
export class GameWorld extends Store {
    readonly _mods: Y.Map<Y.Array<Y.Map<any>>>;
    readonly _localPrefs: Y.Map<any>;
    constructor(worldID: string) {
        super(Keys.WORLD_PREFIX + worldID);
        this._mods = this._doc.getMap(Keys.PER_WORLD_MODS_KEY);
        this._localPrefs = this._doc.getMap(Keys.PER_WORLD_PREFERENCES_KEY);
    }
    _isInitialized() {
        return this._localPrefs.size > 0;
    }
    async _initToDefaults() {
        this._localPrefs.set("_firstLoad", false);
    }
}

/**
 * Stores the data for global settings and stuff, such as global preferences, mod settings, etc
 */
export class GlobalSettings extends Store {
    _worlds: Y.Array<string>;
    _preferences: Y.Map<any>;
    _lastModset: Y.Text;
    constructor() {
        super(Keys.GLOBAL_SETTINGS);
        this._worlds = this._doc.getArray(Keys.GLOBAL_WORLDS_KEY);
        this._preferences = this._doc.getMap(Keys.GLOBAL_PREFERENCES_KEY);
        this._lastModset = this._doc.getText(Keys.GLOBAL_LAST_USED_MODS_KEY);
    }
    _isInitialized() {
        return this._worlds.length > 0;
    }
    async _initToDefaults() {
        this._worlds.push(_create_new_world(this._doc));
    }
}
