import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
	constructor(_options) {
		// Options
		this.experience = new Experience()
		this.config = this.experience.config
		this.debug = this.experience.debug
		this.time = this.experience.time
		this.sizes = this.experience.sizes
		this.targetElement = this.experience.targetElement
		this.scene = this.experience.scene

		// Set up
		this.mode = 'debug' // defaultCamera \ debugCamera

		this.setInstance()
		this.setModes()
		// this.addDebug()
	}

	setInstance() {
		// Set up
		if(this.config){
		this.instance = new THREE.PerspectiveCamera(45, this.config.width / this.config.height, 0.1, 150)
		this.instance.rotation.reorder('YXZ')

		this.scene.add(this.instance)
	}else{
		this.setInstance()
	}
	}
	setFollowTarget(target) {
		this.modes.follow.followTarget = target;
	}
	setMode(mode, newPosition) {
		if (this.modes[mode]) {
			this.mode = mode;
		}
		if (newPosition) {
            this.modes[mode].instance.position.copy(newPosition);
        }
	}
	setModes() {
		this.modes = {}
		//Follow
		this.modes.follow = {
			instance: this.instance.clone(),
			followTarget: null // This will be set to the boat object
		}

		// Default
		this.modes.default = {}
		this.modes.default.instance = this.instance.clone()
		this.modes.default.instance.rotation.reorder('YXZ')

		// Debug
		this.modes.debug = {}
		this.modes.debug.instance = this.instance.clone()
		this.modes.debug.instance.rotation.reorder('YXZ')
		this.modes.debug.instance.position.set(8,2, 8)
		this.modes.debug.instance.lookAt(0,-5, 0);  // Adjust the values if the model's center is not at the origin.


		this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)
		this.modes.debug.orbitControls.enabled = true
		this.modes.debug.orbitControls.enableKeys = true
		this.modes.debug.orbitControls.screenSpacePanning = false
		this.modes.debug.orbitControls.maxDistance = 11
		this.setLifeCamera(this.config.lifeCamera)

		this.modes.debug.orbitControls.update()
	}

	setLifeCamera(bool) {
		if (bool) {
			this.modes.debug.orbitControls.enablePan = false
			this.modes.debug.orbitControls.zoomSpeed = 0
			this.modes.debug.orbitControls.rotateSpeed = 0.25
			this.modes.debug.orbitControls.autoRotate = false
			this.modes.debug.orbitControls.autoRotateSpeed = -0.5
			this.modes.debug.orbitControls.enableDamping = true
			this.modes.debug.orbitControls.dampingFactor = 0.01
			this.modes.debug.orbitControls.minPolarAngle = (Math.PI / 4); 
			this.modes.debug.orbitControls.maxPolarAngle = (Math.PI/2)-.05;
			this.modes.debug.orbitControls.minDistance = 2.0
		} else {
			this.modes.debug.orbitControls.enablePan = true
			this.modes.debug.orbitControls.zoomSpeed = 1
			this.modes.debug.orbitControls.rotateSpeed = 1
			this.modes.debug.orbitControls.autoRotate = false
			this.modes.debug.orbitControls.enableDamping = false
			this.modes.debug.orbitControls.minPolarAngle = 0
			this.modes.debug.orbitControls.maxPolarAngle = (Math.PI/2)-.05;
			this.modes.debug.orbitControls.minDistance = 0
		}
	}

	addDebug() {
		if (this.debug && this.debug.cameraFolder) {
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'zoomSpeed',
					{ min: 0, max: 2, step: 0.05, label: 'Zoom Speed' })
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'rotateSpeed',
					{ min: 0, max: 2, step: 0.05, label: 'Rotate Speed' })
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'autoRotate',
					{ label: 'Auto Rotate' })
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'autoRotateSpeed',
					{ min: -5, max: 5, step: 0.1, label: 'Auto Rotate Speed' })

			this.debug.cameraFolder.addSeparator()
			
			this.debug.cameraFolder
				.addBinding(this.config, 'lifeCamera', { label: 'Life Camera' })
				.on('change', () => {
					this.setLifeCamera(this.config.lifeCamera)
					
				})
		}
	}

	resize() {
		this.instance.aspect = this.config.width / this.config.height
		this.instance.updateProjectionMatrix()

		this.modes.default.instance.aspect = this.config.width / this.config.height
		this.modes.default.instance.updateProjectionMatrix()

		this.modes.debug.instance.aspect = this.config.width / this.config.height
		this.modes.debug.instance.updateProjectionMatrix()
	}

	update() {
		if(this.mode === 'follow' && this.modes.follow.followTarget) {
			const targetPosition = this.modes.follow.followTarget.position.clone();
			const offset = new THREE.Vector3(0, 0, 0); // Adjust as needed
			const desiredPosition = targetPosition.add(offset);
	
			this.modes.follow.instance.position.lerp(desiredPosition, 0.05);
			this.modes.follow.instance.lookAt(desiredPosition);
		} else {
		// Update debug orbit controls
		this.modes.debug.orbitControls.update()
		// //`Q ${this.instance.quaternion.y}, R ${this.instance.rotation.y}`);
		// Apply coordinates
		this.instance.position.copy(this.modes[this.mode].instance.position)
		this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
		this.instance.updateMatrixWorld() // To be used in projection
	}
}

	destroy() {
		this.modes.debug.orbitControls.destroy()
	}
}
