"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabSpawner = void 0;
var __selfType = requireType("./PrefabSpawn");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let PrefabSpawner = class PrefabSpawner extends BaseScriptComponent {
    onAwake() {
        if (!this.pinchButton || !this.prefabTemplate || !this.camera || !this.instantiator) {
            print('Error: Required inputs not set in PrefabSpawner script');
            return;
        }
        this.onPinchCallback = () => this.spawnPrefab();
        if (typeof this.pinchButton.onButtonPinched === 'function') {
            this.pinchButton.onButtonPinched(this.onPinchCallback);
        }
        else {
            print('Error: onButtonPinched is not a function on pinchButton. Check if it is correctly assigned.');
        }
    }
    spawnPrefab() {
        if (!this.isInitialized) {
            print('Instantiator not yet initialized. Cannot spawn prefab.');
            return;
        }
        const camTransform = this.camera.getTransform();
        const forward = camTransform.forward;
        const position = camTransform.getWorldPosition();
        const spawnPosition = new vec3(position.x + forward.x * this.spawnDistance, position.y + forward.y * this.spawnDistance, position.z + forward.z * this.spawnDistance);
        // Configure instantiation options
        const options = {
            claimOwnership: this.claimOwnership,
            persistence: this.persistence,
            worldPosition: spawnPosition,
            worldScale: new vec3(this.spawnScale, this.spawnScale, this.spawnScale),
            onSuccess: (networkRootInfo) => {
                // Enable visibility of the spawned object
                if (networkRootInfo && networkRootInfo.instantiatedObject) {
                    const spawnedObject = networkRootInfo.instantiatedObject;
                    spawnedObject.enabled = true;
                    print('Prefab spawned successfully at position: ' +
                        spawnPosition.x + ', ' +
                        spawnPosition.y + ', ' +
                        spawnPosition.z);
                }
            },
            onError: (error) => {
                print('Error instantiating prefab: ' + error);
            }
        };
        // Instantiate the prefab with the configured options
        this.instantiator.instantiate(this.prefabTemplate, options);
    }
    onDestroy() {
        var _a;
        if (this.pinchButton && this.onPinchCallback && typeof ((_a = this.pinchButton.onButtonPinched) === null || _a === void 0 ? void 0 : _a.remove) === 'function') {
            this.pinchButton.onButtonPinched.remove(this.onPinchCallback);
        }
    }
    __initialize() {
        super.__initialize();
        this.isInitialized = false;
    }
};
exports.PrefabSpawner = PrefabSpawner;
exports.PrefabSpawner = PrefabSpawner = __decorate([
    component
], PrefabSpawner);
//# sourceMappingURL=PrefabSpawn.js.map