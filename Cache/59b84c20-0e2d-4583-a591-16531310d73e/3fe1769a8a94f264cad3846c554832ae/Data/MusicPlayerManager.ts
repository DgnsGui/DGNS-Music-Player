class MusicPlayerManager {
    private trackStartTime: number; // Declare the trackStartTime property
    
    constructor() {
        this.trackStartTime = 0; // Initialize trackStartTime to 0
    }

    // Method to set the track start time
    setTrackStartTime(time: number): void {
        this.trackStartTime = time; // Update the trackStartTime
    }

    // Method to get the track start time
    getTrackStartTime(): number {
        return this.trackStartTime; // Return the current track start time
    }

    // Method to simulate playing music (just for demonstration)
    startTrack() {
        console.log(`Track started at ${this.trackStartTime} seconds.`);
    }

    // Method to simulate stopping music
    stopTrack() {
        console.log(`Track stopped at ${this.trackStartTime} seconds.`);
    }

    // Method to reset the track start time to 0
    resetTrack() {
        this.trackStartTime = 0;
        console.log("Track has been reset.");
    }

    // Additional method to simulate playing for a specific duration
    playFor(duration: number) {
        console.log(`Playing for ${duration} seconds.`);
        this.trackStartTime += duration; // Simulate the time passed during playback
    }
}

// Example usage
const musicPlayerManager = new MusicPlayerManager();

// Set the start time of the track
musicPlayerManager.setTrackStartTime(10); // Set start time to 10 seconds
console.log(`Current track start time: ${musicPlayerManager.getTrackStartTime()} seconds.`); // Output: 10

// Start playing the track
musicPlayerManager.startTrack();

// Simulate playing for 5 seconds
musicPlayerManager.playFor(5);

// Simulate stopping the track
musicPlayerManager.stopTrack();

// Reset the track (simulate resetting the track to start from 0)
musicPlayerManager.resetTrack();

// Verify the reset
console.log(`Current track start time after reset: ${musicPlayerManager.getTrackStartTime()} seconds.`); // Output: 0
