import * as THREE from 'three'

export default class Config {
	constructor(targetElement) {
		// Pixel ratio
		this.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)
		// Width and height
		const boundings = targetElement.getBoundingClientRect()
		this.width = boundings.width
		this.height = boundings.height || window.innerHeight
		this.smallestSide = Math.min(this.width, this.height)
		this.largestSide = Math.max(this.width, this.height)

		// Debug
		// this.debug = window.location.hash === '#debug'
		const enableDebugWidthThreshold = 200; // Define your preferred threshold here
        const updateDebugStatus = () => {
            this.debug = window.innerWidth > enableDebugWidthThreshold;
        };


		// Colors
		this.backgroundColor = '#4b9bfb'
		this.lightColor = '#ffffe5'
		this.firefliersColor = '#f87c42'
		this.wordsShadowColor = '#010203'
		this.shadowColor = '#1364b5'
		this.fireColorUp = '#ffff9b'
		this.fireColorDown = '#fe8e12'


		// World
		this.globalPosition = -1.5
		this.firefliesSize = 2000
		this.firefliesSpeed = 5
		this.fireSpeed = 4
		this.portalSpeed = 4
		this.portalActive = false
		this.neutral = 1
		this.wireframe = false
		this.lifeCamera = true

		// Post Processing
		this.unrealBloomStrength = 0.32
		this.unrealBloomRadius = 1
		this.unrealBloomThreshold = 0.82
		this.unrealBloomMyPulseSpeed = 1
		this.unrealBloomMyWaveLength = 1.5
		this.unrealBloomMyStrength = 0.1

		// Loader
		this.html_loader = document.querySelector('.loader')
		this.html_loaderKey = document.querySelector('.loaderKey')

		// Informers
		this.html_credits = document.querySelector('.credits')
		// this.html_iKey = document.querySelector('.iKey')
		this.html_textBlock = document.querySelector('.information')

		// Test
		this.testSpherePosition = 1
		updateDebugStatus();
		window.addEventListener('resize', updateDebugStatus);
	}
}
