import {AccessorCallback} from '../../types/accesor-callback';
import {DataSelector} from '../../types/data-selector';
import {EventEmitter} from '../event-emitter';

/**
 * Index IndexStore - stores root index for single native store
 * Returns index.
 * Emits event when index changes with changed store identifier and index identifier
 *
 * @example: for following index definitions:
 * - IndexStore.index('id');
 * - IndexStore.index(['group', 'name']);
 *
 * And provided store in shape of:
 *  let a = {
 *      keyA: {
 *          id: 1,
 *          group: {
 *              name: 'arrayEntryA'
 *          }
 *      },
 *      keyB: {
 *          id: 2
 *      }
 *  };
 *
 *   We produce index as per required value
 *   const index = {
 *      'id': {
 *          1: ['keyA'],
 *          2: ['keyB']
 *      },
 *      'group.name': {
 *          'arrayEntryA': ['keyB']
 *      }
 *  };
 */
export class IndexStore extends EventEmitter {

    /**
     * Checks if provided value for index id is valid
     *
     * @param dataSelector {*}
     * @return {boolean}
     */
    public static isValidDataSelector(dataSelector: DataSelector | any): boolean{
        // if group of keys (for nested selectors)
        if (Array.isArray(dataSelector)){
            // each key is valid
            return dataSelector.every((key) => {
                return Number.isInteger(dataSelector[key]) || typeof dataSelector[key] === 'string';
            });
        }

        // if not array just check as a single key
        return Number.isInteger(dataSelector) || typeof dataSelector === 'string';
    }

    /**
     * Checks if provided object is a valid store
     *
     * @param store {*}
     * @return {boolean}
     */
    public static isValidStore(store){
        return Array.isArray(store) || typeof store === 'object';
    }

    /**
     * Get flat index selector from data selector
     *
     * @param dataSelector {(string | number)[]} path to retrieve data - used to construct index selector
     * @return {string}
     * @private
     */
    protected static toIndexKey(dataSelector){
        return Array.isArray(dataSelector) ? dataSelector.join('.') : dataSelector;
    }

    /**
     * Get flat index selector from data selector
     *
     * @param indexKey {string | number} key to retrieve index
     * @return {string}
     * @private
     */
    protected static toDataSelector(indexKey){
        if (typeof indexKey === 'number'){
            return [indexKey];
        }

        // for string key we split it
        return indexKey.split('.');
    }

    /**
     *
     * @param storeEntry {any} Entry to traverse to index
     * @param dataSelector {string|number[]}
     * @return {*}
     * @private
     */
    protected static getNestedValue(storeEntry, dataSelector){
        return dataSelector.reduce((result, key) => {
            // if we got key but no more nested props lets skip this entry
            if (typeof result !== 'object'){
                throw new Error();
            }

            return result[key];
        }, storeEntry);
    }

    protected nativeStore = {};
    protected indexes = {};
    protected indexCallbacks = {};

    constructor(store){
        super();
    }

    /**
     * Get single index entry accessor
     *
     * @example: IndexStore.for('id').equal(value);
     * @example: IndexStore.for('group', 'name').equal(value);
     * @example: IndexStore.for('company', 'syntheticName').equal(value);
     *
     * @param dataSelector {(string | number)[]} Index identifier
     */
    public for(dataSelector){
        const a = 1;
    }

    /**
     * Build/rebuild index for specific store
     * If no ids provided all will be rebuild.
     *
     * Build all possible indexes
     * @example: IndexService.index();
     *
     * Build all indexes for store
     * @example: IndexStore.index();
     *
     * Rebuild specific simple index
     * @example: IndexStore.index('keyA');
     *
     * Rebuild specific nested index where we index {group: {name: value}}
     * @example: IndexStore.index('keyB', 'keyC');
     *
     * Sets complex index where for each store entry we index value retrieved from callback
     * @example: IndexStore.index('nonExistingKey', someCallback);
     * @example: IndexStore.index('keyD', 'nonExistingKey', someCallback);
     */
    public index(dataSelector?: DataSelector, callbackAccessor?: AccessorCallback){
        // if no selector lets build all
        if (!IndexStore.isValidDataSelector(dataSelector)){
            this.buildForAll();
            return this;
        }

        const indexKey = IndexStore.toIndexKey(dataSelector);

        // if callback provided
        if (typeof callbackAccessor === 'function'){
            this.indexCallbacks[indexKey] = callbackAccessor;
        }

        dataSelector = Array.isArray(dataSelector) ? dataSelector : [dataSelector];

        this.buildIndex(indexKey, dataSelector);

        return this;
    }

    /**
     * Remove single index
     *
     * @example: IndexStore.delete('id').where(value);
     * @example: IndexStore.delete('group', 'name').where(value);
     * @example: IndexStore.delete('company', 'syntheticName').where(value);
     *
     * @param dataSelector {(string | number)[]} Index identifier
     * @return {IndexStore}
     */
    public delete(dataSelector){
        if (!IndexStore.isValidDataSelector(dataSelector)){
            throw new Error(`Cant remove index - invalid index id provided`);
        }

        const indexKey = IndexStore.toIndexKey(dataSelector);

        // remove index data & definition
        delete this.indexes[indexKey];
        delete this.indexCallbacks[indexKey];

        return this;
    }

    /**
     * Register store which entries should be indexed
     *
     * @example: IndexService.register('notification', notificationStore);
     *
     * @param store {Object | any[]} Store which entries should be indexed
     */
    public register(store){
        if (!IndexStore.isValidStore(store)){
            throw new Error(`Cant create store - invalid store provided`);
        }
        const storeAlreadyRegistered = !!this.nativeStore;
        this.nativeStore = store;

        if (storeAlreadyRegistered){
            // if we register store again lets rebuild index
            this.index();
        }
    }

    /**
     * Build for all properties based on first available entry from the store
     * @private
     */
    protected buildForAll(){
        // TODO: can we efficiently traverse nested object to build all possible indexes not only for selectors?
        Object.keys(this.indexes).forEach((indexKey) => {
            this.buildIndex(indexKey);
        });
    }

    /**
     * Build single index
     * @param indexKey
     * @param dataSelector? {(string | number)[]} Index selector get data from store
     * @private
     */
    protected buildIndex(indexKey, dataSelector = null){
        // TODO: implement
        // get callback
        // get all values for object
        // if no data selector
        if (!dataSelector){
            dataSelector = IndexStore.toDataSelector(indexKey);
        }

        const storeKeys = this.getStoreKeys();
        const callback = this.indexCallbacks[indexKey];

        // index values pointed to by selector for each entries in the store
        storeKeys.forEach((storeEntryKey) => {
            const storeEntry = this.nativeStore[storeEntryKey];
            let entryValue;

            // if callback exists get value from callback
            if (callback){
                entryValue = callback(storeEntry);
            } else {
                // else use selector to extract data
                entryValue = IndexStore.getNestedValue(storeEntry, dataSelector);

                // if not number or string
                const entryValueType = typeof entryValue;
                if (!['number', 'string'].includes(entryValueType)){
                    // parse to produce string - its not consistent across browsers but still better for e.g. arrays
                    entryValue = JSON.parse(entryValue);
                }
            }

            // if index dont exist create entry
            if (!this.indexes[indexKey]){
                this.indexes[indexKey] = {};
            }

            // if index for extracted value dont exist create one
            if (this.indexes[indexKey].hasOwnProperty(entryValue)){
                this.indexes[indexKey][entryValue] = [];
            }

            // add entry key to the list of positions with the same value
            this.indexes[indexKey][entryValue].push(storeEntryKey);
        });

    }

    /**
     * Get native store keys
     * @private
     * @return {(string | number)[]}
     */
    protected getStoreKeys(){
        let keys;
        // access store keys depanding on store type
        if (Array.isArray(this.nativeStore)){
            keys = Object.keys(this.nativeStore).map((stringKey) => {
                return Number.parseInt(stringKey, 10);
            });
        } else {
            keys = Object.keys(this.nativeStore);
        }

        return keys;
    }
}
