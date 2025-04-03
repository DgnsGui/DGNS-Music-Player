"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingJoinedUserState = void 0;
const Tutorial_1 = require("../../UI/MappingFlow/Tutorial/Tutorial");
const TutorialTypeEnum_1 = require("../../UI/MappingFlow/Tutorial/TutorialTypeEnum");
const ObjectLocator_1 = require("../../UI/ObjectLocator/ObjectLocator");
const BufferState_1 = require("../BufferState/BufferState");
class TeachingJoinedUserState {
    constructor(input, stateMachine, projectContainer) {
        this.input = input;
        this.stateMachine = stateMachine;
        this.projectContainer = projectContainer;
        this.teachingTime = 20;
        this.isFirstTimeTeaching = true;
        this.tutorial = new Tutorial_1.Tutorial(input.tutorialNotificationInput, input.tutorialParametersInput);
        this.objectLocator = new ObjectLocator_1.ObjectLocator(input.objectLocatorInput, projectContainer);
        this.delayedEvent = input.script.createEvent("DelayedCallbackEvent");
        this.delayedEvent.bind(() => {
            stateMachine.enterState(BufferState_1.BufferState.name);
        });
    }
    enter() {
        if (this.projectContainer.joinedUsers.length === 0) {
            this.stateMachine.enterState(BufferState_1.BufferState.name);
        }
        if (this.isFirstTimeTeaching) {
            this.tutorial.start(TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1TeachP2);
        }
        this.delayedEvent.reset(this.teachingTime);
        this.objectLocator.start(this.projectContainer.joinedUsers[0].displayName);
        this.isFirstTimeTeaching = false;
    }
    exit() {
        this.delayedEvent.cancel();
        this.objectLocator.stop();
        this.tutorial.stop();
    }
}
exports.TeachingJoinedUserState = TeachingJoinedUserState;
//# sourceMappingURL=TeachingJoinedUserState.js.map