import { EventHandler } from "./EventHandler";

const emitter = new EventHandler({
    handle: "BackfillPromise",
});

export class PromiseShim {
    public name: string;
    public args: any;
    private callbackSuccess: () => void;
    private callbackFail: () => void;

    constructor(bfId: string, functionName: string, functionArgs: any) {
        emitter.on(bfId, (realObject) => {
            const func = realObject[functionName];
            const promise = func.apply(realObject, functionArgs);
            if (promise !== undefined && promise.then !== undefined) {
                promise.then(this.callbackSuccess, this.callbackFail);
            }
        });
    }

    private then(cbSuccess, cbFail) {
        this.callbackSuccess = cbSuccess;
        this.callbackFail = cbFail;
        return {
            catch: cbFail,
        };
    }
}
