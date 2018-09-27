import {isPresent, Preconditions} from '../Preconditions';
import {Event} from './Event';
import {Listener} from './Listener';
import {Logger} from '../logger/Logger';
import {ISimpleReactor} from './SimpleReactor';

const log = Logger.create();

export class Reactor<V> implements IReactor<V> {

    private readonly events: {[name: string]: Event<V>} = {};

    public registerEvent(eventName: string): this {

        Preconditions.assertNotNull(eventName, "eventName");

        if (isPresent(this.events[eventName])) {
            // already registered so don't double register which would kill
            // the existing listeners.
            return this;
        }

        const event = new Event<V>(eventName);
        this.events[eventName] = event;

        return this;

    }

    public hasRegisteredEvent(eventName: string): boolean {
        return isPresent(this.events[eventName]);
    }

    public eventNames(): string[] {
        return Object.keys(this.events);
    }

    public clearEvent(eventName: string) {
        // replace it with a new event to clear the previous listeners.
        const event = new Event<V>(eventName);
        this.events[eventName] = event;
        return this;
    }

    /**
     *
     * @param eventName The name of the event to dispatch.
     * @param value The event value to dispatch to listeners of that event name.
     * @return {Reactor}
     */
    public dispatchEvent(eventName: string, value: V) {

        Preconditions.assertNotNull(eventName, "eventName");

        const event = this.events[eventName];

        if (! event) {
            throw new Error("No events for event name: " + eventName);
        }

        event.getListeners().forEach((listener) => {

            try {

                listener(value);

            } catch (e) {
                log.error("listener generated unhandled exception: ", e);
            }

        });

        return this;

    }

    /**
     *
     */
    public addEventListener(eventName: string, listener: Listener<V>) {

        Preconditions.assertNotNull(eventName, "eventName");

        if (typeof listener !== "function") {
            throw new Error("listener is not a function: " + typeof listener);
        }

        if (this.events[eventName] === undefined) {
            throw new Error("No registered event for event name: " + eventName);
        }

        this.events[eventName].registerListener(listener);
        return this;

    }

    public removeEventListener(eventName: string, listener: Listener<V>): boolean {

        if (this.events[eventName]) {
            return this.events[eventName].removeListener(listener);
        }

        return false;

    }

    public once(eventName: string): Promise<V> {

        return new Promise<V>((resolve => {

            const listener = (event: V) => {
                resolve(event);
                this.removeEventListener(eventName, listener);
            };

            this.addEventListener(eventName, listener);

        }));

    }

    /**
     *
     * @param eventName {String} The name of the event for the listeners.
     */
    public getEventListeners(eventName: string) {
        Preconditions.assertNotNull(eventName, "eventName");

        return this.events[eventName].getListeners();
    }

    public hasEventListeners(eventName: string) {
        return this.hasRegisteredEvent(eventName) && this.events[eventName].hasListeners();
    }

}

export interface IReactor<V> {
    once(eventName: string): Promise<V>;
    addEventListener(eventName: string, listener: Listener<V>): void;
    dispatchEvent(eventName: string, value: V): void;
    hasRegisteredEvent(eventName: string): boolean;
    hasEventListeners(eventName: string): boolean;
    registerEvent(eventName: string): IReactor<V>;
}

export interface IMutableReactor<V> extends IReactor<V> {
    clearEvent(eventName: string): void;
    removeEventListener(eventName: string, listener: Listener<V>): boolean;
    getEventListeners(eventName: string): Array<Listener<V>>;
}

export interface INamedEventDispatcher<V> extends IReactor<V> {

}
