"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkIdTools = exports.generateNetworkId = exports.NetworkIdOptions = void 0;
const NetworkIdType_1 = require("./NetworkIdType");
const NetworkUtils_1 = require("./NetworkUtils");
/**
 * Provides a set of options to use with network id generation
 * @class
 */
class NetworkIdOptions {
    constructor(
    /**
     * Which method to use for network id generation
     * @type {NetworkIdType?}
     */
    networkIdType, 
    /**
     * Custom network id  to use
     * @type {string?}
     */
    customNetworkId, 
    /**
     * Custom prefix to prepend to the network id
     * @type {string?}
     */
    customPrefix) {
        this.networkIdType = networkIdType;
        this.customNetworkId = customNetworkId;
        this.customPrefix = customPrefix;
    }
    static parseFromScript(scriptComponent) {
        const options = new NetworkIdOptions();
        options.networkIdType = scriptComponent.networkIdType;
        options.customNetworkId = scriptComponent.customNetworkId;
        return options;
    }
}
exports.NetworkIdOptions = NetworkIdOptions;
/**
 * Generates a new network id
 * @param {ScriptComponent} scriptComponent ScriptComponent to generate the id for
 * @param {NetworkIdOptions} networkIdOptions Options to use with id generation
 * @param {NetworkRootInfo=} networkRoot Optional NetworkRootInfo for use with prefab instantiation
 * @returns {string} Generated network id
 */
function generateNetworkId(scriptComponent, networkIdOptions, networkRoot) {
    if ((scriptComponent === null || scriptComponent === undefined) &&
        networkIdOptions.networkIdType != NetworkIdType_1.NetworkIdType.Custom) {
        throw new Error("ScriptComponent must be provided when using a non-custom network id type.");
    }
    let ret = "";
    switch (networkIdOptions.networkIdType) {
        case NetworkIdType_1.NetworkIdType.ObjectId:
        default:
            if (networkRoot) {
                ret = generateNetworkIdFromHierarchy(scriptComponent);
            }
            else {
                ret = scriptComponent.uniqueIdentifier;
            }
            break;
        case NetworkIdType_1.NetworkIdType.Hierarchy:
            ret = generateNetworkIdFromHierarchy(scriptComponent);
            break;
        case NetworkIdType_1.NetworkIdType.Custom:
            let networkId = networkIdOptions.customNetworkId;
            if (networkRoot) {
                networkId = networkRoot.networkId + "/" + networkId;
            }
            ret = networkId;
            break;
    }
    if (networkIdOptions.customPrefix) {
        ret = networkIdOptions.customPrefix + ret;
    }
    return ret;
}
exports.generateNetworkId = generateNetworkId;
/**
 * Returns the index of the component on its SceneObject
 * @param {Component} component
 * @returns {number}
 */
function getComponentIndex(component) {
    const sceneObject = component.getSceneObject();
    const components = sceneObject.getComponents("Component");
    for (let i = 0; i < components.length; i++) {
        if (components[i].isSame(component)) {
            return i;
        }
    }
    return -1;
}
/**
 * Returns the index of the SceneObject on its parent, or scene root
 * @param {SceneObject} sceneObject
 * @returns {number}
 */
function getSceneObjectIndex(sceneObject) {
    if (sceneObject.hasParent()) {
        const parent = sceneObject.getParent();
        const count = parent.getChildrenCount();
        for (let i = 0; i < count; i++) {
            if (parent.getChild(i).isSame(sceneObject)) {
                return i;
            }
        }
    }
    else {
        const rootCount = global.scene.getRootObjectsCount();
        for (let i = 0; i < rootCount; i++) {
            if (global.scene.getRootObject(i).isSame(sceneObject)) {
                return i;
            }
        }
    }
    return -1;
}
/**
 * Generate a network id based on object hierarchy
 * @param {SceneObject|Component} target
 * @returns {string}
 */
function generateNetworkIdFromHierarchy(target) {
    let path = "";
    const sceneObject = (0, NetworkUtils_1.getSceneObjectHelper)(target);
    if (target.isOfType("Component")) {
        const component = target;
        path = generateNetworkIdFromHierarchy(sceneObject);
        const compIndex = getComponentIndex(component);
        path += "/" + component.getTypeName() + "_" + compIndex;
        return path;
    }
    if ((0, NetworkUtils_1.isRootObject)(sceneObject)) {
        const networkRoot = (0, NetworkUtils_1.findNetworkRoot)(sceneObject);
        return networkRoot.networkId;
    }
    if (sceneObject.hasParent()) {
        path = generateNetworkIdFromHierarchy(sceneObject.getParent());
        path += "/";
    }
    const objIndex = getSceneObjectIndex(sceneObject);
    path += sceneObject.name + "_" + objIndex;
    return path;
}
exports.NetworkIdTools = {
    generateNetworkId: generateNetworkId,
    NetworkIdOptions: NetworkIdOptions,
    NetworkIdType: NetworkIdType_1.NetworkIdType,
};
global.networkIdTools = exports.NetworkIdTools;
//# sourceMappingURL=NetworkIdTools.js.map