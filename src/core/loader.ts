import * as Y from "yjs";
import { Prefixes } from "../config/prefixes";
import { Store } from "./store";
/**
 * Stores the data for each modset as well as preferences
 */
export class GameLoader extends Store {
    readonly modsets: Y.Map<Y.Array<Y.Map<any>>>;
    readonly lastModset: Y.Text;
    readonly preferences: Y.Map<any>;
    constructor() {
        super(Prefixes.MODSETS);
        this.modsets = this.doc.getMap("modsets");
        this.lastModset = this.doc.getText("lastModset");
        this.preferences = this.doc.getMap("preferences");
    }
    override async initialize() {
        await super.initialize();
        this.garbageCollect();
    }
    isInitialized() {
        return this.modsets.size > 0 && this.lastModset.length > 0;
    }
    async initToDefaults() {
        const LATEST_NAME = "latest";
        this.modsets.set<Y.Array<Y.Map<any>>>(LATEST_NAME, new Y.Array<Y.Map<any>>());
        this.lastModset.insert(0, LATEST_NAME);
    }
}
