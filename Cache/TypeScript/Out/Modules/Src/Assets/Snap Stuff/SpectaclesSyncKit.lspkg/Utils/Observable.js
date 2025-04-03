"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../SpectaclesInteractionKit/Utils/Event");
// A value that allows consumers to register for OnChanged callbacks
// that are triggered whenever the value is set.
class Observable {
    // Gets the current value
    get value() {
        return this.val;
    }
    // Sets the current value. Will trigger an onChanged callback if
    // the value has changed.
    set value(val) {
        this.set(val);
    }
    // Sets the current value. Will trigger an onChanged callback if
    // the value has changed.
    set(val) {
        if (this.val !== val) {
            this.val = val;
            this.onChangedEvent.invoke(val);
            return true;
        }
        return false;
    }
    constructor(val) {
        this.onChangedEvent = new Event_1.default();
        this.onChanged = this.onChangedEvent.publicApi();
        this.val = val;
    }
}
exports.default = Observable;
//# sourceMappingURL=Observable.js.map