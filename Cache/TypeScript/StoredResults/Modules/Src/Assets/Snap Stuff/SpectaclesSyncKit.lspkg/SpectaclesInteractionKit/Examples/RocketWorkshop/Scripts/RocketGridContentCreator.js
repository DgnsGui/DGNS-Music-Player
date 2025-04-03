"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RocketGridContentCreator = void 0;
var __selfType = requireType("./RocketGridContentCreator");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const RocketScrollViewItem_1 = require("./RocketScrollViewItem");
const Y_START = 0;
const Y_OFFSET = -5.4;
/**
 * This class is responsible for creating and initializing the content of a rocket grid. It uses object prefabs to instantiate items and configure their positions and properties.
 *
 */
let RocketGridContentCreator = class RocketGridContentCreator extends BaseScriptComponent {
    onAwake() {
        if (isNull(this.rocketConfigurator)) {
            throw new Error("RocketGridContentCreator: rocketConfigurator is null!");
        }
        if (this.objectPrefabs.length === 0) {
            throw new Error("RocketGridContentCreator: objectPrefabs array is empty!");
        }
        const sceneObj = this.getSceneObject();
        const rocketScrollViewItemTypeName = RocketScrollViewItem_1.RocketScrollViewItem.getTypeName();
        for (let i = 0; i < this.objectPrefabs.length; i++) {
            const prefabIndex = i % this.objectPrefabs.length;
            const prefab = this.objectPrefabs[prefabIndex];
            const item = prefab.instantiate(sceneObj);
            const screenTransform = item.getComponent("Component.ScreenTransform");
            screenTransform.offsets.setCenter(new vec2(0, Y_START + Y_OFFSET * i));
            item.enabled = true;
            let rocketScrollViewItem = item.getComponent(rocketScrollViewItemTypeName);
            if (rocketScrollViewItem !== null)
                rocketScrollViewItem.init(this.rocketConfigurator);
        }
    }
};
exports.RocketGridContentCreator = RocketGridContentCreator;
exports.RocketGridContentCreator = RocketGridContentCreator = __decorate([
    component
], RocketGridContentCreator);
//# sourceMappingURL=RocketGridContentCreator.js.map