"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectContainer = void 0;
const Observable_1 = require("../../../Utils/Observable");
class ProjectContainer {
    constructor() {
        this._isMappedObservable = new Observable_1.default(false);
        this._isUserAligned = new Observable_1.default(false);
        this._startPointPosition = vec3.zero();
        this._startPointRotation = quat.fromEulerVec(vec3.zero());
        this._joinedUsers = [];
        this._onNewUserNeedsHelp = [];
        this._isMappedObservable.set(false);
        this._isUserAligned.set(false);
    }
    mappingDone() {
        this._isMappedObservable.set(true);
    }
    get startPointPosition() {
        return this._startPointPosition;
    }
    set startPointPosition(value) {
        this._startPointPosition = value;
    }
    get startPointRotation() {
        return this._startPointRotation;
    }
    set startPointRotation(value) {
        this._startPointRotation = value;
    }
    get isMappedObservable() {
        return this._isMappedObservable;
    }
    get isUserAligned() {
        return this._isUserAligned;
    }
    get joinedUsers() {
        return this._joinedUsers;
    }
    notifyOnUserToHelpChanged(value) {
        this._onNewUserNeedsHelp.push(value);
    }
    userToHelpChanged() {
        this._onNewUserNeedsHelp.forEach((value) => value());
    }
}
exports.ProjectContainer = ProjectContainer;
//# sourceMappingURL=ProjectContainer.js.map