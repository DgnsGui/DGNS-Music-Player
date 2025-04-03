"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TransformStoragePropertyExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformStoragePropertyExample = void 0;
var __selfType = requireType("./TransformStoragePropertyExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const PropertyType_1 = require("../../Core/PropertyType");
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
// The rotation speed of the circle to move the object in
const CIRCLE_ROTATION_SPEED = 1;
// The radius of the circle to move the object in
const CIRCLE_RADIUS_CM = 50;
// Maximum size of the object
const MAX_SIZE = 5;
let TransformStoragePropertyExample = TransformStoragePropertyExample_1 = class TransformStoragePropertyExample extends BaseScriptComponent {
    onAwake() {
        // Demonstrate the effect of limiting the number of sends per second
        this.myPropTransform.sendsPerSecondLimit = 3;
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
        this.log = new SyncKitLogger_1.SyncKitLogger(TransformStoragePropertyExample_1.name);
        this.myPropTransform = StorageProperty_1.StorageProperty.forTransform(this, PropertyType_1.PropertyType.Location, PropertyType_1.PropertyType.Location, PropertyType_1.PropertyType.Location, 
        // Demonstrate how to apply smoothing
        {
            interpolationTarget: -0.25,
        });
        this.myStoragePropertySet = new StoragePropertySet_1.StoragePropertySet([this.myPropTransform]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.myStoragePropertySet, true);
    }
};
exports.TransformStoragePropertyExample = TransformStoragePropertyExample;
exports.TransformStoragePropertyExample = TransformStoragePropertyExample = TransformStoragePropertyExample_1 = __decorate([
    component
], TransformStoragePropertyExample);
//# sourceMappingURL=TransformStoragePropertyExample.js.map