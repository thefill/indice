const EventEmitter = require('../../classes/event-emitter.class');
const Utils = require('../../classes/utils.class');

module.exports = IndexStore;

// TODO: test execution
testExecution();

function testExecution(){
    const arrayStore = [
        {
            id: 1,
            group: {
                name: 'arrayEntryA'
            }
        },
        {
            id: 2
        }
    ];
    const objectStore = {
        objectEntryKeyA: {
            id: 1,
            group: {
                name: 'arrayEntryA'
            }
        },
        objectEntryKeyB: {
            id: 2
        }
    };
    const syntheticCallback = (entry) => {
        return entry.id + 10;
    };

    const service = new IndexService();

    console.log('--arrayStore-----------------------');
    service.register('arrayStore', arrayStore);
    service.build('arrayStore', 'id');
    service.build('arrayStore', ['group', 'name']);
    service.build('arrayStore', 'synthetic');

    const index = service.create('arrayStore', arrayStore)
        .index('id')
        .index('group', 'name')
        .index('synthetic', syntheticCallback);

    const someIndex = index.for('arrayStore');

    someIndex.by('id').for(1);
    someIndex.by('group', 'name').for(1);

    // someIndex.get.by('id').for(1);
    // someIndex.update.by('id').for(1).
    // someIndex.delete.by('id').for(1).

    // console.log('--> store registered?', service.isStoreRegistered('arrayStore'));
    // console.log('--> store registered?', service.getIndex('arrayStore').by('id'));
    // console.log('--> store registered?', service.index['arrayStore']['group.name']);
    // console.log('--> store registered?', service.index['arrayStore']['synthetic']);
    console.log('--End-------------------------');

    console.log();
    //
    // console.log('--objectStore-----------------------');
    // console.log('--End-------------------------');
}

// TODO: end test execution

/**
 * Index IndexStore - stores root index for single native store
 * Returns index
 *
 * @example: IndexStore.index()
 * @example: IndexStore.index('keyA')
 * @example: IndexStore.index('keyB', 'keyC')
 * @example: IndexStore.index('keyD', 'nonExistingKey', someCallback)
 *
 * @example: IndexStore.build()
 * @example: IndexStore.build('keyA')
 * @example: IndexStore.build('keyB', 'keyC')
 * @example: IndexStore.build('keyD', 'nonExistingKey')
 *
 * @example: IndexStore.get('keyA').where(value);
 * @example: IndexStore.get('keyB', 'keyC').where(value);
 * @example: IndexStore.get('keyD', 'nonExistingKey').where(value);
 *
 * @example: IndexStore.delete('id').where(value);
 * @example: IndexStore.delete('group', 'name').where(value);
 * @example: IndexStore.delete('company', 'syntheticName').where(value);
 *
 * Emits event when index changes with changed store identifier and index identifier,
 * @constructor
 */
function IndexStore(){
    // This service behaves like event emitter
    const svc = EventEmitter();

    // Define available events
    svc.availableEvents = {
        CHANGE: 'CHANGE'
    };

    /**
     * Root of the index tree
     * All indexes lands here:
     * {
     *     'storeId': {
     *         'indexId': value // position / key in original store
     *         // or
     *         'indexSelector': value // position / key in original store
     *     }
     * }
     * @type {{storeId: {indexId: any}}}
     */
    svc.index = {};

    /**
     * Store for index definitions - stores selectors, callbacks etc
     * @type {{
     *     indexId: {
     *         selector: any,
     *         accessor: any
     *     }
     * }}
     */
    svc.definitions = {};

    /**
     * Reference to the native store that we build index for
     * @type {any[] | Object}
     */
    svc.nativeStore = null;

    svc.init = init.bind(svc);
    svc.isValidIndexId = isValidIndexId.bind(svc);
    svc.isValidStore = isValidStore.bind(svc);
    svc.index = indexBy.bind(svc);
    svc.build = buildBy.bind(svc);
    svc.get = getBy.bind(svc);
    svc.delete = deleteBy.bind(svc);

    return svc;

    /**
     * Init service
     * @return {Promise<T>}
     */
    function init(){
        return Promise.resolve();
    }

    /**
     * Build/rebuild index for specific store
     * If no ids provided all will be rebuild.
     *
     * Build all indexes
     * @example: IndexService.build();
     *
     * Build all indexes for store
     * @example: IndexStore.build();
     *
     * Rebuild specific simple index
     * @example: IndexStore.build('id');
     *
     * Rebuild specific nested index where we index {group: {name: value}}
     * @example: IndexStore.build(['group','name']);
     *
     * Sets complex index where for each store entry we index value retrieved from callback
     * @example: IndexStore.build('id', someCallback);
     * @example: IndexStore.build(['group','name'], someCallback);
     *
     * @param indexId? {{string | number} Index identifier (used also as selector if no separate selector provided)
     * @param indexSelector? {null | string | number | {string | number}[]} Index selector get data from store
     * @param callbackAccessor? {function(storeEntry: any): any} Getter for synthetic indexes
     */
    function build(indexId = null, indexSelector = null, callbackAccessor = null){
        // {
        // *     storeId: {
        // *         indexId: {
        //     *             selector: any,
        //     *             accessor: any
        //         *         }
        // *     }
        // * }
        // TODO: implement

        // if no store id provided or invalid
        if(!svc.isValidStoreId(storeId)){
            // build all indexes for all stores
            rebuildAll();
        }

        if(!svc.isStoreRegistered(storeId)){
            throw new Error(`Cant rebuild index for store - store not registered`);
        }

        // if no index id provided or invalid
        if(!svc.isValidStoreId(storeId)){
            // build all indexes for store
            rebuildStore(storeId);
        }

        // if indexId/indexSelector valid register them
        // if accessor valid register
        // build
    }

    /**
     * Rebuild all stores & their indexes
     */
    function rebuildAll(){
        Object.keys(svc.definitions).forEach((storeId) => {
            rebuildStore(storeId);
        });
    }

    function rebuildStore(storeId){
        Object.keys(svc.definitions[storeId]).forEach((indexId) => {
            rebuildIndex(storeId, indexId);
        });
    }

    function rebuildIndex(storeId, indexId){

    }

    /**
     * Remove single index
     * @example: IndexService.unregister('notification');
     *
     * @param storeId {string | number} Store identifier
     * @param indexId {{string | number} Index identifier
     */
    function remove(storeId, indexId){
        if(!svc.isValidStoreId(storeId)){
            throw new Error(`Cant remove index - invalid store id provided`);
        }
        if(!svc.isStoreRegistered(storeId)){
            throw new Error(`Cant remove index - store not registered`);
        }

        if(!svc.isValidIndexId(indexId)){
            throw new Error(`Cant remove index - invalid index id provided`);
        }

        // remove index data & definition
        delete svc.index[storeId][indexId];
        delete svc.definitions[storeId][indexId];
    }

    /**
     * Checks if provided value for store id is valid
     * @param id {*}
     * @return {boolean}
     */
    function isValidStoreId(id){
        return Number.isInteger(id) || typeof id === 'string';
    }

    /**
     * Checks if provided value for index id is valid
     * @param id {*}
     * @return {boolean}
     */
    function isValidIndexId(id){
        return svc.isValidStoreId(id) || (Array.isArray(id) && id.every(svc.isValidStoreId));
    }

    /**
     * Checks if provided object is a valid store
     * @param nativeStore {*}
     * @return {boolean}
     */
    function isValidStore(nativeStore){
        return Array.isArray(nativeStore) || typeof nativeStore === 'object';
    }

    /**
     * Register store which entries should be indexed
     * @example: IndexService.register('notification', notificationStore);
     *
     * @param nativeStore {Object | any[]} Store which entries should be indexed
     */
    function register(nativeStore){
        if(!svc.isValidStoreId(storeId)){
            throw new Error(`Cant register store - invalid store id provided`);
        }
        if(!svc.isValidStore(nativeStore)){
            throw new Error(`Cant register store - invalid store provided for ${storeId}`);
        }
        svc.definitions[storeId] = {};
        svc.definitions[storeId].store = nativeStore;
    }
}