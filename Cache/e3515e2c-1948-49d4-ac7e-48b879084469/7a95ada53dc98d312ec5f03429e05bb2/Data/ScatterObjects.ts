import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';

@component
export class ObjectSpawner extends BaseScriptComponent {
    
    @input
    pinchButton: PinchButton;

    @input
    object1: SceneObject;

    @input
    object2: SceneObject;

    @input
    object3: SceneObject;

    @input
    object4: SceneObject;

    @input
    object5: SceneObject;

    @input('Component.Text')
    bpmText: Text;

    @input
    camera: SceneObject;

    @input
    @hint("Number of grid points along width (X-axis)")
    gridWidth: number = 20;

    @input
    @hint("Number of grid points along depth (Z-axis)")
    gridDepth: number = 20;

    @input
    @hint("Distance between grid points (meters)")
    gridSpacing: number = 1.5;

    @input
    @hint("Distance from camera to grid start (meters)")
    distanceFromCamera: number = 5.0;

    @input
    @hint("Height of grid above ground (meters, assuming y=0 is ground)")
    gridHeight: number = 0.0;

    private isObjectsVisible: boolean = false;
    private objects: SceneObject[] = [];
    private animationProgress: number = 0;
    private animationDuration: number = 0;
    private lastUpdateTime: number = 0;

    onAwake() {
        this.objects = [this.object1, this.object2, this.object3, this.object4, this.object5];
        this.hideAllObjects();
        this.pinchButton.onButtonPinched.add(() => {
            this.toggleObjects();
        });
        this.createEvent('UpdateEvent').bind(() => {
            this.updateAnimation();
        });
    }

    private toggleObjects() {
        this.isObjectsVisible = !this.isObjectsVisible;
        if (this.isObjectsVisible) {
            this.showObjects();
        } else {
            this.hideAllObjects();
        }
    }

    private showObjects() {
        const bpm = parseFloat(this.bpmText.text) || 120;
        this.animationDuration = 60 / bpm;
        this.animationProgress = 0;

        if (!this.camera) {
            print("Camera not assigned in Inspector!");
            return;
        }

        const cameraTransform = this.camera.getTransform();
        const cameraPos = cameraTransform.getWorldPosition();
        const cameraForward = cameraTransform.forward.normalize();
        const cameraRight = cameraTransform.right.normalize();
        const cameraUp = cameraTransform.up.normalize();

        print(`Camera Position: ${cameraPos.x}, ${cameraPos.y}, ${cameraPos.z}`);
        print(`Camera Forward: ${cameraForward.x}, ${cameraForward.y}, ${cameraForward.z}`);

        // Grid starts distanceFromCamera in front of the user
        const gridStart = cameraPos.add(cameraForward.uniformScale(this.distanceFromCamera));
        const totalWidth = (this.gridWidth - 1) * this.gridSpacing;
        const startX = -totalWidth / 2;

        print(`Grid Start: ${gridStart.x}, ${gridStart.y}, ${gridStart.z}`);

        // Spread 5 objects across the grid (e.g., along one row or diagonally)
        let objectIndex = 0;
        const maxObjects = this.objects.length;
        for (let i = 0; i < this.gridWidth && objectIndex < maxObjects; i++) {
            for (let j = 0; j < this.gridDepth && objectIndex < maxObjects; j++) {
                const obj = this.objects[objectIndex];
                if (obj) {
                    const xOffset = startX + i * this.gridSpacing;
                    const zOffset = j * this.gridSpacing;

                    const lateralOffset = cameraRight.uniformScale(xOffset);
                    const depthOffset = cameraForward.uniformScale(zOffset);
                    const spawnPosition = gridStart.add(lateralOffset).add(depthOffset);
                    // Set y to gridHeight (ground level or custom height)
                    spawnPosition.y = this.gridHeight;

                    print(`Spawning Object ${objectIndex} at: ${spawnPosition.x}, ${spawnPosition.y}, ${spawnPosition.z}`);

                    const transform = obj.getTransform();
                    transform.setWorldPosition(spawnPosition);

                    const direction = cameraPos.sub(spawnPosition).normalize();
                    const rotation = quat.lookAt(direction, vec3.up());
                    transform.setWorldRotation(rotation);

                    transform.setLocalScale(new vec3(0.1, 0.1, 0.1));
                    obj.enabled = true;

                    objectIndex++;
                }
            }
        }
    }

    private hideAllObjects() {
        this.objects.forEach((obj) => {
            if (obj) {
                obj.enabled = false;
            }
        });
    }

    private updateAnimation() {
        if (!this.isObjectsVisible || this.animationProgress >= 1) {
            return;
        }

        const currentTime = getTime();
        const deltaTime = currentTime - (this.lastUpdateTime || currentTime);
        this.lastUpdateTime = currentTime;

        this.animationProgress += deltaTime / this.animationDuration;
        this.animationProgress = Math.min(this.animationProgress, 1);

        const scale = 0.1 + (this.animationProgress * 0.9);

        this.objects.forEach((obj) => {
            if (obj && obj.enabled) {
                obj.getTransform().setLocalScale(new vec3(scale, scale, scale));
            }
        });
    }
}