"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerManager = void 0;
var __selfType = requireType("./MusicPlayerManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let MusicPlayerManager = class MusicPlayerManager extends BaseScriptComponent {
    // --- Core Methods ---
    onAwake() {
        var _a, _b;
        this.api.stopTrack = this.stopTrack.bind(this);
        if (!this.validateInputs()) {
            print("Input validation failed.");
            return;
        }
        this.combineTrackData();
        if (this.allTracksData.length === 0) {
            print("No tracks provided.");
        }
        this.disableAllPrefabs();
        this.setupCallbacks();
        this.setupProgressBar();
        // ** Bind main update loop functions **
        this.createEvent("UpdateEvent").bind(() => {
            this.updatePlayer();
            this.updateSphereRotation();
            // ** Check pending delayed calls every frame **
            this.checkDelayedCalls();
        });
        this.updateActivePrefab();
        this.updateTrackInfo();
        print(`Initialized with ${((_a = this.localTracks) === null || _a === void 0 ? void 0 : _a.length) || 0} local, ${((_b = this.remoteTracks) === null || _b === void 0 ? void 0 : _b.length) || 0} remote. Total: ${this.allTracksData.length}`);
    }
    // --- MODIFIED: delayedCall adds to the pending list ---
    delayedCall(delay, callback) {
        if (!callback)
            return;
        if (delay <= 0) {
            // Execute immediately if delay is zero or negative
            try {
                callback();
            }
            catch (e) {
                print("Error in immediate delayedCall callback: " + e);
            }
            return;
        }
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime: executeTime, callback: callback });
        // Sort by execution time to potentially optimize checking, though likely negligible benefit here
        // this.pendingDelayedCalls.sort((a, b) => a.executeTime - b.executeTime);
    }
    // --- NEW: Function to process pending delayed calls ---
    checkDelayedCalls() {
        if (this.pendingDelayedCalls.length === 0) {
            return; // Quick exit if nothing pending
        }
        const currentTime = getTime();
        // Iterate backwards for safe removal
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                // Remove *before* executing to prevent issues if callback adds another delayed call
                this.pendingDelayedCalls.splice(i, 1);
                try {
                    // print(`Executing delayed call scheduled for ${call.executeTime}`);
                    call.callback();
                }
                catch (e) {
                    print("Error executing delayed call callback: " + e);
                }
            }
        }
    }
    // --- Other methods remain the same ---
    disableAllPrefabs() { }
    validateInputs() { /* ... */ return true; }
    combineTrackData() { }
    setupCallbacks() { }
    setupTrackFinishedCallback() { }
    handleTrackFinished() { }
    updateActivePrefab() { }
    loadTrack(index) {
        if (this.isLoadingRemote)
            return;
        if (index < 0 || index >= this.allTracksData.length) {
            this.stopTrack();
            return;
        }
        const playAfterLoad = this.shouldAutoPlay;
        this.shouldAutoPlay = false;
        this.audioInitialized = false;
        this.isManualStop = false;
        if (this.isPlaying || this.isPaused) { /* stop audio */
            try {
                this.audioComponent.stop(false);
            }
            catch (e) { }
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.currentPlaybackTime = 0;
        this.audioComponent.audioTrack = null;
        this.currentTrackIndex = index;
        const trackData = this.allTracksData[this.currentTrackIndex];
        this.updateTrackInfo();
        this.updateActivePrefab();
        print(`Loading track ${index}: ${trackData.title} (${trackData.isRemote ? 'Remote' : 'Local'}) - Intent: ${playAfterLoad}`);
        if (trackData.isRemote) {
            this.isLoadingRemote = true;
            const remoteAsset = trackData.asset; /* update UI */
            const onDownloadedCallback = (downloadedAsset) => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                this.isLoadingRemote = false;
                return;
            } this.isLoadingRemote = false; if (downloadedAsset && downloadedAsset.isOfType("Asset.AudioTrackAsset")) {
                const audioTrack = downloadedAsset; /* assign track, set flags */
                this.audioComponent.audioTrack = audioTrack;
                this.setupTrackFinishedCallback();
                this.audioInitialized = true;
                this.trackStartTime = getTime();
                this.currentPlaybackTime = 0;
                if (playAfterLoad) {
                    this.delayedCall(0.05, () => this.playTrack());
                }
                else {
                    this.updatePlayer();
                }
            }
            else {
                this.handleLoadError(index, "Invalid asset type");
            } };
            const onFailedCallback = () => { if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                this.isLoadingRemote = false;
                return;
            } this.isLoadingRemote = false; this.handleLoadError(index, "Download failed"); };
            remoteAsset.downloadAsset(onDownloadedCallback, onFailedCallback);
        }
        else {
            const localAsset = trackData.asset; /* assign track, set flags */
            this.audioComponent.audioTrack = localAsset;
            this.setupTrackFinishedCallback();
            this.audioInitialized = true;
            this.trackStartTime = getTime();
            this.currentPlaybackTime = 0;
            if (playAfterLoad) {
                this.delayedCall(0.05, () => this.playTrack());
            }
            else {
                this.updatePlayer();
            }
        }
    }
    handleLoadError(failedIndex, reason) { }
    togglePlayPause() { }
    playTrack() { }
    pauseTrack() { }
    stopTrack() {
        print("Stop called.");
        this.isManualStop = true;
        this.isLoadingRemote = false;
        // ** Clear any pending delayed calls when stopping **
        this.pendingDelayedCalls = [];
        if (this.audioComponent) { /* ... stop audio, clear track ... */ }
        /* ... reset other states ... */
        this.isPlaying = false;
        this.isPaused = false;
        this.shouldAutoPlay = false;
        this.currentTrackIndex = -1;
        this.audioInitialized = false;
        this.currentPlaybackTime = 0;
        /* ... update UI ... */
        this.updateEarthPosition(0, 1);
        this.updateTrackInfo();
        this.updateActivePrefab();
        print("Stopped & reset.");
    }
    nextTrack() { }
    prevTrack() { }
    updateTrackInfo() { }
    updatePlayer() { }
    updateEarthPosition(currentTime, totalTime) { }
    formatTime(timeInSeconds) { /* ... */ return ""; }
    setupProgressBar() { }
    updateSphereRotation() { }
    getCurrentTrackIndex() { /* ... */ return -1; }
    getTrackPrefab(index) { /* ... */ return null; }
    onDestroy() {
        print("Destroying MusicPlayerManager.");
        this.pendingDelayedCalls = []; // Clear pending calls
        if (this.audioComponent && (this.isPlaying || this.isPaused)) { /* ... stop audio ... */ }
        /* ... remove listeners ... */
        this.disableAllPrefabs();
    }
    __initialize() {
        super.__initialize();
        this.allTracksData = [];
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isPaused = false;
        this.isRepeatEnabled = false;
        this.isShuffleEnabled = false;
        this.shouldAutoPlay = false;
        this.isLoadingRemote = false;
        this.isManualStop = false;
        this.trackStartTime = 0;
        this.currentPlaybackTime = 0;
        this.audioInitialized = false;
        this.currentActivePrefab = null;
        this.lastPinchTimePlayPause = 0;
        this.lastPinchTimeNext = 0;
        this.lastPinchTimePrev = 0;
        this.DEBOUNCE_PLAYPAUSE = 0.5;
        this.DEBOUNCE_NEXTPREV = 0.3;
        this.pendingDelayedCalls = [];
    }
};
exports.MusicPlayerManager = MusicPlayerManager;
exports.MusicPlayerManager = MusicPlayerManager = __decorate([
    component
], MusicPlayerManager);
//# sourceMappingURL=MusicPlayerManager.js.map