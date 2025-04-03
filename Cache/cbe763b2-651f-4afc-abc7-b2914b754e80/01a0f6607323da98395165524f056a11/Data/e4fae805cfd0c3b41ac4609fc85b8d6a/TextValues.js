"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextValues = void 0;
var TextValues;
(function (TextValues) {
    TextValues.MAPPING_DONE_P1 = "You’re all set!";
    TextValues.MAPPING_DONE_P2 = "Your spaces are aligned!";
    TextValues.UNSUCCESS_NOTIFICATION_TITLE_P1 = "Couldn’t successfully scan your surroundings";
    TextValues.UNSUCCESS_NOTIFICATION_TITLE_P2 = "Couldn’t successfully align your spaces";
    TextValues.TUTORIAL_P1 = {
        title: "Walk around and look around to scan your area",
        text: "Improve the quality of your map by moving laterally and viewing the same objects from different angles."
    };
    TextValues.TUTORIAL_P2 = {
        title: "Align your spaces",
        text: "Match %P1%’s starting position as close as possible to align your spaces."
    };
    TextValues.TUTORIAL_P1_TEACHES_P2 = {
        title: "Align your spaces",
        text: "Guide others to match your starting position to align your spaces."
    };
    TextValues.ALIGN_HINT_P1_TEACHES_P2 = "Show %P2% the group start point";
    TextValues.WAITING_FOR_MAPPING = "Wait for %P1% to set things up";
    TextValues.TEACHING_TEXT = "Tell %P2% to match this position and view direction";
    TextValues.MAPPING_HINTS_P1 = [
        {
            title: "Ensure surroundings have objects and patterns",
            text: "This helps with better detection.",
        },
        {
            title: "Avoid plain, solid-colored walls",
            text: "Detailed environments provide more information.",
        },
        {
            title: "Improve lighting",
            text: "Good lighting makes details visible.",
        },
        {
            title: "Move steadily",
            text: "Lateral movements improve quality and help avoid missing details.",
        },
    ];
    TextValues.MAPPING_HINTS_P2 = [
        {
            title: "Align your spaces",
            text: "Match %P1%’s starting position as close as possible to align your spaces",
        },
        {
            title: "Move steadily",
            text: "Lateral movements improve quality and help avoid missing details.",
        },
        {
            title: "Ensure environment details haven't changed",
            text: "Make sure furniture and objects are in the same place for better detection.",
        },
        {
            title: "Ensure lighting conditions haven't changed",
            text: "Consistent lighting makes details visible.",
        },
    ];
    TextValues.P1 = "%P1%";
    TextValues.P2 = "%P2%";
})(TextValues || (exports.TextValues = TextValues = {}));
//# sourceMappingURL=TextValues.js.map