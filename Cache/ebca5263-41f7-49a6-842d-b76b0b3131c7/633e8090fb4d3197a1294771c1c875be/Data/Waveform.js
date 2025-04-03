// @input Component.AudioComponent audio
// @input Component.MaterialMeshVisual waveformMesh

//@input float waveformHeight = 1.0
//@input float waveformWidth = 2.0
//@input int samplesCount = 64

var script = this;

// Fonction pour créer la waveform
function createWaveform() {
    // Vérifier si l'audio est assigné
    if (!script.audio) {
        print("Erreur : Aucun AudioComponent assigné");
        return;
    }

    // Récupérer l'AudioTrackAsset
    var audioTrack = script.audio.audioTrack;
    if (!audioTrack) {
        print("Erreur : Aucun AudioTrackAsset assigné");
        return;
    }

    // Créer un tableau pour stocker les données de la waveform
    var waveformData = [];
    var samplesCount = script.samplesCount;

    // Générer des données de sample aléatoires (simulation)
    for (var i = 0; i < samplesCount; i++) {
        // Générer une valeur entre -1 et 1 pour simuler l'amplitude
        waveformData.push(Math.sin(i * 0.5) * Math.random());
    }

    // Créer la géométrie de la waveform
    var vertices = [];
    var indices = [];

    var width = script.waveformWidth;
    var height = script.waveformHeight;

    for (var i = 0; i < samplesCount; i++) {
        var x = (i / (samplesCount - 1)) * width - (width / 2);
        var y = waveformData[i] * height;

        // Ajouter les sommets
        vertices.push(x, y, 0);

        // Créer les indices pour dessiner les lignes
        if (i < samplesCount - 1) {
            indices.push(i, i + 1);
        }
    }

    // Mettre à jour la géométrie du mesh
    if (script.waveformMesh) {
        script.waveformMesh.mesh.setVertices(vertices);
        script.waveformMesh.mesh.setIndices(indices);
    }
}

// Mettre à jour la waveform en temps réel
function updateWaveform() {
    if (script.audio && script.audio.isPlaying()) {
        createWaveform();
    }
}

// Événements
script.audio.setOnStart(function() {
    createWaveform();
});

script.audio.setOnFinish(function() {
    // Réinitialiser ou masquer la waveform
    if (script.waveformMesh) {
        script.waveformMesh.mesh.clear();
    }
});

// Mettre à jour la waveform périodiquement pendant la lecture
script.createEvent("UpdateEvent").bind(updateWaveform);