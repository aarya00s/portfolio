import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Time from './Utils/Time.js'
import Sizes from './Utils/Sizes.js'

import Config from './Config.js'
import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'
import Events from './Events.js'
import assets from './assets.js'


export default class Experience {
	static instance

	constructor(_options = {}) {
		this.setHtmlTimer('0%')

		if (Experience.instance) { return Experience.instance }
		Experience.instance = this

		// Options
		this.targetElement = _options.targetElement
		if (!this.targetElement) {
			console.warn('Missing \'targetElement\' property')
			return
		}
		this.config = new Config(this.targetElement)

		this.time = new Time()
		this.sizes = new Sizes()

		this.setDebug()
		this.setStats()
		this.setScene()
		this.setCamera()
		this.setRenderer()
		this.setResources()

		this.setLoader()

		this.setWorld()

		this.setRaycaster()
		this.setEvents()
		this.update()

	}

	setDebug() {
		if (this.config.debug) {
			// Create a container for the debug panes
			this.debugContainer = document.createElement('div');
			this.debugContainer.style.display = 'flex';
			this.debugContainer.style.flexDirection = 'row';
			this.debugContainer.style.position = 'realtive';
			this.debugContainer.style.top = '10px';
			this.debugContainer.style.right = '10px';
			document.body.appendChild(this.debugContainer);

			// Create separate panes for Ocean and Water


			this.waterPane = new Pane({ title: 'Water', expanded: false });
			this.waterPane.containerElem_.style.width = '90px';
			this.waterPane.containerElem_.classList.add("panel");
			this.oceanPane = new Pane({ title: 'Ocean', expanded: false });
			this.oceanPane.containerElem_.style.width = '90px';
			this.oceanPane.containerElem_.classList.add("panel");
			this.oceanPane.containerElem_.style.marginRight = '90px'; // Add margin between panes

			// Add the panes to the debug container

			
			this.debugContainer.appendChild(this.oceanPane.containerElem_);
			this.debugContainer.appendChild(this.waterPane.containerElem_);


			// Add inputs or settings specific to each pane if necessary
			// Example:
			// this.oceanPane.addInput(this.config, 'oceanSetting', { label: 'Ocean Setting' });
			// this.waterPane.addInput(this.config, 'waterSetting', { label: 'Water Setting' });

			// Remove other debug panes or folders to avoid conflicts
			// this.cameraPane = new Pane({ title: 'Camera', expanded: false });
			// this.cameraPane.containerElem_.style.width = '320px';

			// this.renderPane = new Pane({
			//     title: 'Post-Processing',
			//     expanded: false
			// });
			// this.renderPane.containerElem_.style.width = '320px';
		}
	}
	adjustPanelSize() {
		const maxWidth = 320; // Maximum width of the panel
		const viewportWidth = window.innerWidth;
		const panelWidthPercentage = 0.8; // Adjust this value as needed

		if (viewportWidth < 768) { // Consider as a mobile device threshold
			const responsiveWidth = Math.min(viewportWidth * panelWidthPercentage, maxWidth);
			this.debug.containerElem_.style.width = `${responsiveWidth}px`;
		} else {
			// For larger screens, use the default or maximum width
			this.debug.containerElem_.style.width = `${maxWidth}px`;
		}
	}

	setStats() {
		// if (this.config.debug) this.stats = new Stats(true)
	}

	setScene() {
		this.scene = new THREE.Scene();
		this.scene.background = null; // Ensure the scene's background is transparent
	}

	setCamera() { this.camera = new Camera() }

	setRenderer() {
		this.renderer = new Renderer({ rendererInstance: this.rendererInstance, alpha: true });
		this.targetElement.appendChild(this.renderer.instance.domElement);
	}



	setResources() { this.resources = new Resources(assets) }

	setHtmlTimer(value) { htmlLoaderTimer.innerHTML = value }
	setLoader() {
		this.resources.on('progress', (_progress) => {
			this.setHtmlTimer((Math.round(_progress.loaded / _progress.toLoad * 100)) + '%')
		})
		this.resources.on('end', (_progress) => {
			window.setTimeout(() => {
				this.config.html_loader.classList.add('unvisible')
				this.config.html_credits.classList.remove('unvisible')
				this.setHtmlTimer('')
				this.config.loaderIsHidden = true
				// this.debug.title = 'Play With Me'
				// this.debug.expanded = true
			}, 1000)
		})
	}

	setWorld() { this.world = new World() }

	setRaycaster() { this.raycaster = new THREE.Raycaster() }
	setEvents() { this.events = new Events() }

	update() {
		if (this.stats) this.stats.update()
		if (this.oceanPane && this.waterPane) {

			const defaultWidth = '90px';
			const expandedWidth = '360px';

			const collapsePane = (pane) => {
				pane.expanded = false;
				if(pane==this.waterPane){this.oceanPane.containerElem_.style.marginRight = '90px';}
				pane.containerElem_.style.width = defaultWidth;
			};
			const expandPane = (pane) => {
				pane.expanded = true;
				if(pane==this.waterPane){this.oceanPane.containerElem_.style.marginRight = '180px';}
				pane.containerElem_.style.width = expandedWidth;
			};
			if (this.oceanPane.expanded) {
				expandPane(this.oceanPane);
				if (this.waterPane.expanded) {
					collapsePane(this.waterPane);
				}
			}
			else {
				collapsePane(this.oceanPane);
			}

			if (this.waterPane.expanded) {
				expandPane(this.waterPane);
				if (this.oceanPane.expanded) {
					collapsePane(this.oceanPane);
				}
			}
			else {
				collapsePane(this.waterPane);
			}
		}
		this.camera.update()

		if (this.world) this.world.update()
		if (this.renderer) this.renderer.update()
		if (this.events) this.events.update()

		window.requestAnimationFrame(() => {
			this.update()
		})
	}

	resize() {
		// Config
		const boundings = this.targetElement.getBoundingClientRect()
		this.config.width = boundings.width
		this.config.height = boundings.height
		this.config.smallestSide = Math.min(this.config.width, this.config.height)
		this.config.largestSide = Math.max(this.config.width, this.config.height)

		this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

		if (this.camera) this.camera.resize()
		if (this.renderer) this.renderer.resize()
		if (this.world) this.world.resize()
	}

	destroy() { }
}
