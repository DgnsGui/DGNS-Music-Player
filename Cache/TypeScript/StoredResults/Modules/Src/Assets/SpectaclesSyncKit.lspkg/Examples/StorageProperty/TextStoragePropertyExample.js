"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TextStoragePropertyExample_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextStoragePropertyExample = void 0;
var __selfType = requireType("./TextStoragePropertyExample");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const StorageProperty_1 = require("../../Core/StorageProperty");
const StoragePropertySet_1 = require("../../Core/StoragePropertySet");
const SyncEntity_1 = require("../../Core/SyncEntity");
const SyncKitLogger_1 = require("../../Utils/SyncKitLogger");
// The text to scroll
const SCROLLING_TEXT = "Hello, World!";
let TextStoragePropertyExample = TextStoragePropertyExample_1 = class TextStoragePropertyExample extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(() => this.updateText());
    }
    updateText() {
        if (!this.syncEntity.doIOwnStore()) {
            this.log.i("Not the syncEntity owner, not changing anything.");
            return;
        }
        const numChars = getTime() % SCROLLING_TEXT.length;
        const newText = SCROLLING_TEXT.substring(0, numChars);
        this.myText.text = newText;
    }
    __initialize() {
        super.__initialize();
        this.log = new SyncKitLogger_1.SyncKitLogger(TextStoragePropertyExample_1.name);
        this.myPropText = StorageProperty_1.StorageProperty.forTextText(this.myText);
        this.myStoragePropertySet = new StoragePropertySet_1.StoragePropertySet([this.myPropText]);
        this.syncEntity = new SyncEntity_1.SyncEntity(this, this.myStoragePropertySet, true);
    }
};
exports.TextStoragePropertyExample = TextStoragePropertyExample;
exports.TextStoragePropertyExample = TextStoragePropertyExample = TextStoragePropertyExample_1 = __decorate([
    component
], TextStoragePropertyExample);
//# sourceMappingURL=TextStoragePropertyExample.js.map