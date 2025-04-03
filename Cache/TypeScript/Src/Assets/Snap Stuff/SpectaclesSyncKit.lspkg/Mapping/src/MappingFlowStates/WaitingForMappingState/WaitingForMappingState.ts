import {SessionController} from "../../../../Core/SessionController"
import StateMachine from "../../../../SpectaclesInteractionKit/Utils/StateMachine"
import {TextValues} from "../../Texts/TextValues"
import {WaitingForMappingStateInput} from "./WaitingForMappingStateInput"

export class WaitingForMappingState {
  constructor(
    private readonly input: WaitingForMappingStateInput,
    stateMashine: StateMachine
  ) {
    input.root.enabled = false
  }

  enter() {
    this.input.waitingText.text = TextValues.WAITING_FOR_MAPPING.replace(
      TextValues.P1,
      SessionController.getInstance().getHostUserName()
    )
    this.input.root.enabled = true
  }

  exit() {
    this.input.root.enabled = false
  }
}
