"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandAnimationsLibrary = exports.HandMode = exports.HandAnimationClipInfo = exports.InteractionHintController = exports.HintAnimation = void 0;
var __selfType = requireType("./InteractionHintController");
function component(target) { target.getTypeName = function () { return __selfType; }; }
const LSTween_1 = require("../LSTween/LSTween");
const Easing_1 = require("../LSTween/TweenJS/Easing");
const mainGroup_1 = require("../LSTween/TweenJS/mainGroup");
const ANIMATION_END_EVENT_NAME = 'AnimationEnd';
class HintAnimation {
    constructor() {
        this.oneHandedAnimation_l = "pinch_near";
        this.oneHandedAnimation_r = "pinch_near";
        this.twoHandedAnimation = "two_hands_pinch_scale";
    }
}
exports.HintAnimation = HintAnimation;
let InteractionHintController = class InteractionHintController extends BaseScriptComponent {
    onAwake() {
        this.createEvent("UpdateEvent").bind(() => {
            this.onUpdate();
        });
        this.animationEndEvent = this.createEvent("DelayedCallbackEvent");
        this.handHintsPrefab = requireAsset("../Prefabs/HandHints.prefab");
        this.handHints = this.handHintsPrefab.instantiate(this.getSceneObject());
        //hand meshes
        this.leftHandMesh = this.handHints.getChild(0);
        this.rightHandMesh = this.handHints.getChild(1);
        //finger landmarks
        this.leftIndexTip = this.handHints.getChild(2).getChild(1).getChild(1).getChild(0).getChild(0).getChild(0).getChild(0);
        this.leftThumbTip = this.handHints.getChild(2).getChild(1).getChild(0).getChild(0).getChild(0).getChild(0).getChild(0);
        this.rightIndexTip = this.handHints.getChild(2).getChild(0).getChild(1).getChild(0).getChild(0).getChild(0).getChild(0);
        this.rightThumbTip = this.handHints.getChild(2).getChild(0).getChild(0).getChild(0).getChild(0).getChild(0).getChild(0);
        //cursor
        this.cursor = this.handHints.getChild(3);
        //animation player
        this.animationPlayer = this.handHints.getComponent("AnimationPlayer");
        this.initHandMeshMaterials();
        this.initCursorMaterial();
        if (this.hintAnimations.length > 0) {
            this.hintAnimations.forEach((sequenceItem) => {
                //config hand type
                switch (sequenceItem.handType) {
                    //left
                    case 0:
                        this.rightHandMesh.enabled = false;
                        var clipInfo = new HandAnimationClipInfo(sequenceItem.handType, sequenceItem.oneHandedAnimation_l, sequenceItem.position);
                        this.clipsToPlay.push(clipInfo);
                        break;
                    //right
                    case 1:
                        this.leftHandMesh.enabled = false;
                        var clipInfo = new HandAnimationClipInfo(sequenceItem.handType, sequenceItem.oneHandedAnimation_r, sequenceItem.position);
                        this.clipsToPlay.push(clipInfo);
                        break;
                    //both
                    case 2:
                        var clipInfo = new HandAnimationClipInfo(sequenceItem.handType, sequenceItem.twoHandedAnimation, sequenceItem.position);
                        this.clipsToPlay.push(clipInfo);
                        break;
                }
            });
        }
        //autoplay config
        if (this.autoPlay === true) {
            if (this.clipsToPlay.length > 0) {
                // Start the sequence
                this.playClip();
            }
        }
    }
    onUpdate() {
        //left hand pinch glow and cursor
        if (this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchNear ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchFar ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchMoveX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchMoveY ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchMoveZ ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchRotateX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchRotateY ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchRotateZ ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchSwipeX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchSwipeY) {
            var indexTipPos = this.leftIndexTip.getTransform().getWorldPosition();
            var thumbTipPos = this.leftThumbTip.getTransform().getWorldPosition();
            var distance = indexTipPos.distance(thumbTipPos);
            // print("d: " + distance.toFixed(4))
            if (distance < 2 && this.isLeftHandPinching == false) {
                this.left_tipsGlowMaterial.mainPass.glowIntensity = 1.0;
                this.isLeftHandPinching = true;
                //cursor
                if (this.cursor.enabled == true) {
                    this.cursorMaterial.mainPass.isTriggering = 3.0;
                }
            }
            else if (distance > 3 && this.isLeftHandPinching == true) {
                this.left_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
                this.isLeftHandPinching = false;
                //cursor
                if (this.cursor.enabled == true) {
                    this.cursorMaterial.mainPass.isTriggering = 0.0;
                }
            }
            //cursor
            if (this.cursor.enabled == true) {
                var clampedD = MathUtils.clamp(distance, 1, 12);
                this.cursorMaterial.mainPass.circleSquishScale = MathUtils.remap(clampedD, 1, 12, 0.5, 1);
            }
        }
        //right hand pinch glow
        if (this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchNear ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchFar ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchMoveX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchMoveY ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchMoveZ ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchRotateX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchRotateY ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchRotateZ ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchSwipeX ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchSwipeY) {
            var indexTipPos = this.rightIndexTip.getTransform().getWorldPosition();
            var thumbTipPos = this.rightThumbTip.getTransform().getWorldPosition();
            var distance = thumbTipPos.distance(indexTipPos);
            if (distance < 2 && this.isRightHandPinching == false) {
                this.right_tipsGlowMaterial.mainPass.glowIntensity = 1.0;
                this.isRightHandPinching = true;
                //cursor
                if (this.cursor.enabled == true) {
                    this.cursorMaterial.mainPass.isTriggering = 3.0;
                }
            }
            else if (distance > 3 && this.isRightHandPinching == true) {
                this.right_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
                this.isRightHandPinching = false;
                //cursor
                if (this.cursor.enabled == true) {
                    this.cursorMaterial.mainPass.isTriggering = 0.0;
                }
            }
            //cursor
            if (this.cursor.enabled == true) {
                var clampedD = MathUtils.clamp(distance, 1, 12);
                this.cursorMaterial.mainPass.circleSquishScale = MathUtils.remap(clampedD, 1, 12, 0.5, 1);
            }
        }
        //both hands pinch glow
        if (this.currentAnimationName == exports.HandAnimationsLibrary.Both.TwoHandsPinchScale ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Both.TwoHandsPinchRotateY ||
            this.currentAnimationName == exports.HandAnimationsLibrary.Both.TwoHandsPinchRotateZ) {
            var left_indexTipPos = this.leftIndexTip.getTransform().getWorldPosition();
            var left_thumbTipPos = this.leftThumbTip.getTransform().getWorldPosition();
            var left_distance = left_indexTipPos.distance(left_thumbTipPos);
            if (left_distance < 2 && this.isLeftHandPinching == false) {
                this.left_tipsGlowMaterial.mainPass.glowIntensity = 1.0;
                this.isLeftHandPinching = true;
            }
            else if (left_distance > 3 && this.isLeftHandPinching == true) {
                this.left_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
                this.isLeftHandPinching = false;
            }
            var right_indexTipPos = this.rightIndexTip.getTransform().getWorldPosition();
            var right_thumbTipPos = this.rightThumbTip.getTransform().getWorldPosition();
            var right_distance = right_indexTipPos.distance(right_thumbTipPos);
            if (right_distance < 2 && this.isRightHandPinching == false) {
                this.right_tipsGlowMaterial.mainPass.glowIntensity = 1.0;
                this.isRightHandPinching = true;
            }
            else if (right_distance > 3 && this.isRightHandPinching == true) {
                this.right_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
                this.isRightHandPinching = false;
            }
        }
    }
    initHandMeshMaterials() {
        //clone materials
        //left
        var leftHandRenderMesh = this.leftHandMesh.getComponent("RenderMeshVisual");
        this.left_outlineMaterial = leftHandRenderMesh.getMaterial(0).clone();
        this.left_tipsGlowMaterial = leftHandRenderMesh.getMaterial(1).clone();
        var left_occluderMaterial = leftHandRenderMesh.getMaterial(2).clone();
        leftHandRenderMesh.clearMaterials();
        leftHandRenderMesh.addMaterial(this.left_outlineMaterial);
        leftHandRenderMesh.addMaterial(this.left_tipsGlowMaterial);
        leftHandRenderMesh.addMaterial(left_occluderMaterial);
        this.left_outlineMaterial.mainPass.fadeLevel = 0.0;
        this.left_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
        //right
        var rightHandRenderMesh = this.rightHandMesh.getComponent("RenderMeshVisual");
        this.right_outlineMaterial = rightHandRenderMesh.getMaterial(0).clone();
        this.right_tipsGlowMaterial = rightHandRenderMesh.getMaterial(1).clone();
        var right_occluderMaterial = rightHandRenderMesh.getMaterial(2).clone();
        rightHandRenderMesh.clearMaterials();
        rightHandRenderMesh.addMaterial(this.right_outlineMaterial);
        rightHandRenderMesh.addMaterial(this.right_tipsGlowMaterial);
        rightHandRenderMesh.addMaterial(right_occluderMaterial);
        this.right_outlineMaterial.mainPass.fadeLevel = 0.0;
        this.right_tipsGlowMaterial.mainPass.glowIntensity = 0.0;
    }
    initCursorMaterial() {
        var cursorRenderMesh = this.cursor.getComponent("RenderMeshVisual");
        this.cursorMaterial = cursorRenderMesh.mainMaterial.clone();
        cursorRenderMesh.mainMaterial = this.cursorMaterial;
        this.cursor.enabled = false;
    }
    playClip() {
        if (this.currentClipInSequenceIndex < this.clipsToPlay.length) {
            const clipInfo = this.clipsToPlay[this.currentClipInSequenceIndex];
            this.currentHandMode = clipInfo.handMode;
            this.currentAnimationName = clipInfo.clipName;
            if (this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchFar || this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchFar) {
                this.cursor.enabled = true;
            }
            this.fadeInHand(clipInfo);
            this.animationPlayer.setClipEnabled(clipInfo.clipName, true);
            this.animationPlayer.getClip(clipInfo.clipName).playbackSpeed = this.animationSpeed;
            this.getSceneObject().getTransform().setLocalPosition(clipInfo.position);
            this.animationPlayer.playClipAt(clipInfo.clipName, 0);
            // Get the animation asset to attach the end event
            const animationAsset = this.animationPlayer.getClip(clipInfo.clipName).animation;
            const animationEndEventTimestamp = animationAsset.duration;
            animationAsset.createEvent(ANIMATION_END_EVENT_NAME, animationEndEventTimestamp);
            this.animationPlayerClipEndEvent = this.animationPlayer.onEvent.add(this.onAnimationEnd.bind(this));
        }
    }
    fadeInHand(clipInfo) {
        switch (clipInfo.handMode) {
            case 0:
                //left
                if (!isNull(this.left_outlineFadeTween)) {
                    this.left_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.left_outlineFadeTween);
                }
                this.left_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.left_outlineMaterial.mainPass, "fadeLevel", 0.0, 1.0, 200.0);
                this.left_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.left_outlineFadeTween.onStart(() => {
                    this.leftHandMesh.enabled = true;
                    this.rightHandMesh.enabled = false;
                });
                break;
            case 1:
                //right
                if (!isNull(this.right_outlineFadeTween)) {
                    this.right_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.right_outlineFadeTween);
                }
                this.right_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.right_outlineMaterial.mainPass, "fadeLevel", 0.0, 1.0, 200.0);
                this.right_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.right_outlineFadeTween.onStart(() => {
                    this.leftHandMesh.enabled = false;
                    this.rightHandMesh.enabled = true;
                });
                break;
            case 2:
                //both
                if (!isNull(this.left_outlineFadeTween)) {
                    this.left_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.left_outlineFadeTween);
                }
                this.left_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.left_outlineMaterial.mainPass, "fadeLevel", 0.0, 1.0, 200.0);
                this.left_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.left_outlineFadeTween.onStart(() => {
                    this.leftHandMesh.enabled = true;
                });
                if (!isNull(this.right_outlineFadeTween)) {
                    this.right_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.right_outlineFadeTween);
                }
                this.right_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.right_outlineMaterial.mainPass, "fadeLevel", 0.0, 1.0, 200.0);
                this.right_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.right_outlineFadeTween.onStart(() => {
                    this.rightHandMesh.enabled = true;
                });
                break;
        }
    }
    fadeOutHand() {
        switch (this.currentHandMode) {
            case 0:
                //left
                if (!isNull(this.left_outlineFadeTween)) {
                    this.left_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.left_outlineFadeTween);
                }
                this.left_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.left_outlineMaterial.mainPass, "fadeLevel", 1.0, 0.0, 200.0);
                this.left_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.left_outlineFadeTween.onComplete(() => {
                    this.leftHandMesh.enabled = false;
                });
                if (!isNull(this.current_tween)) {
                    this.current_tween.stop();
                    mainGroup_1.mainGroup.remove(this.current_tween);
                }
                this.current_tween = LSTween_1.LSTween.rawTween(200.0);
                this.current_tween.start();
                return this.current_tween;
            case 1:
                //right
                if (!isNull(this.right_outlineFadeTween)) {
                    this.right_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.right_outlineFadeTween);
                }
                this.right_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.right_outlineMaterial.mainPass, "fadeLevel", 1.0, 0.0, 200.0);
                this.right_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.right_outlineFadeTween.onComplete(() => {
                    this.rightHandMesh.enabled = false;
                });
                if (!isNull(this.current_tween)) {
                    this.current_tween.stop();
                    mainGroup_1.mainGroup.remove(this.current_tween);
                }
                this.current_tween = LSTween_1.LSTween.rawTween(200.0);
                this.current_tween.start();
                return this.current_tween;
            case 2:
                //both
                if (!isNull(this.left_outlineFadeTween)) {
                    this.left_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.left_outlineFadeTween);
                }
                this.left_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.left_outlineMaterial.mainPass, "fadeLevel", 1.0, 0.0, 200.0);
                this.left_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.left_outlineFadeTween.onComplete(() => {
                    this.leftHandMesh.enabled = false;
                });
                if (!isNull(this.right_outlineFadeTween)) {
                    this.right_outlineFadeTween.stop();
                    mainGroup_1.mainGroup.remove(this.right_outlineFadeTween);
                }
                this.right_outlineFadeTween = LSTween_1.LSTween.shaderFloatPropertyFromTo(this.right_outlineMaterial.mainPass, "fadeLevel", 1.0, 0.0, 200.0);
                this.right_outlineFadeTween.easing(Easing_1.default.Cubic.In).start();
                this.right_outlineFadeTween.onComplete(() => {
                    this.rightHandMesh.enabled = false;
                });
                if (!isNull(this.current_tween)) {
                    this.current_tween.stop();
                    mainGroup_1.mainGroup.remove(this.current_tween);
                }
                this.current_tween = LSTween_1.LSTween.rawTween(200.0);
                this.current_tween.start();
                return this.current_tween;
        }
    }
    /*
        example usage:
        this.interactionHintController.playHintAnimation(HandMode.Both, HandAnimationsLibrary.Both.SystemTapExit, 2, 0.8)
        this.interactionHintController.playHintAnimation(HandMode.Left, HandAnimationsLibrary.Left.PinchMoveY, 3)
    */
    playHintAnimation(handMode, animationName, numberOfLoops, animationSpeed = 1) {
        var clipInfo = new HandAnimationClipInfo(handMode, animationName);
        this.clipsToPlay = [];
        this.clipsToPlay.push(clipInfo);
        this.numberOfLoops = numberOfLoops;
        this.animationSpeed = animationSpeed;
        if (this.clipsToPlay.length > 0) {
            this.playClip();
        }
    }
    /*
        example usage:
        var sequence: HandAnimationClipInfo[] = []
        var itemA: HandAnimationClipInfo = new HandAnimationClipInfo(HandMode.Left, HandAnimationsLibrary.Left.PalmGrabY, new vec3(10, 0, 0))
        var itemB: HandAnimationClipInfo = new HandAnimationClipInfo(HandMode.Right, HandAnimationsLibrary.Right.PalmGrabX)
        sequence.push(itemA)
        sequence.push(itemB)
        this.interactionHintController.playHintAnimationSequence(sequence, 2)
    */
    playHintAnimationSequence(sequence, numberOfLoops) {
        this.clipsToPlay = sequence;
        this.numberOfLoops = numberOfLoops;
        if (this.clipsToPlay.length > 0) {
            this.playClip();
        }
    }
    __initialize() {
        super.__initialize();
        this.clipsToPlay = [];
        this.loopsPlayed = 0;
        this.currentClipInSequenceIndex = 0;
        this.isLeftHandPinching = false;
        this.isRightHandPinching = false;
        this.onAnimationEnd = (eventData) => {
            if (eventData.eventName === ANIMATION_END_EVENT_NAME) {
                //if we have only one clip in sequence, loop it
                if (this.clipsToPlay.length == 1) {
                    this.loopsPlayed += 1;
                    if (this.loopsPlayed < this.numberOfLoops) {
                        //play again
                        const clipInfo = this.clipsToPlay[this.currentClipInSequenceIndex];
                        this.getSceneObject().getTransform().setLocalPosition(clipInfo.position);
                        this.animationPlayer.playClipAt(this.currentAnimationName, 0);
                    }
                }
                //if we have a sequence of clips, play clips one after another and then repeat this.numberOfPlaysTimes
                if (this.clipsToPlay.length > 1) {
                    //fade out played clip, fade in next clip
                    this.fadeOutHand().onComplete(() => {
                        //disable played clip and remove end event
                        this.animationPlayer.setClipEnabled(this.currentAnimationName, false);
                        this.animationPlayer.onEvent.remove(this.animationPlayerClipEndEvent);
                        //if we have loops to play 
                        if (this.loopsPlayed < this.numberOfLoops) {
                            this.currentClipInSequenceIndex += 1;
                            //prepare next clip
                            const clipInfo = this.clipsToPlay[this.currentClipInSequenceIndex];
                            this.currentHandMode = clipInfo.handMode;
                            this.currentAnimationName = clipInfo.clipName;
                            // Get the animation asset to attach the end event
                            const animationAsset = this.animationPlayer.getClip(clipInfo.clipName).animation;
                            const animationEndEventTimestamp = animationAsset.duration;
                            animationAsset.createEvent(ANIMATION_END_EVENT_NAME, animationEndEventTimestamp);
                            this.animationPlayerClipEndEvent = this.animationPlayer.onEvent.add(this.onAnimationEnd.bind(this));
                            //cursor
                            if (this.currentAnimationName == exports.HandAnimationsLibrary.Left.PinchFar || this.currentAnimationName == exports.HandAnimationsLibrary.Right.PinchFar) {
                                this.cursor.enabled = true;
                            }
                            else {
                                this.cursor.enabled = false;
                            }
                            this.fadeInHand(clipInfo);
                            this.animationPlayer.setClipEnabled(clipInfo.clipName, true);
                            this.animationPlayer.getClip(clipInfo.clipName).playbackSpeed = this.animationSpeed;
                            this.getSceneObject().getTransform().setLocalPosition(clipInfo.position);
                            this.animationPlayer.playClipAt(clipInfo.clipName, 0);
                            //if full sequence has played, increase loopsPlayer count and reset sequence index
                            if (this.currentClipInSequenceIndex == this.clipsToPlay.length - 1) {
                                this.loopsPlayed += 1;
                                this.currentClipInSequenceIndex -= this.clipsToPlay.length;
                            }
                        }
                    });
                }
                if (this.loopsPlayed == this.numberOfLoops) {
                    //played last time, fade out then disable clip
                    this.fadeOutHand().onComplete(() => {
                        if (!isNull(this.animationEndEvent)) {
                            this.animationEndEvent.reset(0);
                        }
                        this.animationPlayer.setClipEnabled(this.currentAnimationName, false);
                        this.animationPlayer.onEvent.remove(this.animationPlayerClipEndEvent);
                        this.animationEndEvent = null;
                        this.loopsPlayed = 0;
                    });
                    //cursor
                    if (this.cursor.enabled == true) {
                        this.cursor.enabled = false;
                    }
                }
            }
        };
    }
};
exports.InteractionHintController = InteractionHintController;
exports.InteractionHintController = InteractionHintController = __decorate([
    component
], InteractionHintController);
class HandAnimationClipInfo {
    constructor(handMode, clipName, position = vec3.zero()) {
        this.handMode = handMode;
        this.clipName = clipName;
        this.position = position;
    }
}
exports.HandAnimationClipInfo = HandAnimationClipInfo;
var HandMode;
(function (HandMode) {
    HandMode[HandMode["Left"] = 0] = "Left";
    HandMode[HandMode["Right"] = 1] = "Right";
    HandMode[HandMode["Both"] = 2] = "Both";
})(HandMode || (exports.HandMode = HandMode = {}));
exports.HandAnimationsLibrary = {
    Left: {
        PinchNear: "pinch_near",
        PinchFar: "pinch_far",
        PinchMoveX: "pinch_move_x",
        PinchMoveY: "pinch_move_y",
        PinchMoveZ: "pinch_move_z",
        PinchRotateX: "pinch_rotate_x",
        PinchRotateY: "pinch_rotate_y",
        PinchRotateZ: "pinch_rotate_z",
        PinchSwipeX: "pinch_swipe_x",
        PinchSwipeY: "pinch_swipe_y",
        FingerTapNear: "finger_tap_near",
        FingerTapSurface: "finger_tap_surface",
        FingerSwipeX: "finger_swipe_x",
        FingerSwipeY: "finger_swipe_y",
        FingerScrollMirco: "finger_scroll_micro",
        PalmTouchNear: "palm_touch_near",
        PalmTouchSurface: "palm_touch_surface",
        PalmSwipeX: "palm_swipe_x",
        PalmGrabX: "palm_grab_x",
        PalmGrabY: "palm_grab_y"
    },
    Right: {
        PinchNear: "pinch_near",
        PinchFar: "pinch_far",
        PinchMoveX: "pinch_move_x",
        PinchMoveY: "pinch_move_y",
        PinchMoveZ: "pinch_move_z",
        PinchRotateX: "pinch_rotate_x",
        PinchRotateY: "pinch_rotate_y",
        PinchRotateZ: "pinch_rotate_z",
        PinchSwipeX: "pinch_swipe_x",
        PinchSwipeY: "pinch_swipe_y",
        FingerTapNear: "finger_tap_near",
        FingerTapSurface: "finger_tap_surface",
        FingerSwipeX: "finger_swipe_x",
        FingerSwipeY: "finger_swipe_y",
        FingerScrollMirco: "finger_scroll_micro",
        PalmTouchNear: "palm_touch_near",
        PalmTouchSurface: "palm_touch_surface",
        PalmSwipeX: "palm_swipe_x",
        PalmGrabX: "palm_grab_x",
        PalmGrabY: "palm_grab_y"
    },
    Both: {
        SystemTapSettings: "system_tap_settings",
        SystemTapRotateDown: "system_tap_rotate_down",
        SystemTapRotateUp: "system_tap_rotate_up",
        SystemTapWatch: "system_tap_watch",
        SystemTapExit: "system_tap_exit",
        TwoHandsPinchScale: "two_hands_pinch_scale",
        TwoHandsPinchRotateY: "two_hands_pinch_rotate_y",
        TwoHandsPinchRotateZ: "two_hands_pinch_rotate_z",
        TwoHandsPalmGrabX: "two_hands_palm_grab_x",
        TwoHandsPalmGrabY: "two_hands_palm_grab_y"
    }
};
//# sourceMappingURL=InteractionHintController.js.map