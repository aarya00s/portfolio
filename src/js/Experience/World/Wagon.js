import * as THREE from 'three';
import Experience from '../Experience.js';
import bakedVertexShader from './shaders/baked/vertex.js'; // Adjust the path as necessary
import bakedFragmentShader from './shaders/baked/fragment.js'; // Adjust the path as necessary

// import Fireflies from './Fireflies.js';

export default class Wagon {
    constructor(_options) {

        this.experience = new Experience();
        this.resources = this.experience.resources;
        this.config = this.experience.config;
        this.scene = this.experience.scene;
        this.time = this.experience.time;
        this.clock = new THREE.Clock();
        this.sizes = this.experience.sizes;
        this.rowRotationAngle = 0; // Current rotation angle
        this.rowRotationSpeed = 0.02; // Speed of rotation, adjust as needed
        this.maxRowRotation = THREE.MathUtils.degToRad(30);
        // this.fireflies = new Fireflies();
        // this.scene.add(this.fireflies.model.points); 
        this.currentModelName = "";
        this.addModel();
        this.isFreeMoving = false;

        this.boatProgress = 0;
        this.horizontalProgress = 0;
        this.verticalProgress = 0;
        this.maxBounds = { minX: -800, maxX: 800, minZ: -800, maxZ: 800 };
        this.textMap = {
            'Gate1': "Welcome aboard! Press 'M' or interact with the control panel above For a hidden surprise, try clicking around the bottom of the screen to discover and use the joystick for navigation. Enjoy the voyage!",
            'Gate2': "Proficient in Python, C++, C, Java, JavaScript, and more.",
            "INDIA": "Completed internships as a Full Stack Engineer and Front-End Intern in India.",
            "trinity": "Recently graduated from Trinity College with a Bachelor's in Engineering."
        }; // Initialize a progress variable to control movement along the path.
    }
    addModel() {
        this.models = {};
        const modelNames = [
            "boat",
            "Gate1",
            "Gate2",
            "row1",
            "row2",
            "INDIA",
            "trinity"
        ];
        // Manually mapping model names to texture packs
        const textureMap = {
            "boat": "wagonTexturePack1",
            "Gate1": "wagonTexturePack2",
            "Gate2": "wagonTexturePack3",
            "row1": "wagonTexturePack1",
            "row2": "wagonTexturePack1",
            "INDIA": "wagonTexturePack4",
            "trinity": "wagonTexturePack5"
            // "book": "wagonTexturePack2",
            // "island": "wagonTexturePack3",
            // "lectern": "wagonTexturePack3",
            // "natural_arch":"wagonTexturePack3",
            // "Lotus":"wagonTexturePack6",
            // "Lotus001":"wagonTexturePack6",
            // "Lotus002":"wagonTexturePack6",
            // "Lotus003":"wagonTexturePack6",
            // "Lotus004":"wagonTexturePack6",
            // "Torii_Mesh":"wagonTexturePack4",
            // "Cube":"wagonTexturePack1",
            // "Cube001":"wagonTexturePack8",
            // "Cube002":"wagonTexturePack8"
        };
        modelNames.forEach(name => {
            const model = this.resources.items.wagonModel.scene.children.find((child) => child.name === name);
            if (!model) {
                console.error(`Child with name ${name} not found!`);
                return;
            }
            if (name == "boat") {
                const boat = this.models.boat;
            }
            model.name = name;

            // Default texture if not specified in textureMap
            const textureName = textureMap[name] || "wagonTexturePack1";
            model.textureColor = this.resources.items[textureName];

            if (!model.textureColor) {
                console.error(`Texture with name ${textureName} not found!`);
                return;
            }
            model.textureColor.flipY = false;
            model.material = new THREE.ShaderMaterial({
                uniforms: {
                    uBakedColorTexture: { value: model.textureColor },
                    uBakedNeutralTexture: { value: model.textureColor },  // Using the same texture for neutral, adjust if different
                    uNeutralMix: { value: this.config.neutral },
                },
                vertexShader: bakedVertexShader,
                fragmentShader: bakedFragmentShader,
                wireframe: this.config.wireframe,
            });
            model.castShadow = true;
            this.scene.add(model);
            this.models[name] = model;
        });
        if (this.models.Gate1 && this.models.Gate2) {
          
            fetch('/path.json')
            .then(response => response.json())
            .then(data => {
             
                // Initialize vectors as an array
                var vectors = [];
                data.points.forEach(point => {
                   
                    // Push new THREE.Vector3 objects into the vectors array
                    vectors.push(new THREE.Vector3(point.x, point.y, point.z));
                });
                // Log the converted vectors to ensure they're correct
              
                // Create a CatmullRomCurve3 with these points
                this.boatPath = new THREE.CatmullRomCurve3(vectors);
                // Now, this.boatPath can be used for movement or visualization
            })
            .catch(error => console.error('Error loading or processing path data:', error));
             
        }
        if (this.models.boat && this.models.row1) {
            this.models.row1.rotation.y = THREE.MathUtils.degToRad(110); // Adjust this angle as needed

            this.models.row1.position.set(.6, -3, .4);
            // Attach the row1 to the boat as a child
            this.models.boat.add(this.models.row1);
            this.models.row2.rotation.y = THREE.MathUtils.degToRad(40); // Adjust this angle as needed
            this.models.row2.rotation.x = THREE.MathUtils.degToRad(180)
            this.models.row2.position.set(.6, -3, -.7);
            // Attach the row1 to the boat as a child
            this.models.boat.add(this.models.row2);
        }
    }
    toggleFreeMoving() {
        this.isFreeMoving = !this.isFreeMoving
    }
    calculateDeltaPosition(horizontalProgress, verticalProgress) {
        // Create vectors for movement along X and Z axes based on input
        let moveX = new THREE.Vector3(horizontalProgress, 0, 0);
        let moveZ = new THREE.Vector3(0, 0, verticalProgress);

        // Combine the movement vectors
        let combinedMove = moveX.add(moveZ);

        return combinedMove;
    }


    update() {
        let boatPosition;
        // Update the boat's position along the path 

        if (!this.isFreeMoving) {
            // Following the predefined path
            boatPosition = this.boatPath.getPoint(this.boatProgress % 1);
        }
        else {
            // Free-moving, adjust boatPosition based on the current position plus some delta (boatProgress)
            // Assuming boatProgress has been updated based on input
            this.deltaPosition = this.calculateDeltaPosition(this.horizontalProgress, this.verticalProgress);
            boatPosition = new THREE.Vector3().addVectors(this.models.boat.position, this.deltaPosition);

        }

        if (this.models.boat) {
            boatPosition.x = Math.max(this.maxBounds.minX, Math.min(boatPosition.x, this.maxBounds.maxX));
            boatPosition.z = Math.max(this.maxBounds.minZ, Math.min(boatPosition.z, this.maxBounds.maxZ));
            this.models.boat.position.set(boatPosition.x, .8, boatPosition.z);
            const offset = new THREE.Vector3(0, 0, 0); // Adjust as needed
            var boatp = this.models.boat.position.clone();
            const desiredCameraPosition = boatp.add(offset);
            
            // Smoothly interpolate the camera's position
            this.experience.camera.instance.position.lerp(desiredCameraPosition, 0.05); // Adjust the lerp factor for smoothness
            
            // Make the camera look at the boat
            this.experience.camera.instance.lookAt(desiredCameraPosition);
            [this.models.row1, this.models.row2].forEach(row => {
                if (row) {
                    this.rowRotationAngle += this.rowRotationSpeed;
                    if (this.rowRotationAngle > this.maxRowRotation || this.rowRotationAngle < -this.maxRowRotation) {
                        this.rowRotationSpeed = -this.rowRotationSpeed;
                    }
                    row.rotation.x = this.rowRotationAngle;
                }
            });
            Object.keys(this.models).forEach(modelName => {
                const model = this.models[modelName];

                if (model) {

                    const distance = model.position.distanceTo(this.models.boat.position);
                    // if (modelName == "trinity") {
                    //     //distance);
                    // }
                    if (distance < 100) {
                        //`Close to ${modelName}`);

                        if (this.textMap[modelName]) {
                           this.updateTextPanel(this.textMap[modelName])
                            // remove comment to genrate flying fireflies text
                            // this.fireflies.setTextAsFireflies(this.textMap[modelName], { ...this.models.boat.position, scale: 90 })
                        }
                    }
                }
            });
        }

    } updateTextPanel(text) {
	
		const panel = document.getElementById('text-panel');
		if(panel) {
			panel.innerText = text;
		}
	}
    destroy() { }
}
