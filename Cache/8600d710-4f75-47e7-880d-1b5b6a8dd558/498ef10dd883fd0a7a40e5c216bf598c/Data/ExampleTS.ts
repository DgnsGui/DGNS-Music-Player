import { HandAnimationClipInfo, HandAnimationsLibrary, HandMode, InteractionHintController } from "./InteractionHintController"

@component
export class Example extends BaseScriptComponent 
{
    @input
    interactionHintController: InteractionHintController

    @input('int')
    @widget(
        new ComboBoxWidget([
            new ComboBoxItem('Demo Single Animation', 0), 
            new ComboBoxItem('Demo Animation Sequence', 1)
        ])
    )
    demoOption: number = 0

    onAwake() 
    {
        switch(this.demoOption)
        {
            case 0:
                //play a single animation
                this.interactionHintController.playHintAnimation(HandMode.Both, HandAnimationsLibrary.Both.SystemTapExit, 2, 0.8)
                this.interactionHintController.animationEndEvent.bind(() => 
                {
                    this.interactionHintController.playHintAnimation(HandMode.Left, HandAnimationsLibrary.Left.PinchMoveY, 3)
                })
                break
            case 1:
                //play sequence
                var sequence: HandAnimationClipInfo[] = []
                var itemA: HandAnimationClipInfo = new HandAnimationClipInfo(HandMode.Left, HandAnimationsLibrary.Left.PalmGrabY, new vec3(10, 0, 0))
                var itemB: HandAnimationClipInfo = new HandAnimationClipInfo(HandMode.Right, HandAnimationsLibrary.Right.PalmGrabX)
                sequence.push(itemA)
                sequence.push(itemB)
                this.interactionHintController.playHintAnimationSequence(sequence, 2)

                this.interactionHintController.animationEndEvent.bind(() => 
                {
                    print("Sequence looping completed")
                })
                break
        }
    }
}
