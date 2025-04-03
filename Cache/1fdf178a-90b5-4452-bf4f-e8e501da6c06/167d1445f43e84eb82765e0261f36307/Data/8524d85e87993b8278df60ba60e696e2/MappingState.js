"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingState = void 0;
const SessionController_1 = require("../../../../Core/SessionController");
const WorldCameraFinderProvider_1 = require("../../../../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider");
const SyncKitLogger_1 = require("../../../../Utils/SyncKitLogger");
const TextValues_1 = require("../../Texts/TextValues");
const ProgressBar_1 = require("../../UI/MappingFlow/ProgressBar/ProgressBar");
const TextMappingHint_1 = require("../../UI/MappingFlow/TextMappingHint/TextMappingHint");
const Tutorial_1 = require("../../UI/MappingFlow/Tutorial/Tutorial");
const TutorialTypeEnum_1 = require("../../UI/MappingFlow/Tutorial/TutorialTypeEnum");
const SharedFunctions_1 = require("../../Utils/SharedFunctions");
const MappingCanceledState_1 = require("../MappingCanceledState/MappingCanceledState");
const MappingSuccessfulState_1 = require("../MappingSuccessfulState/MappingSuccessfulState");
const MappingUnsuccessfulState_1 = require("../MappingUnsuccessfulState/MappingUnsuccessfulState");
class MappingState {
    constructor(input, stateMachine, projectContainer, onFlowComplete) {
        this.input = input;
        this.stateMachine = stateMachine;
        this.projectContainer = projectContainer;
        this.onFlowComplete = onFlowComplete;
        this.worldCamera = WorldCameraFinderProvider_1.default.getInstance();
        this.worldCameraTransform = this.worldCamera.getTransform();
        this.mappingWaitingTime = 30;
        this.log = new SyncKitLogger_1.SyncKitLogger(MappingState.name);
        this.isFirstTimeMapping = true;
        this.mappingSession = null;
        this.tutorial = new Tutorial_1.Tutorial(input.tutorialNotificationInput, input.tutorialParametersInput);
        this.progressBar = new ProgressBar_1.ProgressBar(input.mappingProgressInput, input.progressBarParametersInput);
        this.textMappingHint = new TextMappingHint_1.TextMappingHint(input.textMappingHintInput, input.textMappingHintTimingsInput);
        this.delayedEvent = input.script.createEvent("DelayedCallbackEvent");
        this.delayedEvent.bind(() => {
            stateMachine.enterState(MappingUnsuccessfulState_1.MappingUnsuccessfulState.name);
        });
        this.script = input.script;
    }
    enter() {
        this.mappingSession = SessionController_1.SessionController.getInstance().getMappingSession();
        this.locationCloudStorageModule =
            SessionController_1.SessionController.getInstance().getLocationCloudStorageModule();
        if (this.isFirstTimeMapping) {
            this.setupBuilding();
            this.tutorial.start(TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1);
        }
        this.progressBar.start();
        this.textMappingHint.start(TextValues_1.TextValues.MAPPING_HINTS_P1, this.tutorial.getDurationByAnimationType(TutorialTypeEnum_1.TutorialTypeEnum.TutorialP1) + 3);
        this.delayedEvent.reset(this.mappingWaitingTime);
        this.projectContainer.startPointPosition =
            this.worldCameraTransform.getWorldPosition();
        const back = this.worldCameraTransform.back;
        back.y = 0;
        this.projectContainer.startPointRotation = quat.lookAt(back, vec3.up());
        this.isFirstTimeMapping = false;
    }
    exit() {
        this.delayedEvent.cancel();
        this.tutorial.stop();
        this.progressBar.stop();
        this.textMappingHint.stop();
    }
    setupBuilding() {
        this.startBuilding();
        if (global.deviceInfoSystem.isEditor()) {
            (0, SharedFunctions_1.delayFrames)(this.script, 30, () => this.onEditorMappingDelayComplete());
        }
        else {
            this.mappingSession.onMapped.add((location) => this.onFinishedMapping(location));
        }
        this.updateEvent = this.script.createEvent("UpdateEvent");
        let checkpointRequested = false;
        this.updateEvent.bind(() => {
            if (this.mappingSession.quality >= 1.0 && !checkpointRequested) {
                this.mappingSession.checkpoint();
                checkpointRequested = true;
            }
        });
    }
    onEditorMappingDelayComplete() {
        this.onFinishedMapping(null);
        SessionController_1.SessionController.getInstance().setColocatedMapId("LocalMap");
    }
    onFinishedMapping(location) {
        if (this.stateMachine.currentState.name === MappingCanceledState_1.MappingCanceledState.name) {
            return;
        }
        SessionController_1.SessionController.getInstance().setColocatedBuildStatus(SessionController_1.ColocatedBuildStatus.Built);
        this.onFlowComplete(true);
        if (location !== null) {
            this.uploadMap(location);
        }
        this.stateMachine.enterState(MappingSuccessfulState_1.MappingSuccessfulState.name);
    }
    uploadMap(location) {
        const localLocation = LocationAsset.getAROrigin();
        SessionController_1.SessionController.getInstance().getLocatedAtComponent().location =
            localLocation;
        SessionController_1.SessionController.getInstance().notifyOnLocatedAtFound(() => this.onLocatedAtFound());
        this.log.i("Storing custom location");
        this.locationCloudStorageModule.storeLocation(location, (locationId) => this.storeLocationSuccess(locationId), (locationId) => this.storeLocationFailure(locationId));
    }
    storeLocationSuccess(locationId) {
        this.log.i("Stored custom location: " + locationId);
        SessionController_1.SessionController.getInstance().setColocatedMapId(locationId);
    }
    storeLocationFailure(err) {
        this.log.i("[MappingFlow] Failure:" + err.toString());
        if (global.deviceInfoSystem.isEditor()) {
            // Expected to fail in the editor
            this.log.i("[MappingFlow] Failed in the editor");
        }
    }
    onLocatedAtFound() {
        this.log.i("[MappingFlow] Location Found");
    }
    startBuilding() {
        SessionController_1.SessionController.getInstance().setIsUserMapper(true);
        SessionController_1.SessionController.getInstance().setColocatedBuildStatus(SessionController_1.ColocatedBuildStatus.Building);
    }
}
exports.MappingState = MappingState;
//# sourceMappingURL=MappingState.js.map