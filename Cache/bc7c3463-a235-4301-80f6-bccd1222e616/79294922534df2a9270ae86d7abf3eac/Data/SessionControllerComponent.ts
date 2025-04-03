import {SyncKitLogger} from "../Utils/SyncKitLogger"
import {VersionNumber} from "../VersionNumber"
import {SessionController} from "./SessionController"

const TAG = "SessionControllerComponent"

@component
export class SessionControllerComponent extends BaseScriptComponent {
  private log = new SyncKitLogger(TAG)

  @input
  private readonly connectedLensModule: ConnectedLensModule

  @input
  private readonly locationCloudStorageModule: LocationCloudStorageModule

  @input("boolean", "false")
  @label("Skip UI in Lens Studio")
  private readonly skipUiInStudio: boolean = false

  @input("boolean", "true")
  private readonly isColocated: boolean = false

  @ui.group_start("Colocation")
  @showIf("isColocated")
  @input
  private readonly locatedAtComponent: LocatedAtComponent

  @input
  private readonly landmarksVisual3d: RenderMeshVisual

  @ui.group_end
  private onAwake() {
    this.log.i(`Using Spectacles Sync Kit version ${VersionNumber}`)

    SessionController.getInstance().configure(
      this,
      this.connectedLensModule,
      this.locationCloudStorageModule,
      this.skipUiInStudio,
      this.isColocated,
      this.locatedAtComponent,
      this.landmarksVisual3d
    )
  }
}
