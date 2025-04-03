"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SyncEntityDebug_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEntityDebug = void 0;
var __selfType = requireType("./SyncEntityDebug");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const NetworkUtils_1 = require("../../Core/NetworkUtils");
const SessionController_1 = require("../../Core/SessionController");
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
/**
 * Used to display helpful debugging information about a SyncEntity.
 */
let SyncEntityDebug = SyncEntityDebug_1 = class SyncEntityDebug extends BaseScriptComponent {
    onAwake() {
        // We use OnStartEvent to ensure that the SyncEntity has been fully initialized
        this.createEvent("OnStartEvent").bind(() => this.init());
    }
    /**
     * @param textComponent - The Text component to update
     * @param text - The text to set
     */
    textHelper(textComponent, text) {
        if (!isNull(textComponent)) {
            textComponent.text = "" + text;
        }
    }
    /**
     * @param ownerInfo - The new owner info
     */
    updateOwnerText(ownerInfo) {
        this.textHelper(this.ownerIdText, "id: " + ((ownerInfo && ownerInfo.connectionId) || "<unowned>"));
        this.textHelper(this.ownerDisplayNameText, (ownerInfo && ownerInfo.displayName) || "<unowned>");
    }
    /**
     * @param networkId - The new network id
     */
    updateNetworkId(networkId) {
        this.textHelper(this.networkIdText, "id: " + networkId);
    }
    /**
     * @param object - The object to get the hierarchy path for
     * @returns The hierarchy path
     */
    getHierarchyPath(object) {
        const path = object.name;
        if (object.hasParent()) {
            return this.getHierarchyPath(object.getParent()) + "/" + path;
        }
        return path;
    }
    /**
     * @param lastKeyChanged - The last key changed
     */
    updateStorageText(lastKeyChanged) {
        if (!this.storagePropertyText) {
            return;
        }
        let txt = "";
        if (this.syncEntity &&
            !this.syncEntity.destroyed &&
            !isNull(this.syncEntity.localScript)) {
            txt +=
                this.getHierarchyPath(this.syncEntity.localScript.getSceneObject()) +
                    "\n";
        }
        txt += "----Storage----\n";
        const propertySet = this.syncEntity.propertySet;
        const allValues = {};
        const pendingValues = {};
        const currentOrPendingValues = {};
        if (this.syncEntity.currentStore) {
            const allKeys = this.syncEntity.currentStore.getAllKeys();
            for (let i = 0; i < allKeys.length; i++) {
                const key = allKeys[i];
                if (key === NetworkUtils_1.NETWORK_ID_KEY) {
                    continue;
                    // allValues[key] = syncEntity.currentStore.getString(key);
                }
                if (key === NetworkUtils_1.NETWORK_TYPE_KEY) {
                    allValues[key] = this.syncEntity.currentStore.getString(key);
                }
                allValues[key] = null;
            }
        }
        else {
            txt += "[No RealtimeStore connected]\n";
        }
        if (propertySet.storageProperties) {
            const keys = Object.keys(propertySet.storageProperties);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const prop = propertySet.storageProperties[key];
                allValues[key] = prop.currentValue;
                if (prop.pendingValue !== null && prop.pendingValue !== undefined) {
                    pendingValues[key] = prop.pendingValue;
                }
                if (prop.currentOrPendingValue !== null &&
                    prop.currentOrPendingValue !== undefined) {
                    currentOrPendingValues[key] = prop.currentOrPendingValue;
                }
            }
        }
        const keys = Object.keys(allValues);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key === lastKeyChanged) {
                txt += "*";
            }
            const valueText = allValues[key] === null || allValues[key] === undefined
                ? "?"
                : allValues[key];
            txt += key + ": " + valueText;
            if (key in pendingValues) {
                txt += "  [pen]: " + pendingValues[key];
            }
            if (key in currentOrPendingValues) {
                txt += "  [cur/pen]: " + currentOrPendingValues[key];
            }
            txt += "\n";
        }
        this.textHelper(this.storagePropertyText, txt);
    }
    onOwnershipButtonPressed() {
        if (this.syncEntity.doIOwnStore()) {
            SessionController_1.SessionController.getInstance()
                .getSession()
                .clearRealtimeStoreOwnership(this.syncEntity.currentStore, () => {
                this.log.i(`Ownership cleared for ${SessionController_1.SessionController.getInstance().getLocalUserName()}`);
            }, (error) => {
                this.log.e("Error clearing ownership: " + error);
            });
        }
        else {
            SessionController_1.SessionController.getInstance()
                .getSession()
                .requestRealtimeStoreOwnership(this.syncEntity.currentStore, () => {
                this.log.i(`Ownership gained for ${SessionController_1.SessionController.getInstance().getLocalUserName()}`);
            }, (error) => {
                this.log.e("Error requesting ownership: " + error);
            });
        }
    }
    init() {
        switch (this.targetTypeString) {
            case "SyncEntity":
                this.syncEntity = SyncEntity_1.SyncEntity.getSyncEntityOnComponent(this.syncEntityScript);
                this.syncEntity.onOwnerUpdated.add((ownerInfo) => this.updateOwnerText(ownerInfo));
                this.updateNetworkId(this.syncEntity.networkId);
                this.updateOwnerText(this.syncEntity.ownerInfo);
                this.updateStorageText(null);
                this.syncEntity.notifyOnReady(() => {
                    this.updateNetworkId(this.syncEntity.networkId);
                    this.updateOwnerText(this.syncEntity.ownerInfo);
                    this.updateStorageText(null);
                    if (this.ownershipButton) {
                        this.ownershipButton.onButtonPinched.add(() => this.onOwnershipButtonPressed());
                    }
                });
                this.syncEntity.storeCallbacks.onStoreUpdated.add((_session, _store, key) => {
                    this.updateStorageText(key);
                });
                break;
            case "NetworkRoot":
                this.networkRoot = (0, NetworkUtils_1.findNetworkRoot)(this.getSceneObject());
                if (this.networkRoot) {
                    this.updateOwnerText(this.networkRoot.ownerInfo);
                    this.updateNetworkId(this.networkRoot.networkId);
                    if (this.storagePropertyText) {
                        this.storagePropertyText.getSceneObject().enabled = false;
                    }
                    if (this.ownershipButton) {
                        this.ownershipButton.getSceneObject().enabled = false;
                    }
                }
                break;
        }
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(SyncEntityDebug_1.name);
    }
};
exports.SyncEntityDebug = SyncEntityDebug;
exports.SyncEntityDebug = SyncEntityDebug = SyncEntityDebug_1 = __decorate([
    component
], SyncEntityDebug);
//# sourceMappingURL=SyncEntityDebug.js.map