const EventEmitter = require('../../classes/event-emitter.class');
const Utils = require('../../classes/utils.class');
const IndexStore = require('./index-store.class');

module.exports = IndexService;

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
    //
    // console.log('--arrayStore-----------------------');
    // // const index = service.create('arrayStore', arrayStore)
    // //     .index('id')
    // //     .index('group', 'name')
    // //     .index('synthetic', syntheticCallback);
    // //
    // // const someIndex = index.for('arrayStore');
    // someIndex.build()
    // //
    // // someIndex.get.by('id').for(1);
    // // someIndex.update.by('id').for(1).
    // // someIndex.delete.by('id').for(1).
    //
    // console.log('--> store registered?', service.isStoreRegistered('arrayStore'));
    // console.log('--> store registered?', service.getIndex('arrayStore').by('id'));
    // console.log('--> store registered?', service.index['arrayStore']['group.name']);
    // console.log('--> store registered?', service.index['arrayStore']['synthetic']);
    // console.log('--End-------------------------');

    console.log();
    //
    // console.log('--objectStore-----------------------');
    // console.log('--End-------------------------');
}

// TODO: end test execution


/**
 * Index service - stores various index stores
 * Returns index. Emits event when index changes with changed store identifier and index identifier,
 * @example: IndexService.index['notification']['indexId'];
 * @example: IndexService.index['notification']['group.name'];
 *
 * @constructor
 */
function IndexService(){
    // This service behaves like event emitter
    const svc = EventEmitter();
    // Define available events
    svc.availableEvents = {
        CHANGE: 'CHANGE'
    };

    /**
     * Root of the index tree
     * All index stores lands here:
     * {
     *     'storeId': {
     *         'indexId': value // position / key in original store
     *         // or
     *         'indexSelector': value // position / key in original store
     *     }
     * }
     * @type {{storeId: {indexId: any}}}
     */
    svc.stores = {};

    svc.init = init.bind(svc);
    svc.build = build.bind(svc);
    svc.register = register.bind(svc);
    svc.remove = remove.bind(svc);
    svc.isStoreRegistered = isStoreRegistered.bind(svc);
    svc.isValidStoreId = isValidStoreId.bind(svc);

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
     * Dont throw error if non-existing index provided - rather it creates those indexes;
     *
     * Build all indexes
     * @example: IndexService.build();
     *
     * Build all indexes for store
     * @example: IndexService.build('notification');
     *
     * Rebuild specific simple index
     * @example: IndexService.build('notification', 'id');
     *
     * Rebuild specific nested index where we index {group: {name: value}}
     * @example: IndexService.build('notification', ['group','name']);
     *
     * Sets complex index where for each store entry we index value retrieved from callback
     * @example: IndexService.build('notification', 'id', someCallback);
     * @example: IndexService.build('notification', ['group','name'], someCallback);
     *
     * @param storeId? {string | number} Store identifier
     * @param indexId? {{string | number} Index identifier (used also as selector if no separate selector provided)
     * @param indexSelector? {null | string | number | {string | number}[]} Index selector get data from store
     * @param callbackAccessor? {function(storeEntry: any): any} Getter for synthetic indexes
     */
    function build(storeId = null, indexId = null, indexSelector = null, callbackAccessor = null){
        // TODO: implement

        // if no store id provided or invalid
        if(!svc.isValidStoreId(storeId)){
            // if invalid
            if(storeId !== null){
                throw new Error(`Cant rebuild index for store - invalid store id provided`);
            }
            // build all indexes for all stores
            rebuild();
            return;
        }

        if(!svc.isStoreRegistered(storeId)){
            throw new Error(`Cant rebuild index for store - store not registered`);
        }

        const store = svc.stores[storeId];
        store.build(indexId, indexSelector, callbackAccessor);
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
     * Build all stores & their indexes
     */
    function rebuild(){
        Object.keys(svc.stores).forEach((store) => {
            // build all store indexes
            store.rebuild();
        });
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
     * Checks if store id registered
     * @param storeId {*}
     * @return {boolean}
     */
    function isStoreRegistered(storeId){
        return !!svc.definitions[storeId];
    }

    /**
     * Create store for which entries should be indexed
     * @example: IndexService.register('notification', notificationStore);
     *
     * @param storeId {string | number} Store identifier
     * @param nativeStore {Object | any[]} Store which entries should be indexed
     * @return {IndexStore}
     */
    function create(storeId, nativeStore){
        if(!svc.isValidStoreId(storeId)){
            throw new Error(`Cant register store - invalid store id provided`);
        }

        svc.stores[storeId] = {};
        const store = new IndexStore(nativeStore);
        svc.stores[storeId] = store;

        return store;
    }

    /**
     * Remove store or store index
     * @example: IndexService.unregister('notification');
     *
     * @param storeId {string | number} Store identifier
     * @param indexId? {{string | number} Index identifier
     */
    function remove(storeId, indexId = null){
        if(!svc.isValidStoreId(storeId)){
            throw new Error(`Cant remove store or index - invalid store id provided`);
        }
        if(!svc.isStoreRegistered(storeId)){
            throw new Error(`Cant remove store or index - store not registered`);
        }

        // if index provided
        if(indexId !== null){
            // remove index
            svc.stores[storeId].remove(indexId);
            return;
        }

        // remove store
        delete svc.stores[storeId];
    }
}