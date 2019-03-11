/**
 * Emiter
 * @constructor
 */
function EventEmitter(){
    const factory = {};

    // user defined event enum
    factory.availableEvents = {};

    factory.callbacks = [];
    factory.emit = emit.bind(factory);
    factory.on = on.bind(factory);
    factory.removeEventListener = removeEventListener.bind(factory);

    return factory;

    /**
     * Emit value to the listeners
     * @param {string} eventType
     * @param {any} values
     */
    function emit(eventType, ...values){
        const callbacks = this.callbacks[eventType];
        if(!callbacks){
            return;
        }

        callbacks.forEach((callback) => {
            callback(...values);
        });
    }

    /**
     * Set listener
     * @param {string} eventType
     * @param {eventCallback} callback
     */
    function on(eventType, callback){
        if(!this.callbacks[eventType]){
            this.callbacks[eventType] = [];
        }

        this.callbacks[eventType].push(callback);
    }

    /**
     * Remove listener
     * @param {string} eventType
     * @param {eventCallback} callback
     */
    function removeEventListener(eventType, callback){
        const callbacks = this.callbacks[eventType];
        if(!callbacks){
            return;
        }

        callbacks.forEach((setCallback, index) => {
            if(setCallback === callback){
                callbacks.splice(index, 1);
            }
        });
    }
}

module.exports = EventEmitter;