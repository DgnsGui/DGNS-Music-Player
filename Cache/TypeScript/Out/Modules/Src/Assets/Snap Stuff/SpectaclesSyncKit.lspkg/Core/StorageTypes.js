"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayType = exports.getBaseStorageType = exports.getTangentForStorageType = exports.getCubicInterpolateForStorageType = exports.getLerpForStorageType = exports.getEqualsCheckForStorageType = exports.StorageTypes = void 0;
const StorageProperty_1 = require("./StorageProperty");
/**
 * Storage types, for use with {@link StorageProperty}
 */
var StorageTypes;
(function (StorageTypes) {
    StorageTypes["bool"] = "Bool";
    StorageTypes["float"] = "Float";
    StorageTypes["double"] = "Double";
    StorageTypes["int"] = "Int";
    StorageTypes["string"] = "String";
    StorageTypes["vec2"] = "Vec2";
    StorageTypes["vec3"] = "Vec3";
    StorageTypes["vec4"] = "Vec4";
    StorageTypes["quat"] = "Quat";
    StorageTypes["mat2"] = "Mat2";
    StorageTypes["mat3"] = "Mat3";
    StorageTypes["mat4"] = "Mat4";
    StorageTypes["boolArray"] = "BoolArray";
    StorageTypes["floatArray"] = "FloatArray";
    StorageTypes["doubleArray"] = "DoubleArray";
    StorageTypes["intArray"] = "IntArray";
    StorageTypes["stringArray"] = "StringArray";
    StorageTypes["vec2Array"] = "Vec2Array";
    StorageTypes["vec3Array"] = "Vec3Array";
    StorageTypes["vec4Array"] = "Vec4Array";
    StorageTypes["quatArray"] = "QuatArray";
    StorageTypes["mat2Array"] = "Mat2Array";
    StorageTypes["mat3Array"] = "Mat3Array";
    StorageTypes["mat4Array"] = "Mat4Array";
    StorageTypes["packedTransform"] = "packedTransform";
})(StorageTypes || (exports.StorageTypes = StorageTypes = {}));
/**
 * Returns an equal check function based on `storageType`.
 * This function returns `true` if the two values of that type can be considered equal, or reasonably close to equal.
 * @param storageType - storageType to get an equals check for
 * @returns Equals check function for the passed in {@link StorageTypes | StorageType}
 */
function getEqualsCheckForStorageType(storageType) {
    switch (storageType) {
        case StorageTypes.string:
        case StorageTypes.bool:
        case StorageTypes.int:
            return StorageProperty_1.exactCompare;
        case StorageTypes.float:
        case StorageTypes.double:
            return StorageProperty_1.floatCompare;
        case StorageTypes.quat:
            return StorageProperty_1.quatCompare;
        case StorageTypes.vec2:
        case StorageTypes.vec3:
        case StorageTypes.vec4:
            return StorageProperty_1.vecCompare;
        case StorageTypes.mat2:
        case StorageTypes.mat3:
        case StorageTypes.mat4:
            return StorageProperty_1.matCompare;
        case StorageTypes.intArray:
        case StorageTypes.boolArray:
        case StorageTypes.stringArray:
            return StorageProperty_1.exactArrayCompare;
        case StorageTypes.floatArray:
        case StorageTypes.doubleArray:
            return StorageProperty_1.floatArrayCompare;
        case StorageTypes.quatArray:
            return StorageProperty_1.quatArrayCompare;
        case StorageTypes.vec2Array:
        case StorageTypes.vec3Array:
        case StorageTypes.vec4Array:
            return StorageProperty_1.vecArrayCompare;
        case StorageTypes.mat2Array:
        case StorageTypes.mat3Array:
        case StorageTypes.mat4Array:
            return StorageProperty_1.matArrayCompare;
        case StorageTypes.packedTransform:
            return StorageProperty_1.packedTransformCompare;
        default:
            throw new Error("No equals check for storage type: " + storageType);
    }
}
exports.getEqualsCheckForStorageType = getEqualsCheckForStorageType;
/**
 * Returns a lerp function based on `storageType`.
 * @param storageType - storageType to get lerp function for
 * @returns Lerp function for the passed in {@link StorageTypes | StorageType}
 */
function getLerpForStorageType(storageType) {
    switch (storageType) {
        case StorageTypes.float:
        case StorageTypes.double:
            return StorageProperty_1.lerp;
        case StorageTypes.quat:
            return StorageProperty_1.quatSlerp;
        case StorageTypes.vec2:
            return StorageProperty_1.vec2Lerp;
        case StorageTypes.vec3:
            return StorageProperty_1.vec3Lerp;
        case StorageTypes.vec4:
            return StorageProperty_1.vec4Lerp;
        case StorageTypes.packedTransform:
            return StorageProperty_1.packedTransformLerp;
        default:
            throw new Error("No lerp for storage type: " + storageType);
    }
}
exports.getLerpForStorageType = getLerpForStorageType;
/**
 * Returns a cubic interpolation function based on `storageType`.
 * @param storageType - storageType to get cubic interpolation function for
 * @returns Cubic interpolation function for the passed in {@link StorageTypes | StorageType}
 */
function getCubicInterpolateForStorageType(storageType) {
    switch (storageType) {
        case StorageTypes.float:
        case StorageTypes.double:
            return StorageProperty_1.cubicInterpolate;
        case StorageTypes.quat:
            return StorageProperty_1.squad;
        case StorageTypes.vec2:
            return StorageProperty_1.vec2CubicInterpolate;
        case StorageTypes.vec3:
            return StorageProperty_1.vec3CubicInterpolate;
        case StorageTypes.vec4:
            return StorageProperty_1.vec4CubicInterpolate;
        case StorageTypes.packedTransform:
            throw new Error("Not implemented.");
        default:
            throw new Error("No cubic interpolation for storage type: " + storageType);
    }
}
exports.getCubicInterpolateForStorageType = getCubicInterpolateForStorageType;
/**
 * Returns a tangent function based on `storageType`.
 * @param storageType - storageType to get tangent function for
 * @returns Tangent function for the passed in {@link StorageTypes | StorageType}
 */
function getTangentForStorageType(storageType) {
    switch (storageType) {
        case StorageTypes.float:
        case StorageTypes.double:
            return StorageProperty_1.tangent;
        case StorageTypes.quat:
            return StorageProperty_1.computeInnerQuadrangleQuaternion;
        case StorageTypes.vec2:
            return StorageProperty_1.vec2Tangent;
        case StorageTypes.vec3:
            return StorageProperty_1.vec3Tangent;
        case StorageTypes.vec4:
            return StorageProperty_1.vec4Tangent;
        case StorageTypes.packedTransform:
            throw new Error("Not implemented.");
        default:
            throw new Error("No tangent for storage type: " + storageType);
    }
}
exports.getTangentForStorageType = getTangentForStorageType;
/**
 * Returns the base StorageType (useful for Array types)
 * @param storageType - storageType to find base StorageType of
 * @returns Base {@link StorageTypes | StorageType}
 */
function getBaseStorageType(storageType) {
    switch (storageType) {
        case StorageTypes.boolArray:
            return StorageTypes.bool;
        case StorageTypes.intArray:
            return StorageTypes.int;
        case StorageTypes.floatArray:
            return StorageTypes.float;
        case StorageTypes.doubleArray:
            return StorageTypes.double;
        case StorageTypes.stringArray:
            return StorageTypes.string;
        case StorageTypes.vec2Array:
            return StorageTypes.vec2;
        case StorageTypes.vec3Array:
            return StorageTypes.vec3;
        case StorageTypes.vec4Array:
            return StorageTypes.vec4;
        case StorageTypes.quatArray:
            return StorageTypes.quat;
        case StorageTypes.mat2Array:
            return StorageTypes.mat2;
        case StorageTypes.mat3Array:
            return StorageTypes.mat3;
        case StorageTypes.mat4Array:
            return StorageTypes.mat4;
        case StorageTypes.packedTransform:
            return StorageTypes.packedTransform;
        default:
            return storageType;
    }
}
exports.getBaseStorageType = getBaseStorageType;
/**
 * Returns true if the storageType is an array type
 * @param storageType - storageType to check if it is an array type
 * @returns True if the storageType is an array type
 */
function isArrayType(storageType) {
    const baseType = getBaseStorageType(storageType);
    return baseType !== storageType;
}
exports.isArrayType = isArrayType;
;
global.StorageTypes = StorageTypes;
//# sourceMappingURL=StorageTypes.js.map