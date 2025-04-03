// The key problematic method is playTrack() - here's the fixed version:

private playTrack(): void {
    if (!this.isPlaying && this.audioComponent && this.audioComponent.audioTrack && this.audioInitialized) {
        try {
            // PROBLÈME PRINCIPAL: On ne peut pas utiliser currentTime pour positionner l'audio dans Snap
            // On va donc gérer la lecture depuis le début à chaque fois et ignorer les temps de pause
            
            // Toujours stopper la lecture actuelle pour réinitialiser l'état
            this.audioComponent.stop(true);
            
            // Démarrer la lecture
            this.audioComponent.play(1);
            this.isPlaying = true;
            
            // Réinitialiser le temps de départ pour le suivi
            this.trackStartTime = getTime();
            
            // Si on reprend après une pause, notifier dans le log
            if (this.currentPlaybackTime > 0) {
                print("Restarting track from the beginning (was paused at " + 
                      this.formatTime(this.currentPlaybackTime) + ")");
                // Reset the stored playback time since we're starting from the beginning
                this.currentPlaybackTime = 0;
            } else {
                print("Playing track: " + this.titles[this.currentTrackIndex]);
            }
        } catch (e) {
            print("Error playing track: " + e);
            
            // Recovery attempt
            this.delayedCall(0.3, () => {
                try {
                    this.audioComponent.stop(true);
                    this.audioComponent.play(1);
                    this.isPlaying = true;
                    this.trackStartTime = getTime();
                } catch (e2) {
                    print("Second attempt failed: " + e2);
                }
            });
        }
    } else if (!this.audioInitialized) {
        print("Cannot play track: Audio not yet initialized");
    }
}