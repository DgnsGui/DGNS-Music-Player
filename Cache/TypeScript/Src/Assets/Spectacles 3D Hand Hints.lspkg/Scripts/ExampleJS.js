//@input Component.ScriptComponent interactionHintController
//@input int demoOption {"widget":"combobox", "values":[{"label":"Demo Single Animation", "value": 0}, {"label":"Demo Animation Sequence", "value":1}]}

const InteractionHintModule = require("InteractionHintController")
const { HandAnimationClipInfo, HandAnimationsLibrary, HandMode, InteractionHintController } = InteractionHintModule

script.createEvent("OnStartEvent").bind(onStart)

function onStart()
{
    switch(script.demoOption)
    {
        case 0:
            //play a single animation
            script.interactionHintController.playHintAnimation(HandMode.Both, HandAnimationsLibrary.Both.SystemTapExit, 2, 0.8)
            script.interactionHintController.animationEndEvent.bind(() => 
            {
                script.interactionHintController.playHintAnimation(HandMode.Left, HandAnimationsLibrary.Left.PinchMoveY, 3)
            })
            break
        case 1:
            //play sequence
            var sequence = []
            var itemA = new HandAnimationClipInfo(HandMode.Left, HandAnimationsLibrary.Left.PalmGrabY, new vec3(10, 0, 0))
            var itemB = new HandAnimationClipInfo(HandMode.Right, HandAnimationsLibrary.Right.PalmGrabX)
            sequence.push(itemA)
            sequence.push(itemB)
            script.interactionHintController.playHintAnimationSequence(sequence, 2)

            script.interactionHintController.animationEndEvent.bind(() => 
            {
                print("Sequence looping completed")
            })
            break
    }
}