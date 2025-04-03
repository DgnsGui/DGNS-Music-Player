"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyTypeFromString = exports.PropertyType = void 0;
/**
 * The type of a transform property.
 */
var PropertyType;
(function (PropertyType) {
    PropertyType[PropertyType["None"] = 0] = "None";
    PropertyType[PropertyType["Local"] = 1] = "Local";
    PropertyType[PropertyType["World"] = 2] = "World";
    PropertyType[PropertyType["Location"] = 3] = "Location";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
/**
 * Converts a string to a PropertyType enum.
 * @param {string} type The property type as a string
 * @returns {PropertyType} The property type as a PropertyType enum
 */
function propertyTypeFromString(type) {
    switch (type.toLowerCase()) {
        case "none":
            return PropertyType.None;
        case "location":
            return PropertyType.Location;
        case "local":
            return PropertyType.Local;
        case "world":
            return PropertyType.World;
        default:
            throw new Error("Invalid property type: " + type);
    }
}
exports.propertyTypeFromString = propertyTypeFromString;
;
global.PropertyType = PropertyType;
//# sourceMappingURL=PropertyType.js.map