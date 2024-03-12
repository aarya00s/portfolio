    import * as THREE from 'three';
    import { OrbitControls } from './Experience/Utils/OrbitControls.js';
    import { Water } from './Experience/Utils/Water.js';
    import { Sky } from './Experience/Utils/Sky.js';
    import Experience from './Experience/Experience.js'
    export default class OceanScene {
        constructor() {
    
            this.init();
            this.animate();
            this.time = 0.45; // Start at the beginning of the day
            this.azimuthSpeed = 0.7;
            this.speed = 0.0009;
            this.parameters.azimuth = -137.0
            this.lifeCamera = true;
            this.done = false;
            this.isDraggable = true;
            this.mouse = new THREE.Vector2();
            this.raycaster = new THREE.Raycaster();
            this.initDragControls();
            if(window.innerWidth<600){ 
                var labels = document.getElementsByClassName('tp-lblv_l');
            var setters = document.getElementsByClassName('tp-lblv_v');
        
            for (var i = 0; i < labels.length; i++) {
                labels[i].style.display = 'block'; // Ensure labels are on their own line
                labels[i].style.width = '60%'; // Add some space below the labels for clarity
            
                setters[i].style.width = '60%'; // Ensure value setters are on a new line
            }
                document.getElementById('text-panel').style.fontSize = '25px';}
            document.getElementById('text-panel').style.display = 'block';
            document.getElementById('base').style.display = 'block';
            const dom =  document.getElementsByClassName('tp-rotv')[0].style;
        dom.display = 'block' ; 
        dom.overFLow = 'auto'
            dom.position = 'absolute' ; dom.top=0; dom.right=0;
        
        }
        init() {


            this.container = document.getElementById('container');

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 0.5;
            this.container.appendChild(this.renderer.domElement);

            this.scene = new THREE.Scene();
            this.camera = Experience.instance.camera.instance

            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            const sunGeometry = new THREE.SphereGeometry(5, 20, 10); // Sun size
            const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xe05a83 }); // Initial sun color
            this.newSun = new THREE.Mesh(sunGeometry, sunMaterial);
        





            const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
            this.water = new Water(
                waterGeometry,
                {
                    textureWidth: 1024,
                    textureHeight: 1024,
                    waterNormals: new THREE.TextureLoader().load('./waternormals.jpg', function (texture) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    }),
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xe05a83,
                    waterColor: 0x00c8ff,
                    distortionScale: 3.5,
                    fog: this.scene.fog !== undefined
                }
            );
            this.camera.position.y += 40;
            this.water.rotation.x = -Math.PI / 2;
            this.scene.add(this.water);

            this.sky = new Sky();
            this.sky.scale.setScalar(10000);
            this.scene.add(this.sky);

    
            const skyUniforms = this.sky.material.uniforms;
            skyUniforms['turbidity'].value = 10;
            skyUniforms['rayleigh'].value = 2;
            skyUniforms['mieCoefficient'].value = 0.005;
            skyUniforms['mieDirectionalG'].value = 0.8;

            this.parameters = {
                elevation: 0.0,
                azimuth: -137.0,
                turbidity: 10,
                rayleigh: 3.522,
                mieCoefficient: 0.05,
                mieDirectionalG: 0.380,
                sunCycle: true,
                boatMovement: false,
                isFreeMoving:false
            };

            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            const sceneEnv = new THREE.Scene();
            let renderTarget;

            this.updateSun = () => {
                const phi = THREE.MathUtils.degToRad(90 - this.parameters.elevation);
                const theta = THREE.MathUtils.degToRad(this.parameters.azimuth);
                const sunPosition = new THREE.Vector3();
                sunPosition.setFromSphericalCoords(100, phi, theta);
                // this.newSun.position.setFromSphericalCoords(1, phi, theta);
                this.sky.material.uniforms['sunPosition'].value.copy(sunPosition);
                this.water.material.uniforms['sunDirection'].value.copy(sunPosition).normalize();
                this.sky.material.uniforms['turbidity'].value = this.parameters.turbidity;
                this.sky.material.uniforms['rayleigh'].value = this.parameters.rayleigh;
                this.sky.material.uniforms['mieCoefficient'].value = this.parameters.mieCoefficient;
                this.sky.material.uniforms['mieDirectionalG'].value = this.parameters.mieDirectionalG;
                if (renderTarget !== undefined) renderTarget.dispose();
                this.newSun.position.copy(sunPosition);
                sceneEnv.add(this.sky);
                renderTarget = pmremGenerator.fromScene(sceneEnv);
                this.scene.add(this.sky);

                // this.newSun.position.set(this.parameters.azimuth, this.parameters.elevation+.2, -400);
                // this.scene.add(this.newSun);     // CHNAGE THIS TO ADD THE SUN BACK 
                this.scene.environment = renderTarget.texture;
                //


                //

            };
            const geometry = new THREE.SphereGeometry(0, 0, 0);
            const material = new THREE.MeshStandardMaterial({ roughness: 0 });

            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
        
            // this.controls.maxPolarAngle = Math.PI * 0.495;
            this.controls.target.set(0, 10, 0);
            this.controls.minDistance = 40.0;
            this.controls.maxDistance = 200.0;
            this.controls.update();

            this.stats = Experience.instance.debug;
console.log(this.stats)
                if (this.stats) {
                    this.stats.skyFolder.addBinding(this.parameters, 'elevation', { min: 0, max: 90, step: 0.1, label: 'Elevation' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'azimuth', { min: -180, max: 180, step: 0.1, label: 'Azimuth' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'turbidity', { min: 0, max: 20, step: 0.1, label: 'Turbidity' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'rayleigh', { min: 0, max: 4, step: 0.001, label: 'Rayleigh' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'mieCoefficient', { min: 0, max: 0.1, step: 0.001, label: 'Mie Coefficient' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'mieDirectionalG', { min: 0, max: 1, step: 0.001, label: 'Mie Directional G' }).on('change', this.updateSun);
                    this.stats.skyFolder.addBinding(this.parameters, 'sunCycle', { label: 'Day Cycle' }).on(() =>
                        'change', () => { this.toggleSunCycle; }
                    );
                    this.stats.skyFolder.addBinding(this.parameters, 'isFreeMoving', { label: 'Move Freely' }).on(() =>
                    'onChange', () => {
                    this.toggleFreeMoving();
                        if(Experience.instance.world.wagon){
                        this.toggleFreeMoving();
                    } }
                );
                    this.stats.skyFolder.addBinding(this.parameters, 'boatMovement', { label: 'Boat Movement' }).on(() =>
                        'onChange', () => {
                    
                            this.parameters.boatMovement = !this.parameters.boatMovement;
                        });

                    const waterUniforms = this.water.material.uniforms;
                    this.stats.waterFolder.addBinding(waterUniforms.distortionScale, 'value', { min: 0, max: 8, step: 0.1, label: 'Distortion Scale' });
                    this.stats.waterFolder.addBinding(waterUniforms.size, 'value', { min: 0.1, max: 10, step: 0.1, label: 'Size' });
                }
                else {
                    console.error('Stats or skyFolder is not properly initialized');
                }

        }
        toggleSunCycle() {
            this.parameters.sunCycle = !this.parameters.sunCycle;
        }
        toggleFreeMoving(){
            this.parameters.isFreeMoving=!this.parameters.isFreeMoving;
            Experience.instance.world.wagon.toggleFreeMoving();
        

        }
        updateSunPosition() {
            this.cycle = this.time % 1; // Ensure the cycle repeats every "day"

            // Calculate the sun's elevation based on the cycle
            this.parameters.elevation = Math.sin(this.cycle * 2 * Math.PI) * 90;
            if (this.cycle >= 0.0 && this.cycle <= 0.03 || this.cycle >= .48 && this.cycle <= .52) {

                this.speed = .00009;
                this.azimuthSpeed = 0.008
            } else {
                this.speed = 0.001
                this.azimuthSpeed = 0.08
            }

            // Adjust the sun's color and sky parameters based on the time of day
            if (this.cycle >= 0.0 && this.cycle < 0.25) { // Sunrise
                this.newSun.material.color.setHSL(0.1, 0.7, 0.5 + this.cycle * 2); // Warm colors at sunrise
                this.parameters.turbidity = 10;
                this.parameters.rayleigh = 2 + this.cycle * 2;
            } else if (this.cycle >= 0.25 && this.cycle < 0.5) { // Midday
                this.newSun.material.color.setHSL(0.1, 0.2, 0.9); // Bright white/yellow at midday
                this.parameters.turbidity = 5;
                this.parameters.rayleigh = 2;
            } else if (this.cycle >= 0.5 && this.cycle < 0.75) { // Sunset
                // Adjust the sun's color to a gradient of light yellow to dark orange
                const sunsetProgress = (this.cycle - 0.5) * 4; // Normalize progress to range 0-1 during sunset
                const sunColorHSL = {
                    h: 0.08 + sunsetProgress * 0.02, // Adjust hue from yellow to orange
                    s: 1.0, // Full saturation for vibrant colors
                    l: 0.5 - sunsetProgress * 0.2 // Adjust lightness from light to darker
                };
                this.newSun.material.color.setHSL(sunColorHSL.h, sunColorHSL.s, sunColorHSL.l);

                // Set the sky color to orange during sunset
                this.sky.material.uniforms['turbidity'].value = 10 + sunsetProgress * 10; // Increase turbidity for a deeper effect
                this.sky.material.uniforms['rayleigh'].value = 2 + sunsetProgress * 2; // Increase Rayleigh scattering for orange hue
                this.parameters.mieCoefficient = 0.005 + sunsetProgress * 0.005; // Slightly adjust for sunset glow
            } else { // Night
                this.newSun.material.color.setHSL(0.6, 1.0, 0.1); // Dim light for night
                this.parameters.turbidity = 10;
                this.parameters.rayleigh = 1;
            }
            // Apply the updated sun position and atmospheric conditions
            this.updateSun();
        }
        initDragControls() {

        }
        


        onClick(event) {
            if (this.isDraggable) {
                // Ignore clicks that are part of a drag action
                return;
            }
    
            // Convert mouse click to raycast coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects([this.newSun]);

            if (intersects.length > 0) {
                // Handle click event on the newSun object
                
                // Perform any action you want when newSun is clicked
            }
        }


        animate() {
            requestAnimationFrame(this.animate.bind(this));
            if (this.parameters.sunCycle) {
                this.time += this.speed; // Progress time
                this.parameters.azimuth -= this.azimuthSpeed;
                this.updateSunPosition();
            
            }


            // Update the sun's position based on the current time
            this.render();

        }
        render() {

            this.water.material.uniforms['time'].value += 1.0 / 60.0;
            this.renderer.render(this.scene, this.camera);
        }
    }
