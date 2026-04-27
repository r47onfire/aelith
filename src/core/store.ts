import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { Keys } from "../config/keys";

export abstract class Store {
    _doc: Y.Doc;
    _offlineDB: IndexeddbPersistence;
    constructor(public readonly storeName: string) {
        this._offlineDB = new IndexeddbPersistence(Keys.ROOT_PREFIX + storeName, this._doc = new Y.Doc);
    }
    async init() {
        await this._offlineDB.whenSynced;
        if (!this._isInitialized()) await this._initToDefaults();
        this._garbageCollect();
    }
    protected abstract _isInitialized(): boolean;
    protected abstract _initToDefaults(): Promise<void>;
    protected _garbageCollect() {
        const update = Y.encodeStateAsUpdateV2(this._doc, Y.encodeStateVector(this._doc));
        Y.applyUpdateV2(this._doc = new Y.Doc({ guid: this._doc.guid }), update);
    }
}
