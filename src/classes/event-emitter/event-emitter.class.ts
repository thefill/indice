import {EventCallback} from '../../types';

/**
 * Event emitter
 * @constructor
 */
export class EventEmitter {

    // user defined event enum
    protected availableEvents: { [key: string]: number | string } = {};
    protected callbacks: { [eventType: string]: EventCallback[] } = {};

    /**
     * Emit value to the listeners
     */
    public emit(eventType: string, ...values: any){
        const callbacks = this.callbacks[eventType];
        if (!callbacks){
            return;
        }

        callbacks.forEach((callback) => {
            callback(...values);
        });
    }

    /**
     * Set listener
     */
    public on(eventType: string, callback: EventCallback){
        if (!this.callbacks[eventType]){
            this.callbacks[eventType] = [];
        }

        this.callbacks[eventType].push(callback);
    }

    /**
     * Remove listener
     */
    public removeEventListener(eventType: string, callback: EventCallback){
        const callbacks = this.callbacks[eventType];
        if (!callbacks){
            return;
        }

        callbacks.forEach((setCallback, index) => {
            if (setCallback === callback){
                callbacks.splice(index, 1);
            }
        });
    }
}
