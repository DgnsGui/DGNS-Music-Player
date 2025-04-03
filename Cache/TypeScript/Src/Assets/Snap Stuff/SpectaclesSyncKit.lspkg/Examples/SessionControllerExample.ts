import {SessionController} from "../Core/SessionController"
import {SyncKitLogger} from "../Utils/SyncKitLogger"

@component
export class SessionControllerExample extends BaseScriptComponent {
  private readonly log: SyncKitLogger = new SyncKitLogger(
    SessionControllerExample.name
  )

  onAwake() {
    let sessionController: SessionController = SessionController.getInstance()

    sessionController.notifyOnReady(() => this.onReady())
  }

  onReady() {
    this.log.i("Example Component: The session controller is ready!")
  }
}
