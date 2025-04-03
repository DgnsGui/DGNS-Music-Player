"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingUnsuccessfulNotification = void 0;
const SessionController_1 = require("../../../../Core/SessionController");
const InteractionConfigurationProvider_1 = require("../../../../SpectaclesInteractionKit/Providers/InteractionConfigurationProvider/InteractionConfigurationProvider");
const animate_1 = require("../../../../SpectaclesInteractionKit/Utils/animate");
const mathUtils_1 = require("../../../../SpectaclesInteractionKit/Utils/mathUtils");
const JoiningState_1 = require("../../MappingFlowStates/JoiningState/JoiningState");
const MappingState_1 = require("../../MappingFlowStates/MappingState/MappingState");
const MappingUnsuccessfulTypeEnum_1 = require("../../MappingFlowStates/MappingUnsuccessfulState/MappingUnsuccessfulTypeEnum");
const TextValues_1 = require("../../Texts/TextValues");
const SharedFunctions_1 = require("../../Utils/SharedFunctions");
class MappingUnsuccessfulNotification {
    constructor(input, stateMachine, projectContainer) {
        this.input = input;
        this.appearNotificationDuration = 0.3;
        this.interactionConfigurationProvider = InteractionConfigurationProvider_1.InteractionConfigurationProvider.getInstance();
        this.rootTransform = input.root.getTransform();
        this.tilePass = input.tile.mainMaterial.mainPass;
        this.keepLookingButtonPass =
            input.keepLookingButtonMesh.mainMaterial.mainPass;
        this.setNotificationAlpha(0);
        this.keepLookingButtonInteractable = input.keepLookingButton
            .getSceneObject()
            .getComponent(this.interactionConfigurationProvider.requireType("Interactable"));
        input.keepLookingButton.onButtonPinched.add(() => {
            if (SessionController_1.SessionController.getInstance().getIsUserMapper()) {
                stateMachine.enterState(MappingState_1.MappingState.name);
            }
            else {
                stateMachine.enterState(JoiningState_1.JoiningState.name);
            }
        });
        this.keepLookingButtonInteractable.enabled = false;
        input.root.enabled = false;
    }
    start(type) {
        this.input.root.enabled = true;
        (0, SharedFunctions_1.setObjectInTheWorldOnDistance)(this.input.root, this.input.distance);
        this.initNotificationUI(type);
        this.alphaTweenCancelFunction = this.animateNotificationToAlpha(0, 1, this.appearNotificationDuration, () => {
            this.keepLookingButtonInteractable.enabled = true;
        });
    }
    stop() {
        var _a;
        this.input.root.enabled = false;
        (_a = this.alphaTweenCancelFunction) === null || _a === void 0 ? void 0 : _a.call(this);
        this.keepLookingButtonInteractable.enabled = false;
        this.setNotificationAlpha(0);
    }
    initNotificationUI(type) {
        switch (type) {
            case MappingUnsuccessfulTypeEnum_1.MappingUnsuccessfulTypeEnum.Scan:
                this.input.titleText.text = TextValues_1.TextValues.UNSUCCESS_NOTIFICATION_TITLE_P1;
                for (let i = 0; i < TextValues_1.TextValues.MAPPING_HINTS_P1.length; ++i) {
                    this.input.hintsTitle[i].text = TextValues_1.TextValues.MAPPING_HINTS_P1[i].title;
                    this.input.hintsText[i].text = TextValues_1.TextValues.MAPPING_HINTS_P1[i].text;
                }
                break;
            case MappingUnsuccessfulTypeEnum_1.MappingUnsuccessfulTypeEnum.Align:
                this.input.titleText.text = TextValues_1.TextValues.UNSUCCESS_NOTIFICATION_TITLE_P2;
                for (let i = 0; i < TextValues_1.TextValues.MAPPING_HINTS_P2.length; ++i) {
                    this.input.hintsTitle[i].text = TextValues_1.TextValues.MAPPING_HINTS_P2[i].title;
                    this.input.hintsText[i].text = TextValues_1.TextValues.MAPPING_HINTS_P2[i].text;
                }
                break;
        }
    }
    animateNotificationToAlpha(from, to, duration, onComplete = () => { }) {
        return (0, animate_1.default)({
            update: (t) => {
                const currentAlpha = (0, mathUtils_1.lerp)(from, to, t);
                this.setNotificationAlpha(currentAlpha);
            },
            start: 0,
            end: 1,
            duration: duration,
            ended: onComplete,
        });
    }
    setNotificationAlpha(value) {
        (0, SharedFunctions_1.setAlpha)(this.input.root, value);
        this.tilePass.notification_tile_opacity = value;
        this.keepLookingButtonPass.alpha = value;
    }
}
exports.MappingUnsuccessfulNotification = MappingUnsuccessfulNotification;
//# sourceMappingURL=MappingUnsuccessfulNotification.js.map