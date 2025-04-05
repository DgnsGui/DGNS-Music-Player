# DGNS Music Player for Spectacles

Welcome to the DGNS Music Player - the very first open-source music player designed specifically for **Snap Spectacles**, built using **Lens Studio**.

This project allows users to experience music playback directly within their Spectacles environment, offering multiple visual styles and the ability to load custom tracks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![Alt text](https://s6.gifyu.com/images/bMqSw.gif)
## Features

*   Playback of local (`AudioTrackAsset`) and remote (`RemoteReferenceAsset`) audio files.
*   Multiple interchangeable player skins:
    *   **Y2K Skin:** A retro-inspired interface.
    *   **Modern Skin:** A sleek, contemporary look.
    *   **Hand Skin:** Integrates the player controls directly onto the user's hand tracking.
*   Basic playback controls: Play/Pause, Next Track, Previous Track, Stop, Shuffle Toggle, Repeat Toggle.
*   Visual feedback: Displays Artist Name, Track Title, Timecode, and an animated progress indicator.
*   Skin switching functionality controlled by UI buttons within the Lens.
*   Open-source: Feel free to inspect, modify, and contribute!

![Alt text](https://s6.gifyu.com/images/bMqSa.gif)

## Core Components

The player functions primarily through two main scripts:

1.  **`MusicPlayerManager.ts` (TypeScript):**
    *   Handles all core audio playback logic for a specific player instance (Y2K, Modern, or Hand).
    *   Manages the list of local and remote tracks, including their metadata (artist, title) and associated visual prefabs.
    *   Controls playback state (playing, paused, stopped).
    *   Processes user interactions with playback buttons (play, next, previous, etc.) using the Spectacles Interaction Kit (`PinchButton`).
    *   Updates the UI elements (Text components, progress bar visualization).
    *   Handles track loading, downloading (for remote assets), and transitions between tracks (including looping, shuffle, and auto-advance).
    *   **Note:** Each skin (Y2K, Modern, Hand) has its *own* `MusicPlayerManager` object in the Scene Hierarchy (`PlayerManagers` folder) that needs to be configured independently if you want the same songs available on all skins.

2.  **`PlayerSkinManager.js` (JavaScript):**
    *   Manages the activation and deactivation of the different player "skin" prefabs (Y2K, Modern, Hand) and their corresponding `MusicPlayerManager` objects.
    *   Handles the logic for the "Skin Switch" buttons present on the Y2K and Modern skins, and the "Back" button on the Hand skin.
    *   Ensures only one skin is active at a time and stops audio playback on the deactivated skin's manager.
    *   Includes a simple Welcome/Acknowledgement screen on first launch.
    *   Uses a delayed binding mechanism to attach button listeners only *after* a skin becomes active, aiming to prevent initialization issues.

## Getting Started

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/DgnsGui/DGNS-Music-Player.git
    ```
    ⚠️Make sure you have GitLFS (Large File Storage)⚠️
    
3.  **Open in Lens Studio:** Launch Lens Studio and open the cloned project folder.

## Adding Your Own Music (V1 Method)

You can load your own music tracks into the player. Follow these steps **for each** player skin you want the music to be available on (Y2K, Modern, Hand):
1.  **Navigate Hierarchy:** In the `Scene Hierarchy` panel, expand the `PlayerManagers (PUT YOUR SONGS HERE)` object.
2.  **Select Manager:** Click on one of the manager objects (e.g., `MusicPlayerManagerY2K`).
![Alt text](https://iili.io/37oLejV.md.png)
3.  **Inspect Script:** In the `Inspector` panel, find the `MusicPlayerManager` (Script) component.

4.  **Add Track Asset:**
    *   **Local Tracks:** Find the `Local Tracks` array. Click `+ Add Value`. Drag your `.mp3` audio file from the `Asset Browser` into the new `Value` slot.
    *   **Remote Tracks:** Find the `Remote Tracks` array. Click `+ Add Value`. Create or assign a `RemoteReferenceAsset` pointing to your remotely hosted audio file in the new `Value` slot.
![Alt text](https://iili.io/37otU67.png)
![Alt text](https://iili.io/37obMdX.png)

5.  **Add Artist Name:** Find the corresponding `Local Artists` or `Remote Artists` array. Click `+ Add Value`. Type the artist's name into the text field. **Make sure this new entry has the same index number (Value 0, Value 1, etc.) as the track you just added.**

6.  **Add Track Title:** Find the corresponding `Local Titles` or `Remote Titles` array. Click `+ Add Value`. Type the track's title into the text field. **Ensure the index matches the track and artist.**

7.  **Assign Screen Prefab:** Find the corresponding `Local Track Prefabs` or `Remote Track Prefabs` array. Click `+ Add Value`. You need to assign a visual "Screen" prefab here (this usually contains the album art display). See the section below on managing Screen Prefabs. **Ensure the index matches the track, artist, and title.**
![Alt text](https://iili.io/37ombP2.png)

8.  **Repeat for Other Skins:** If you want the same track available on the Modern and Hand skins, select `MusicPlayerManagerModern` and `MusicPlayerManagerHand` in the `Scene Hierarchy` and repeat steps 4-7 for each of them.

⚠️Music Player Hand is under Spectacles Interaction Kit Left Hand!⚠️

### Managing Screen Prefabs

Each track needs a `SceneObject` prefab assigned in the `Track Prefabs` array. These prefabs represent the visual screen area of the player, displaying album art and a GLSL shader background.

*   **Location:** You can find the existing screen prefabs under the different player skin objects in the `Scene Hierarchy` (e.g., expand `MusicPlayerY2K`, look for objects named `MusicPlayerScreen0`, `MusicPlayerScreen1`, etc.)
*   **Adding More:** If you add more tracks than there are existing screen prefabs, you can easily duplicate one:
    1.  In the `Scene Hierarchy`, find an existing screen prefab under one of the player objects (like `MusicPlayerScreen0` under `MusicPlayerY2K`).
    2.  Right-click on it and select `Duplicate`.
    3.  (Optional) Rename the duplicated object for clarity (e.g., `MusicPlayerScreen9`).
    4.  Go back to the `MusicPlayerManager` component in the `Inspector` where you were adding your track.
    5.  Drag the newly duplicated screen prefab from the `Scene Hierarchy` into the corresponding empty `Value` slot in the `Local Track Prefabs` or `Remote Track Prefabs` array.

## Limitations & Future Development

*   **Manual Music Loading:** We acknowledge that the current method of adding music by editing multiple Manager components in the Inspector is not the most user-friendly (especially needing to repeat it for each skin). This is a limitation of V1.
*   **Lens Size Limits:** Remember that Snapchat Lenses have size constraints. Currently, this is typically around **25MB for local assets** bundled within the Lens, plus an additional **25MB allowance for remote assets** that are downloaded on demand. Consider using Remote Assets if your music library exceeds the local limit.
*   **Future Plans:** We are actively exploring ways to implement a more streamlined, friction-less process for users to add their music in future versions.

## Contributing

Contributions are welcome! If you have ideas for improvements, bug fixes, or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
