import {SessionController} from "../Core/SessionController"
import {PinchButton} from "../SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton"
import WorldCameraFinderProvider from "../SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider"
import {SyncKitLogger} from "./SyncKitLogger"

const TAG = "StartMenu"

@component
export class StartMenu extends BaseScriptComponent {
  @input
  private readonly singlePlayerButton: PinchButton

  @input
  private readonly multiPlayerButton: PinchButton

  @input("float", "150.0")
  private readonly startMenuDistanceFromUser: number

  @input("string", "manual")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Manual", "manual"),
      new ComboBoxItem("Mocked Online (Automatic)", "mocked_online"),
    ])
  )
  private readonly singlePlayerType: "manual" | "mocked_online" = "manual"

  @input
  private readonly enableOnSingleplayerNodes: SceneObject[]

  private worldCamera: WorldCameraFinderProvider

  private startMenuTransform: Transform

  private readonly log = new SyncKitLogger(TAG)

  constructor() {
    super()
    this.worldCamera = WorldCameraFinderProvider.getInstance()
    this.startMenuTransform = this.sceneObject.getTransform()

    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart() {
    // Re-enable the start menu if the connection fails
    SessionController.getInstance().onConnectionFailed.add(() => {
      this.getSceneObject().enabled = true
      this.setStartMenuInFrontOfUser()
    })

    // Skip the start menu if the lens was launched directly as multiplayer
    this.checkIfStartedAsMultiplayer()

    this.setStartMenuInFrontOfUser()
    this.singlePlayerButton.onButtonPinched.add(() =>
      this.onSinglePlayerPress()
    )
    this.multiPlayerButton.onButtonPinched.add(() =>
      this.startMultiplayerSession()
    )
  }

  /**
   * If the systemUI has requested that the lens launch directly into multiplayer mode,
   * immediately dismiss this menu and initialize the Spectacles Sync Kit.
   */
  private checkIfStartedAsMultiplayer() {
    const shouldStartMultiplayer =
      global.launchParams.getBool("StartMultiplayer")
    this.log.i(`Lens started as multiplayer: ${shouldStartMultiplayer}`)
    if (shouldStartMultiplayer) {
      this.startMultiplayerSession()
    }
  }

  /**
   * Start the game in single player mode by hiding this menu.
   */
  private onSinglePlayerPress() {
    switch (this.singlePlayerType) {
      case "manual":
      default:
        this.enableOnSingleplayerNodes.forEach((node) => {
          node.enabled = true
        })

        this.getSceneObject().enabled = false
        break

      case "mocked_online":
        SessionController.getInstance().prepareOfflineMode()

        this.enableOnSingleplayerNodes.forEach((node) => {
          node.enabled = true
        })

        this.startMultiplayerSession()
        break
    }
  }

  /**
   * Start the session by initializing the Spectacles Sync Kit, and hiding this menu.
   */
  private startMultiplayerSession() {
    this.log.i("Starting session")
    this.getSceneObject().enabled = false
    SessionController.getInstance().init()
  }

  private setStartMenuInFrontOfUser() {
    const head = this.worldCamera.getTransform().getWorldPosition()
    const forward = this.worldCamera.getTransform().forward
    forward.y = 0
    const pos = forward
      .normalize()
      .uniformScale(-this.startMenuDistanceFromUser)
    this.startMenuTransform.setWorldPosition(head.add(pos))

    this.startMenuTransform.setWorldRotation(
      quat.lookAt(pos.uniformScale(-1), vec3.up())
    )
  }
}
