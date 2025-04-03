"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryPointMain = void 0;
var __selfType = requireType("./EntryPointMain");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const SessionController_1 = require("../../../Core/SessionController");
const StateMachine_1 = require("../../../SpectaclesInteractionKit/Utils/StateMachine");
const BufferState_1 = require("../MappingFlowStates/BufferState/BufferState");
const JoiningState_1 = require("../MappingFlowStates/JoiningState/JoiningState");
const MappingCanceledState_1 = require("../MappingFlowStates/MappingCanceledState/MappingCanceledState");
const MappingState_1 = require("../MappingFlowStates/MappingState/MappingState");
const MappingSuccessfulState_1 = require("../MappingFlowStates/MappingSuccessfulState/MappingSuccessfulState");
const MappingUnsuccessfulState_1 = require("../MappingFlowStates/MappingUnsuccessfulState/MappingUnsuccessfulState");
const TeachingJoinedUserState_1 = require("../MappingFlowStates/TeachingJoinedUserState/TeachingJoinedUserState");
const WaitingForMappingState_1 = require("../MappingFlowStates/WaitingForMappingState/WaitingForMappingState");
const TextValues_1 = require("../Texts/TextValues");
const JoiningController_1 = require("../Utils/JoiningController");
const ProjectContainer_1 = require("../Utils/ProjectContainer");
let EntryPointMain = class EntryPointMain extends BaseScriptComponent {
    onAwake() {
        this.spinner.enabled = false;
        this.projectContainer = new ProjectContainer_1.ProjectContainer();
        this.stateMachine = new StateMachine_1.default("MappingFlow");
        SessionController_1.SessionController.getInstance().onSessionCreated.add(() => (this.spinner.enabled =
            SessionController_1.SessionController.getInstance().isColocated &&
                !SessionController_1.SessionController.getInstance().isSingleplayer()));
        this.flowComplete = SessionController_1.SessionController.getInstance().notifyOnStartColocated(() => {
            this.spinner.enabled = false;
            this.onStart();
        });
        const mappingState = new MappingState_1.MappingState(this.mappingStateInput, this.stateMachine, this.projectContainer, this.flowComplete);
        this.stateMachine.addState({
            name: MappingState_1.MappingState.name,
            onEnter: () => mappingState.enter(),
            onExit: () => mappingState.exit(),
        });
        const mappingSuccessfulState = new MappingSuccessfulState_1.MappingSuccessfulState(this.mappingSuccessfulStateInput, this.stateMachine, this.projectContainer);
        this.stateMachine.addState({
            name: MappingSuccessfulState_1.MappingSuccessfulState.name,
            onEnter: () => mappingSuccessfulState.enter(),
            onExit: () => mappingSuccessfulState.exit(),
        });
        const mappingUnsuccessfulState = new MappingUnsuccessfulState_1.MappingUnsuccessfulState(this.mappingUnsuccessfulStateInput, this.stateMachine, this.projectContainer);
        this.stateMachine.addState({
            name: MappingUnsuccessfulState_1.MappingUnsuccessfulState.name,
            onEnter: () => mappingUnsuccessfulState.enter(),
            onExit: () => mappingUnsuccessfulState.exit(),
        });
        const joiningState = new JoiningState_1.JoiningState(this.joiningStateInput, this.stateMachine, this.projectContainer, this.flowComplete);
        this.stateMachine.addState({
            name: JoiningState_1.JoiningState.name,
            onEnter: () => joiningState.enter(),
            onExit: () => joiningState.exit(),
        });
        const teachingJoinedUserState = new TeachingJoinedUserState_1.TeachingJoinedUserState(this.teachingJoinedUserStateInput, this.stateMachine, this.projectContainer);
        this.stateMachine.addState({
            name: TeachingJoinedUserState_1.TeachingJoinedUserState.name,
            onEnter: () => teachingJoinedUserState.enter(),
            onExit: () => teachingJoinedUserState.exit(),
        });
        const waitingForMappingState = new WaitingForMappingState_1.WaitingForMappingState(this.waitingForMappingStateInput, this.stateMachine);
        this.stateMachine.addState({
            name: WaitingForMappingState_1.WaitingForMappingState.name,
            onEnter: () => waitingForMappingState.enter(),
            onExit: () => waitingForMappingState.exit(),
        });
        const bufferState = new BufferState_1.BufferState(this.script, this.stateMachine);
        this.stateMachine.addState({
            name: BufferState_1.BufferState.name,
            onEnter: () => bufferState.enter(),
            onExit: () => bufferState.exit(),
        });
        const mappingCanceledState = new MappingCanceledState_1.MappingCanceledState(this.script, this.stateMachine);
        this.stateMachine.addState({
            name: MappingCanceledState_1.MappingCanceledState.name,
            onEnter: () => mappingCanceledState.enter(),
            onExit: () => mappingCanceledState.exit(),
        });
        this.joiningController = new JoiningController_1.JoiningController(this.script, this.stateMachine, this.projectContainer);
    }
    onStart() {
        if (global.deviceInfoSystem.isEditor() &&
            SessionController_1.SessionController.getInstance().getSkipUiInStudio()) {
            this.flowComplete(true);
            return;
        }
        this.replaceTexts();
        SessionController_1.SessionController.getInstance().setIsUserMapper(SessionController_1.SessionController.getInstance().isHost() &&
            (SessionController_1.SessionController.getInstance().getLocatedAtComponent().location ===
                null ||
                SessionController_1.SessionController.getInstance().getColocatedBuildStatus() === "none"));
        if (SessionController_1.SessionController.getInstance().getIsUserMapper()) {
            this.stateMachine.enterState(MappingState_1.MappingState.name);
        }
        else {
            this.joiningController.startJoiningFlow();
        }
        this.joiningController.startEventsMonitoring();
    }
    replaceTexts() {
        TextValues_1.TextValues.MAPPING_HINTS_P2[0].text =
            TextValues_1.TextValues.MAPPING_HINTS_P2[0].text.replace(TextValues_1.TextValues.P1, SessionController_1.SessionController.getInstance().getHostUserName());
        TextValues_1.TextValues.TUTORIAL_P2.text = TextValues_1.TextValues.MAPPING_HINTS_P2[0].text.replace(TextValues_1.TextValues.P1, SessionController_1.SessionController.getInstance().getHostUserName());
    }
};
exports.EntryPointMain = EntryPointMain;
exports.EntryPointMain = EntryPointMain = __decorate([
    component
], EntryPointMain);
//# sourceMappingURL=EntryPointMain.js.map