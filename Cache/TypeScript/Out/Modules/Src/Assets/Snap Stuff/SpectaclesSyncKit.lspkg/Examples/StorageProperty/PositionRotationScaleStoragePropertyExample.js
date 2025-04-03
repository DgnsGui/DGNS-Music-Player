"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PositionRotationScaleStoragePropertyExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionRotationScaleStoragePropertyExample = void 0;
var __selfType = requireType("./PositionRotationScaleStoragePropertyExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const PropertyType_1 = require("../../Core/PropertyType");
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
// The rotation speed of the circle to move the object in
const CIRCLE_ROTATION_SPEED = 1;
// The radius of the circle to move the object in
const CIRCLE_RADIUS_CM = 40;
// Maximum size of the object
const MAX_SIZE = 5;
let PositionRotationScaleStoragePropertyExample = PositionRotationScaleStoragePropertyExample_1 = class PositionRotationScaleStoragePropertyExample extends BaseScriptComponent {
    onAwake() {
        // Demonstrate the effect of limiting the number of sends per second
        this.myPropPosition.sendsPerSecondLimit = 3;
        this.myPropRotation.sendsPerSecondLimit = 3;
        this.myPropScale.sendsPerSecondLimit = 3;
        this.createEvent("UpdateEvent").bind(() => this.updateTransform());
    }
    updateTransform() {
        if (!this.syncEntity.doIOwnStore()) {
            this.log.i("Not the syncEntity owner, not changing anything.");
            return;
        }
        const angle = getTime() * CIRCLE_ROTATION_SPEED;
        const x = CIRCLE_RADIUS_CM * Math.cos(angle);
        const y = CIRCLE_RADIUS_CM * Math.sin(angle);
        this.sceneObject.getTransform().setLocalPosition(new vec3(x, y, 0));
        const rotation = quat.fromEulerVec(new vec3(0, 0, angle));
        this.sceneObject.getTransform().setLocalRotation(rotation);
        const size = vec3.one().uniformScale(getTime() % MAX_SIZE);
        this.sceneObject.getTransform().setLocalScale(size);
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(PositionRotationScaleStoragePropertyExample_1.name);
        this.myPropPosition = StorageProperty_1.StorageProperty.forPosition(this, PropertyType_1.PropertyType.Location);
        this.myPropRotation = StorageProperty_1.StorageProperty.forRotation(this, PropertyType_1.PropertyType.Location);
        this.myPropScale = StorageProperty_1.StorageProperty.forScale(this, PropertyType_1.PropertyType.Location);
        this.myStoragePropertySet = new StoragePropertySet_1.StoragePropertySet([
            this.myPropPosition,
            this.myPropRotation,
            this.myPropScale,
        ]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.myStoragePropertySet, true);
    }
};
exports.PositionRotationScaleStoragePropertyExample = PositionRotationScaleStoragePropertyExample;
exports.PositionRotationScaleStoragePropertyExample = PositionRotationScaleStoragePropertyExample = PositionRotationScaleStoragePropertyExample_1 = __decorate([
    component
], PositionRotationScaleStoragePropertyExample);
//# sourceMappingURL=PositionRotationScaleStoragePropertyExample.js.map