import {Singleton} from "../SpectaclesInteractionKit/Decorators/Singleton"
import LogLevelProvider from "../SpectaclesInteractionKit/Providers/InteractionConfigurationProvider/LogLevelProvider"

/**
 * Provides the level of logging that we want to allow from Spectacles Sync Kit types.
 */
@Singleton
export default class SyncKitLogLevelProvider extends LogLevelProvider {
  public static getInstance: () => SyncKitLogLevelProvider

  constructor() {
    super()
  }
}
