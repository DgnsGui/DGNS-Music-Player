import NativeLogger from "../SpectaclesInteractionKit/Utils/NativeLogger"
import SyncKitLogLevelProvider from "./SyncKitLogLevelProvider"

/**
 * @name Text Logger Component
 * @description Logs text to a text component
 */

export class SyncKitLogger extends NativeLogger {
  constructor(tag: string) {
    super(tag, SyncKitLogLevelProvider.getInstance())
  }
}
