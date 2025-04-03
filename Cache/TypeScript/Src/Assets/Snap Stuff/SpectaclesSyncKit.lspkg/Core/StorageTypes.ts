import {
  computeInnerQuadrangleQuaternion,
  cubicInterpolate,
  exactArrayCompare,
  exactCompare,
  floatArrayCompare,
  floatCompare,
  lerp,
  matArrayCompare,
  matCompare,
  packedTransformCompare,
  packedTransformLerp,
  quatArrayCompare,
  quatCompare,
  quatSlerp,
  squad,
  tangent,
  vec2CubicInterpolate,
  vec2Lerp,
  vec2Tangent,
  vec3CubicInterpolate,
  vec3Lerp,
  vec3Tangent,
  vec4CubicInterpolate,
  vec4Lerp,
  vec4Tangent,
  vecArrayCompare,
  vecCompare,
} from "./StorageProperty"
import {ValidStorageType} from "./StorageType"

/**
 * Storage types, for use with {@link StorageProperty}
 */
export enum StorageTypes {
  bool = "Bool",
  float = "Float",
  double = "Double",
  int = "Int",
  string = "String",
  vec2 = "Vec2",
  vec3 = "Vec3",
  vec4 = "Vec4",
  quat = "Quat",
  mat2 = "Mat2",
  mat3 = "Mat3",
  mat4 = "Mat4",
  boolArray = "BoolArray",
  floatArray = "FloatArray",
  doubleArray = "DoubleArray",
  intArray = "IntArray",
  stringArray = "StringArray",
  vec2Array = "Vec2Array",
  vec3Array = "Vec3Array",
  vec4Array = "Vec4Array",
  quatArray = "QuatArray",
  mat2Array = "Mat2Array",
  mat3Array = "Mat3Array",
  mat4Array = "Mat4Array",
  packedTransform = "packedTransform",
}

/**
 * Returns an equal check function based on `storageType`.
 * This function returns `true` if the two values of that type can be considered equal, or reasonably close to equal.
 * @param storageType - storageType to get an equals check for
 * @returns Equals check function for the passed in {@link StorageTypes | StorageType}
 */
export function getEqualsCheckForStorageType<T extends ValidStorageType>(
  storageType: ValidStorageType
): (a: T, b: T) => boolean {
  switch (storageType) {
    case StorageTypes.string:
    case StorageTypes.bool:
    case StorageTypes.int:
      return exactCompare as (a: T, b: T) => boolean
    case StorageTypes.float:
    case StorageTypes.double:
      return floatCompare as (a: T, b: T) => boolean
    case StorageTypes.quat:
      return quatCompare as (a: T, b: T) => boolean
    case StorageTypes.vec2:
    case StorageTypes.vec3:
    case StorageTypes.vec4:
      return vecCompare as (a: T, b: T) => boolean
    case StorageTypes.mat2:
    case StorageTypes.mat3:
    case StorageTypes.mat4:
      return matCompare as (a: T, b: T) => boolean
    case StorageTypes.intArray:
    case StorageTypes.boolArray:
    case StorageTypes.stringArray:
      return exactArrayCompare as (a: T, b: T) => boolean
    case StorageTypes.floatArray:
    case StorageTypes.doubleArray:
      return floatArrayCompare as (a: T, b: T) => boolean
    case StorageTypes.quatArray:
      return quatArrayCompare as (a: T, b: T) => boolean
    case StorageTypes.vec2Array:
    case StorageTypes.vec3Array:
    case StorageTypes.vec4Array:
      return vecArrayCompare as (a: T, b: T) => boolean
    case StorageTypes.mat2Array:
    case StorageTypes.mat3Array:
    case StorageTypes.mat4Array:
      return matArrayCompare as (a: T, b: T) => boolean
    case StorageTypes.packedTransform:
      return packedTransformCompare as (a: T, b: T) => boolean
    default:
      throw new Error("No equals check for storage type: " + storageType)
  }
}

/**
 * Returns a lerp function based on `storageType`.
 * @param storageType - storageType to get lerp function for
 * @returns Lerp function for the passed in {@link StorageTypes | StorageType}
 */
export function getLerpForStorageType<T extends ValidStorageType>(
  storageType: ValidStorageType
): (a: T, b: T, t: number) => T {
  switch (storageType) {
    case StorageTypes.float:
    case StorageTypes.double:
      return lerp as (a: T, b: T, t: number) => T
    case StorageTypes.quat:
      return quatSlerp as (a: T, b: T, t: number) => T
    case StorageTypes.vec2:
      return vec2Lerp as (a: T, b: T, t: number) => T
    case StorageTypes.vec3:
      return vec3Lerp as (a: T, b: T, t: number) => T
    case StorageTypes.vec4:
      return vec4Lerp as (a: T, b: T, t: number) => T
    case StorageTypes.packedTransform:
      return packedTransformLerp as (a: T, b: T, t: number) => T
    default:
      throw new Error("No lerp for storage type: " + storageType)
  }
}

/**
 * Returns a cubic interpolation function based on `storageType`.
 * @param storageType - storageType to get cubic interpolation function for
 * @returns Cubic interpolation function for the passed in {@link StorageTypes | StorageType}
 */
export function getCubicInterpolateForStorageType<T extends ValidStorageType>(
  storageType: ValidStorageType
): (a: T, b: T, c: T, d: T, t: number) => T {
  switch (storageType) {
    case StorageTypes.float:
    case StorageTypes.double:
      return cubicInterpolate as (a: T, b: T, c: T, d: T, t: number) => T
    case StorageTypes.quat:
      return squad as (a: T, b: T, c: T, d: T, t: number) => T
    case StorageTypes.vec2:
      return vec2CubicInterpolate as (a: T, b: T, c: T, d: T, t: number) => T
    case StorageTypes.vec3:
      return vec3CubicInterpolate as (a: T, b: T, c: T, d: T, t: number) => T
    case StorageTypes.vec4:
      return vec4CubicInterpolate as (a: T, b: T, c: T, d: T, t: number) => T
    case StorageTypes.packedTransform:
      throw new Error("Not implemented.")
    default:
      throw new Error("No cubic interpolation for storage type: " + storageType)
  }
}

/**
 * Returns a tangent function based on `storageType`.
 * @param storageType - storageType to get tangent function for
 * @returns Tangent function for the passed in {@link StorageTypes | StorageType}
 */
export function getTangentForStorageType<T extends ValidStorageType>(
  storageType: ValidStorageType
): (a: T, b: T, c: T, t: number) => T {
  switch (storageType) {
    case StorageTypes.float:
    case StorageTypes.double:
      return tangent as (a: T, b: T, c: T, t: number) => T
    case StorageTypes.quat:
      return computeInnerQuadrangleQuaternion as (a: T, b: T, c: T) => T
    case StorageTypes.vec2:
      return vec2Tangent as (a: T, b: T, c: T, t: number) => T
    case StorageTypes.vec3:
      return vec3Tangent as (a: T, b: T, c: T, t: number) => T
    case StorageTypes.vec4:
      return vec4Tangent as (a: T, b: T, c: T, t: number) => T
    case StorageTypes.packedTransform:
      throw new Error("Not implemented.")
    default:
      throw new Error("No tangent for storage type: " + storageType)
  }
}

/**
 * Returns the base StorageType (useful for Array types)
 * @param storageType - storageType to find base StorageType of
 * @returns Base {@link StorageTypes | StorageType}
 */
export function getBaseStorageType(
  storageType: ValidStorageType
): ValidStorageType {
  switch (storageType) {
    case StorageTypes.boolArray:
      return StorageTypes.bool
    case StorageTypes.intArray:
      return StorageTypes.int
    case StorageTypes.floatArray:
      return StorageTypes.float
    case StorageTypes.doubleArray:
      return StorageTypes.double
    case StorageTypes.stringArray:
      return StorageTypes.string
    case StorageTypes.vec2Array:
      return StorageTypes.vec2
    case StorageTypes.vec3Array:
      return StorageTypes.vec3
    case StorageTypes.vec4Array:
      return StorageTypes.vec4
    case StorageTypes.quatArray:
      return StorageTypes.quat
    case StorageTypes.mat2Array:
      return StorageTypes.mat2
    case StorageTypes.mat3Array:
      return StorageTypes.mat3
    case StorageTypes.mat4Array:
      return StorageTypes.mat4
    case StorageTypes.packedTransform:
      return StorageTypes.packedTransform
    default:
      return storageType
  }
}

/**
 * Returns true if the storageType is an array type
 * @param storageType - storageType to check if it is an array type
 * @returns True if the storageType is an array type
 */
export function isArrayType(storageType: ValidStorageType): boolean {
  const baseType = getBaseStorageType(storageType)
  return baseType !== storageType
}

;(global as any).StorageTypes = StorageTypes
