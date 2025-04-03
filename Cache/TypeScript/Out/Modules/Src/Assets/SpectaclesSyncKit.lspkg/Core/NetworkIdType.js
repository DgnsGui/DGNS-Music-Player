"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkIdFromString = exports.NetworkIdType = void 0;
var NetworkIdType;
(function (NetworkIdType) {
    NetworkIdType[NetworkIdType["Hierarchy"] = 0] = "Hierarchy";
    NetworkIdType[NetworkIdType["Custom"] = 1] = "Custom";
    NetworkIdType[NetworkIdType["ObjectId"] = 2] = "ObjectId";
})(NetworkIdType || (exports.NetworkIdType = NetworkIdType = {}));
function networkIdFromString(type) {
    switch (type.toLowerCase()) {
        case "hierarchy":
            return NetworkIdType.Hierarchy;
        case "custom":
            return NetworkIdType.Custom;
        case "objectid":
            return NetworkIdType.ObjectId;
        default:
            throw new Error("Invalid network ID type: " + type);
    }
}
exports.networkIdFromString = networkIdFromString;
//# sourceMappingURL=NetworkIdType.js.map