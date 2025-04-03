"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMultiplayerSessionConfig = exports.LatencySetting = exports.MockUserConfig = void 0;
class MockUserConfig {
    constructor() {
        this.connectionId = "";
        this.displayName = "";
        this.userId = "";
    }
}
exports.MockUserConfig = MockUserConfig;
var LatencySetting;
(function (LatencySetting) {
    LatencySetting.None = 0;
    LatencySetting.OneFrame = .0000001;
    LatencySetting.RandomLowLatency = [0.1, .25];
    LatencySetting.ConsistentLowLatency = .05;
    LatencySetting.RandomHighLatency = [0.75, 1.0];
    LatencySetting.ConsistentHighLatency = 0.5;
    function getLatencyValue(setting) {
        if (typeof (setting) === "number") {
            return setting;
        }
        if (Array.isArray(setting)) {
            return MathUtils.lerp(setting[0], setting[1], Math.random());
        }
        return LatencySetting.None;
    }
    LatencySetting.getLatencyValue = getLatencyValue;
})(LatencySetting || (exports.LatencySetting = LatencySetting = {}));
class MockMultiplayerSessionConfig {
    constructor() {
        this.connectionLatency = LatencySetting.OneFrame;
        this.realtimeStoreLatency = LatencySetting.OneFrame;
        this.messageLatency = LatencySetting.OneFrame;
        this.localUserInfoLatency = LatencySetting.OneFrame;
    }
    static createWithAllSetting(setting) {
        const ret = new MockMultiplayerSessionConfig();
        ret.connectionLatency = setting;
        ret.localUserInfoLatency = setting;
        ret.messageLatency = setting;
        ret.realtimeStoreLatency = setting;
        return ret;
    }
    static createWithNoLatency() {
        return this.createWithAllSetting(LatencySetting.None);
    }
    static createWithOneFrameLatency() {
        return this.createWithAllSetting(LatencySetting.OneFrame);
    }
    static createWithSimulatedLowLatency() {
        return this.createWithAllSetting(LatencySetting.RandomLowLatency);
    }
    static createWithSimulatedHighLatency() {
        return this.createWithAllSetting(LatencySetting.RandomHighLatency);
    }
}
exports.MockMultiplayerSessionConfig = MockMultiplayerSessionConfig;
;
//# sourceMappingURL=MockMultiplayerSessionConfig.js.map