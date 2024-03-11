import * as THREE from 'three'
import Experience from './Experience.js'


import Wagon from './World/Wagon.js'
import OceanScene from '../ocean.js'


export default class World {
	constructor(_options) {
		this.experience = new Experience()
		this.resources = this.experience.resources
		this.debug = this.experience.debug
		this.config = this.experience.config
		this.scene = this.experience.scene
		this.time = this.experience.time
		this.clock = new THREE.Clock()
		this.sizes = this.experience.sizes
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		
		this.resources.on('groupEnd', (_group) => {
			if (_group.name === 'asset') {
				
				this.setOcean()
			
				this.setWagon()
				
				//this.setWordsShadow()
				//this.setGradientShadow()
				this.setFireflies()
		

					
	

			}
		})
	}
    
	//setHelpers() { this.helpers = new Helpers() }
	setWagon() { 
		this.wagon = new Wagon() }
		setFireflies() { 
			// this.fireflies = new Fireflies()
		 }
	

	addStar() {
		this.star = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 3, 3),
			new THREE.MeshBasicMaterial({ color: '#fff' }),
			)
		this.star.position.set(10, 7, 7)
		this.star.scale.set(0.3, 0.3, 0.3)

		this.scene.add(this.star)
	}
	
		//const geometry = new THREE.PlaneBufferGeometry(2, 2);
        
		// setWater() {
		// 	const waterGeometry = new THREE.PlaneGeometry(100, 100); // or whatever size you want
		// 	this.water = new Water(waterGeometry, {});
		// 	this.scene.add(this.water);
		// }
		
		setOcean() {
			this.ocean = new OceanScene();
			if(this.ocean && this.ocean.water) {
				// this.ocean.water.position.y = -2;

				this.scene.add(this.ocean.water);
			} else {
				console.error('water is not defined in OceanScene');
			}
		}
		
	

	update() {

		if (this.fireflies) {
			this.fireflies.update()
		    //  console.log("firelfies")	
		}
		// if(this.wagon) this.wagon.update()
	}

	addDebug() {
		if (this.debug) {

			this.debug.worldFolder
				.addInput(this.config, 'wireframe', { label: 'Wireframe' })
				.on('change', () => {
					for (const child of this.scene.children) {
						// //child);
						if (child.material) {
							child.material.wireframe = this.config.wireframe
						}
					}
					for (const child of this.informers.models.children) {
						// //child);
						if (child.material) {
							child.material.wireframe = this.config.wireframe
						}
					}
				})
			this.debug.worldFolder
				.addInput(this.config, 'neutral', { min: 0, max: 1, step: 0.1, label: 'Wagon' })
				.on('change', () => {
					this.wagon.model.pack1.material.uniforms.uNeutralMix.value = this.config.neutral
					this.wagon.model.pack2.material.uniforms.uNeutralMix.value = this.config.neutral
					this.trees.model.material.uniforms.uNeutralMix.value = this.config.neutral
					this.grass.model.material.uniforms.uNeutralMix.value = this.config.neutral
					this.owlEyes.model.material.uniforms.uNeutralMix.value = this.config.neutral
				})
			this.debug.worldFolder
				.addInput(this.config, 'neutral', { min: 0, max: 1, step: 0.1, label: 'Lights' })
				.on('change', () => {
					this.windows.model.material.uniforms.uNeutralMix.value = this.config.neutral
					this.fire.model.material.uniforms.uNeutralMix.value = this.config.neutral
					this.portal.model.material.uniforms.uNeutralMix.value = this.config.neutral
				})

			this.debug.worldFolder.addSeparator()
			//new code
		
			
			// this.experience.renderer.instance.setClearColor(0xffffff, 0);
      

			// this.debug.worldFolder
			// 	.addInput(this.config, 'backgroundColor', { view: 'color', label: 'Background' })
			// 	.on('change', () => {
			// 		this.gradientShadow.model.material.uniforms.uColorBg.value.set(this.config.backgroundColor)
			

			// 	})
			// this.debug.worldFolder
			// 	.addInput(this.config, 'backgroundColor', { view: 'color', label: 'Portal Inside' })
			// 	.on('change', () => {
			// 		this.portal.model.material.uniforms.uColorCenter.value.set(this.config.backgroundColor)
			// 	})
			// this.debug.worldFolder
			// 	.addInput(this.config, 'lightColor', { view: 'color', label: 'Portal Outside' })
			// 	.on('change', () => {
			// 		this.portal.model.material.uniforms.uColorBorder.value.set(this.config.lightColor)
			// 	})
			this.debug.worldFolder
				.addInput(this.config, 'lightColor', { view: 'color', label: 'Windows Light' })
				.on('change', () => {
					this.windows.model.material.uniforms.uColor.value.set(this.config.lightColor)
				})
			this.debug.worldFolder
				.addInput(this.config, 'firefliersColor', { view: 'color', label: 'Fireflies' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uColor.value.set(this.config.firefliersColor)
				})
			this.debug.worldFolder
				.addInput(this.config, 'fireColorUp', { view: 'color', label: 'Fire Top' })
				.on('change', () => {
					this.fire.model.material.uniforms.uColorUp.value.set(this.config.fireColorUp)
				})
			this.debug.worldFolder
				.addInput(this.config, 'fireColorDown', { view: 'color', label: 'Fire Bottom' })
				.on('change', () => {
					this.fire.model.material.uniforms.uColorDown.value.set(this.config.fireColorDown)
				})
			this.debug.worldFolder
				.addInput(this.config, 'shadowColor', { view: 'color', label: 'Shadow' })
				.on('change', () => {
					this.gradientShadow.model.material.uniforms.uColorShadow.value.set(this.config.shadowColor)
				})
			this.debug.worldFolder
				.addInput(this.config, 'wordsShadowColor', { view: 'color', label: 'Text Shadow' })
				.on('change', () => {
					this.wordsShadow.model.material.color.set(this.config.wordsShadowColor)
				})

			this.debug.worldFolder.addSeparator()

			this.debug.worldFolder
				.addInput(this.config, 'firefliesSize', { min: 40, max: 1000, step: 10, label: 'Fireflies Size' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uSize.value = this.config.firefliesSize
				})
			this.debug.worldFolder
				.addInput(this.config, 'firefliesSpeed', { min: 0, max: 80, step: 1, label: 'Fireflies Speed' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uTimeFrequency.value = this.config.firefliesSpeed / 10000
				})
		}
	}

	resize() { }
	destroy() { }
}