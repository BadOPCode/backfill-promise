/**
 * Backfill-Promise
 * Promise wrappers an entire object and attempts to fullfill methods when the
 * real object is set.
 *  @author Shawn Rapp
 *  @version 1.0.0
 */

import { v4 } from "uuid";

import { PromiseShim } from "./BackfillPromiseShim";
import { EventHandler } from "./EventHandler";

const emitter = new EventHandler({
    handle: "BackfillPromise",
});

export class BackfillPromise {
    public bfId: string;

    constructor(listOfPromises: string[]) {
        // generate a ID unique to this backfill
        this.bfId = v4();

        // generate shims
        listOfPromises.forEach((funcName: string) => {
            this[funcName] = function() {
                // get the arguments the function was called with
                const args = Array.prototype.slice.call(arguments);

                return new PromiseShim(this.bfId, funcName, args);
            };
        });
    }

    // backfill the real object into bfp
    public $set(realObject) {
        emitter.dispatch(this.bfId, realObject);
        for (const propName in realObject) {
            if (typeof realObject[propName] === "function") {
                this[propName] = this.undeclaredFunctionShim(realObject, realObject[propName]);
            }
        }
    }

    private undeclaredFunctionShim(scope, realFunction) {
        const retfunc = function() {
            const args = Array.prototype.slice.call(arguments);
            return realFunction.apply(scope, args);
        };

        return retfunc;
    }
}
