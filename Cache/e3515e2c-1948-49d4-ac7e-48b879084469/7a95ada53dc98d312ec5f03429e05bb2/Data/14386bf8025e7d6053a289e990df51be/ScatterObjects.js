"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSpawner = void 0;
var __selfType = requireType("./ScatterObjects");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let ObjectSpawner = class ObjectSpawner extends BaseScriptComponent {
    onAwake() {
        this.objects = [this.object1, this.object2, this.object3, this.object4, this.object5];
        this.hideAllObjects();
        this.pinchButton.onButtonPinched.add(() => {
            this.toggleObjects();
        });
        this.createEvent('UpdateEvent').bind(() => {
            this.updateAnimation();
        });
    }
    toggleObjects() {
        this.isObjectsVisible = !this.isObjectsVisible;
        if (this.isObjectsVisible) {
            this.showObjects();
        }
        else {
            this.hideAllObjects();
        }
    }
    showObjects() {
        const bpm = parseFloat(this.bpmText.text) || 120;
        this.animationDuration = 60 / bpm;
        this.animationProgress = 0;
        if (!this.camera) {
            print("Camera not assigned in Inspector!");
            return;
        }
        const cameraTransform = this.camera.getTransform();
        const cameraPos = cameraTransform.getWorldPosition();
        const cameraForward = cameraTransform.forward.normalize();
        const cameraRight = cameraTransform.right.normalize();
        const cameraUp = cameraTransform.up.normalize();
        print(`Camera Position: ${cameraPos.x}, ${cameraPos.y}, ${cameraPos.z}`);
        print(`Camera Forward: ${cameraForward.x}, ${cameraForward.y}, ${cameraForward.z}`);
        // Grid starts distanceFromCamera in front of the user
        const gridStart = cameraPos.add(cameraForward.uniformScale(this.distanceFromCamera));
        const totalWidth = (this.gridWidth - 1) * this.gridSpacing;
        const startX = -totalWidth / 2;
        print(`Grid Start: ${gridStart.x}, ${gridStart.y}, ${gridStart.z}`);
        // Spread 5 objects across the grid (e.g., along one row or diagonally)
        let objectIndex = 0;
        const maxObjects = this.objects.length;
        for (let i = 0; i < this.gridWidth && objectIndex < maxObjects; i++) {
            for (let j = 0; j < this.gridDepth && objectIndex < maxObjects; j++) {
                const obj = this.objects[objectIndex];
                if (obj) {
                    const xOffset = startX + i * this.gridSpacing;
                    const zOffset = j * this.gridSpacing;
                    const lateralOffset = cameraRight.uniformScale(xOffset);
                    const depthOffset = cameraForward.uniformScale(zOffset);
                    const spawnPosition = gridStart.add(lateralOffset).add(depthOffset);
                    // Set y to gridHeight (ground level or custom height)
                    spawnPosition.y = this.gridHeight;
                    print(`Spawning Object ${objectIndex} at: ${spawnPosition.x}, ${spawnPosition.y}, ${spawnPosition.z}`);
                    const transform = obj.getTransform();
                    transform.setWorldPosition(spawnPosition);
                    const direction = cameraPos.sub(spawnPosition).normalize();
                    const rotation = quat.lookAt(direction, vec3.up());
                    transform.setWorldRotation(rotation);
                    transform.setLocalScale(new vec3(0.1, 0.1, 0.1));
                    obj.enabled = true;
                    objectIndex++;
                }
            }
        }
    }
    hideAllObjects() {
        this.objects.forEach((obj) => {
            if (obj) {
                obj.enabled = false;
            }
        });
    }
    updateAnimation() {
        if (!this.isObjectsVisible || this.animationProgress >= 1) {
            return;
        }
        const currentTime = getTime();
        const deltaTime = currentTime - (this.lastUpdateTime || currentTime);
        this.lastUpdateTime = currentTime;
        this.animationProgress += deltaTime / this.animationDuration;
        this.animationProgress = Math.min(this.animationProgress, 1);
        const scale = 0.1 + (this.animationProgress * 0.9);
        this.objects.forEach((obj) => {
            if (obj && obj.enabled) {
                obj.getTransform().setLocalScale(new vec3(scale, scale, scale));
            }
        });
    }
    __initialize() {
        super.__initialize();
        this.isObjectsVisible = false;
        this.objects = [];
        this.animationProgress = 0;
        this.animationDuration = 0;
        this.lastUpdateTime = 0;
    }
};
exports.ObjectSpawner = ObjectSpawner;
exports.ObjectSpawner = ObjectSpawner = __decorate([
    component
], ObjectSpawner);
//# sourceMappingURL=ScatterObjects.js.map