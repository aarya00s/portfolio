/* empty css                          */
import { e as createAstro, f as createComponent, r as renderTemplate, i as renderComponent, j as renderHead, m as maybeRenderHead } from '../astro_DQiTNdAv.mjs';
import 'kleur/colors';
import 'html-escaper';
import { useEffect } from 'react';
import * as THREE from 'three';
import { Ray, Plane, MathUtils, EventDispatcher, Vector3, MOUSE, TOUCH, Quaternion, Spherical, Vector2, Mesh, Color, FrontSide, Matrix4, Vector4, PerspectiveCamera, WebGLRenderTarget, UniformsUtils, UniformsLib, ShaderMaterial, BackSide, BoxGeometry } from 'three';
import { Pane } from 'tweakpane';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OrbitControls as OrbitControls$1 } from 'three/examples/jsm/controls/OrbitControls.js';

class EventEmitter
{
	/**
	 * Constructor
	 */
	constructor()
	{
		this.callbacks = {};
		this.callbacks.base = {};
	}

	/**
	 * On
	 */
	on(_names, callback)
	{
		const that = this;

		// Errors
		if(typeof _names === 'undefined' || _names === '')
		{
			console.warn('wrong names');
			return false
		}

		if(typeof callback === 'undefined')
		{
			console.warn('wrong callback');
			return false
		}

		// Resolve names
		const names = this.resolveNames(_names);

		// Each name
		names.forEach(function(_name) {
			// Resolve name
			const name = that.resolveName(_name);

			// Create namespace if not exist
			if(!(that.callbacks[ name.namespace ] instanceof Object))
				that.callbacks[ name.namespace ] = {};

			// Create callback if not exist
			if(!(that.callbacks[ name.namespace ][ name.value ] instanceof Array))
				that.callbacks[ name.namespace ][ name.value ] = [];

			// Add callback
			that.callbacks[ name.namespace ][ name.value ].push(callback);
		});

		return this
	}

	/**
	 * Off
	 */
	off(_names)
	{
		const that = this;

		// Errors
		if(typeof _names === 'undefined' || _names === '')
		{
			console.warn('wrong name');
			return false
		}

		// Resolve names
		const names = this.resolveNames(_names);

		// Each name
		names.forEach(function(_name)
		{
			// Resolve name
			const name = that.resolveName(_name);

			// Remove namespace
			if(name.namespace !== 'base' && name.value === '')
			{
				delete that.callbacks[ name.namespace ];
			}

			// Remove specific callback in namespace
			else
			{
				// Default
				if(name.namespace === 'base')
				{
					// Try to remove from each namespace
					for(const namespace in that.callbacks)
					{
						if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
						{
							delete that.callbacks[ namespace ][ name.value ];

							// Remove namespace if empty
							if(Object.keys(that.callbacks[ namespace ]).length === 0)
								delete that.callbacks[ namespace ];
						}
					}
				}

				// Specified namespace
				else if(that.callbacks[ name.namespace ] instanceof Object && that.callbacks[ name.namespace ][ name.value ] instanceof Array)
				{
					delete that.callbacks[ name.namespace ][ name.value ];

					// Remove namespace if empty
					if(Object.keys(that.callbacks[ name.namespace ]).length === 0)
						delete that.callbacks[ name.namespace ];
				}
			}
		});

		return this
	}

	/**
	 * Trigger
	 */
	trigger(_name, _args)
	{
		// Errors
		if(typeof _name === 'undefined' || _name === '')
		{
			console.warn('wrong name');
			return false
		}

		const that = this;
		let finalResult = null;

		// Default args
		const args = !(_args instanceof Array) ? [] : _args;

		// Resolve names (should on have one event)
		let name = this.resolveNames(_name);

		// Resolve name
		name = this.resolveName(name[ 0 ]);

		// Default namespace
		if(name.namespace === 'base')
		{
			// Try to find callback in each namespace
			for(const namespace in that.callbacks)
			{
				if(that.callbacks[ namespace ] instanceof Object && that.callbacks[ namespace ][ name.value ] instanceof Array)
				{
					that.callbacks[ namespace ][ name.value ].forEach(function(callback)
					{
						callback.apply(that, args);
					});
				}
			}
		}

		// Specified namespace
		else if(this.callbacks[ name.namespace ] instanceof Object)
		{
			if(name.value === '')
			{
				console.warn('wrong name');
				return this
			}

			that.callbacks[ name.namespace ][ name.value ].forEach(function(callback)
			{
				callback.apply(that, args);
			});
		}
		return finalResult
	}

	/**
	 * Resolve names
	 */
	resolveNames(_names)
	{
		let names = _names;
		names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
		names = names.replace(/[,/]+/g, ' ');
		names = names.split(' ');

		return names
	}

	/**
	 * Resolve name
	 */
	resolveName(name)
	{
		const newName = {};
		const parts = name.split('.');

		newName.original  = name;
		newName.value     = parts[ 0 ];
		newName.namespace = 'base'; // Base namespace

		// Specified namespace
		if(parts.length > 1 && parts[ 1 ] !== '')
		{
			newName.namespace = parts[ 1 ];
		}

		return newName
	}
}

class Time extends EventEmitter
{
	/**
	 * Constructor
	 */
	constructor()
	{
		super();

		this.start = Date.now();
		this.current = this.start;
		this.elapsed = 0;
		this.delta = 16;
		this.playing = true;

		this.tick = this.tick.bind(this);
		this.tick();
	}

	play()
	{
		this.playing = true;
	}

	pause()
	{
		this.playing = false;
	}

	/**
	 * Tick
	 */
	tick()
	{
		this.ticker = window.requestAnimationFrame(this.tick);

		const current = Date.now();

		this.delta = current - this.current;
		this.elapsed += this.playing ? this.delta : 0;
		this.current = current;

		if(this.delta > 60)
		{
			this.delta = 60;
		}

		if(this.playing)
		{
			this.trigger('tick');
		}
	}

	/**
	 * Stop
	 */
	stop()
	{
		window.cancelAnimationFrame(this.ticker);
	}
}

class Sizes extends EventEmitter
{
	/**
	 * Constructor
	 */
	constructor()
	{
		super();

		// Viewport size
		this.viewport = {};
		this.$sizeViewport = document.createElement('div');
		this.$sizeViewport.style.width = '100vw';
		this.$sizeViewport.style.height = '100vh';
		this.$sizeViewport.style.position = 'absolute';
		this.$sizeViewport.style.top = 0;
		this.$sizeViewport.style.left = 0;
		this.$sizeViewport.style.pointerEvents = 'none';

		// Resize event
		this.resize = this.resize.bind(this);
		window.addEventListener('resize', this.resize);

		this.resize();
	}

	/**
	 * Resize
	 */
	resize()
	{
		document.body.appendChild(this.$sizeViewport);
		this.viewport.width = this.$sizeViewport.offsetWidth;
		this.viewport.height = this.$sizeViewport.offsetHeight;
		document.body.removeChild(this.$sizeViewport);

		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.trigger('resize');
	}
}

class Config {
	constructor(targetElement) {
		// Pixel ratio
		this.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);
		// Width and height
		const boundings = targetElement.getBoundingClientRect();
		this.width = boundings.width;
		this.height = boundings.height || window.innerHeight;
		this.smallestSide = Math.min(this.width, this.height);
		this.largestSide = Math.max(this.width, this.height);

		// Debug
		// this.debug = window.location.hash === '#debug'
		const enableDebugWidthThreshold = 200; // Define your preferred threshold here
        const updateDebugStatus = () => {
            this.debug = window.innerWidth > enableDebugWidthThreshold;
        };


		// Colors
		this.backgroundColor = '#4b9bfb';
		this.lightColor = '#ffffe5';
		this.firefliersColor = '#f87c42';
		this.wordsShadowColor = '#010203';
		this.shadowColor = '#1364b5';
		this.fireColorUp = '#ffff9b';
		this.fireColorDown = '#fe8e12';


		// World
		this.globalPosition = -1.5;
		this.firefliesSize = 2000;
		this.firefliesSpeed = 5;
		this.fireSpeed = 4;
		this.portalSpeed = 4;
		this.portalActive = false;
		this.neutral = 1;
		this.wireframe = false;
		this.lifeCamera = true;

		// Post Processing
		this.unrealBloomStrength = 0.32;
		this.unrealBloomRadius = 1;
		this.unrealBloomThreshold = 0.82;
		this.unrealBloomMyPulseSpeed = 1;
		this.unrealBloomMyWaveLength = 1.5;
		this.unrealBloomMyStrength = 0.1;

		// Loader
		this.html_loader = document.querySelector('.loader');
		this.html_loaderKey = document.querySelector('.loaderKey');

		// Informers
		this.html_credits = document.querySelector('.credits');
		// this.html_iKey = document.querySelector('.iKey')
		this.html_textBlock = document.querySelector('.information');

		// Test
		this.testSpherePosition = 1;
		updateDebugStatus();
		window.addEventListener('resize', updateDebugStatus);
	}
}

let Resources$1 = class Resources extends EventEmitter
{
	/**
	 * Constructor
	 */
	constructor()
	{
		super();

		this.experience = new Experience();
		this.renderer = this.experience.renderer.instance;

		this.setLoaders();

		this.toLoad = 0;
		this.loaded = 0;
		this.items = {};
	}

	/**
	 * Set loaders
	 */
	setLoaders()
	{
		this.loaders = [];
		const ktx2Loader = new KTX2Loader()
		.setTranscoderPath( 'jsm/libs/basis/' )
		.detectSupport( this.renderer );

		// Images
		this.loaders.push({
			extensions: ['jpg', 'png'],
			action: (_resource) =>
			{
				const image = new Image();

				image.addEventListener('load', () =>
				{
					this.fileLoadEnd(_resource, image);
				});

				image.addEventListener('error', () =>
				{
					this.fileLoadEnd(_resource, image);
				});

				image.src = _resource.source;
			}
		});

		// Draco
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		dracoLoader.setDecoderConfig({ type: 'js' });

		this.loaders.push({
			extensions: ['drc'],
			action: (_resource) =>
			{
				dracoLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data);

					DRACOLoader.releaseDecoderModule();
				});
			}
		});

		// GLTF
		const gltfLoader = new GLTFLoader();
		gltfLoader.setDRACOLoader(dracoLoader);
		gltfLoader.setKTX2Loader( ktx2Loader );
		gltfLoader.setMeshoptDecoder( MeshoptDecoder );

		this.loaders.push({
			extensions: ['glb', 'gltf'],
			action: (_resource) =>
			{
				//_resource);
				
gltfLoader.load(_resource.source, (_data) => {
    this.fileLoadEnd(_resource, _data);
}, undefined, (error) => {
    console.error('An error occurred while loading the GLTF file:', error);
    this.trigger('fileError', [_resource, error]);
});
			}
		});

		// FBX
		const fbxLoader = new FBXLoader();

		this.loaders.push({
			extensions: ['fbx'],
			action: (_resource) =>
			{
				fbxLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data);
				});
			}
		});

		// RGBE | HDR
		const rgbeLoader = new RGBELoader();

		this.loaders.push({
			extensions: ['hdr'],
			action: (_resource) =>
			{
				rgbeLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data);
				});
			}
		});
	}

	/**
	 * Load
	 */
	load(_resources = [])
	{
		for(const _resource of _resources)
		{
			this.toLoad++;
			const extensionMatch = _resource.source.match(/\.([a-z]+)$/);
	
			if(extensionMatch && extensionMatch[1])
			{
				const extension = extensionMatch[1];
				const loader = this.loaders.find((_loader) => _loader.extensions.find((_extension) => _extension === extension));
	
				if(loader)
				{
				
					loader.action(_resource);
				}
				else
				{
					console.warn(`Cannot found loader for ${_resource}`);
				}
			}
			else
			{
				console.warn(`Cannot found extension of ${_resource.source}`);
			}
		}
	}
	

	/**
	 * File load end
	 */
	fileLoadEnd(_resource, _data)
	{
		this.loaded++;
		this.items[_resource.name] = _data;

		this.trigger('fileEnd', [_resource, _data]);

		if(this.loaded === this.toLoad)
		{
			this.trigger('end');
		}
	}
};

class Resources extends EventEmitter
{
	constructor(_assets)
	{
		super();

		// Items (will contain every resources)
		this.items = {};

		// Loader
		this.loader = new Resources$1({ renderer: this.renderer });

		this.groups = {};
		this.groups.assets = [..._assets];
		this.groups.loaded = [];
		this.groups.current = null;
		this.loadNextGroup();

		// Loader file end event
		this.loader.on('fileEnd', (_resource, _data) =>
		{
			let data = _data;

			// Convert to texture
			if(_resource.type === 'texture')
			{
				if(!(data instanceof THREE.Texture))
				{
						data = new THREE.Texture(_data);
				}
				data.needsUpdate = true;
			}

			this.items[_resource.name] = data;

			// Progress and event
			this.groups.current.loaded++;
			this.trigger('progress', [this.groups.current, _resource, data]);
		});

		// Loader all end event
		this.loader.on('end', () =>
		{
			this.groups.loaded.push(this.groups.current);
			
			// Trigger
			this.trigger('groupEnd', [this.groups.current]);

			if(this.groups.assets.length > 0)
			{
				this.loadNextGroup();
			}
			else
			{
				this.trigger('end');
			}
		});
	}

	loadNextGroup()
	{
		this.groups.current = this.groups.assets.shift();
		this.groups.current.toLoad = this.groups.current.items.length;
		this.groups.current.loaded = 0;

		this.loader.load(this.groups.current.items);
	}

	createInstancedMeshes(_children, _groups)
	{
		// Groups
		const groups = [];

		for(const _group of _groups)
		{
			groups.push({
				name: _group.name,
				regex: _group.regex,
				meshesGroups: [],
				instancedMeshes: []
			});
		}

		// Result
		const result = {};

		for(const _group of groups)
		{
			result[_group.name] = _group.instancedMeshes;
		}

		return result
	}

	destroy()
	{
		for(const _itemKey in this.items)
		{
			const item = this.items[_itemKey];
			if(item instanceof THREE.Texture)
			{
				item.dispose();
			}
		}
	}
}

class Renderer {
	constructor(_options = {}) {
		this.experience = new Experience();
		this.config = this.experience.config;
		this.debug = this.experience.debug;
		this.stats = this.experience.stats;
		this.time = this.experience.time;
		this.sizes = this.experience.sizes;
		this.scene = this.experience.scene;
		this.camera = this.experience.camera;
		
		this.usePostprocess = true;

		this.setInstance();
		this.setPostProcess();
		this.addDebug();
	}

	setInstance() {
		// Renderer
		this.instance = new THREE.WebGLRenderer({
		    alpha: true,
			antialias: true
		});
		this.instance.domElement.style.position = 'absolute';
		this.instance.domElement.style.top = 0;
		this.instance.domElement.style.left = 0;
		this.instance.domElement.style.width = '100%';
		this.instance.domElement.style.height = '100%';

		this.instance.setClearColor(0xF4FAFC , .4);

		this.instance.setSize(this.config.width, this.config.height);
		this.instance.setPixelRatio(this.config.pixelRatio);

		// this.instance.physicallyCorrectLights = true
		// this.instance.gammaOutPut = true
		// this.instance.outputEncoding = THREE.sRGBEncoding
		// this.instance.shadowMap.type = THREE.PCFSoftShadowMap
		// this.instance.shadowMap.enabled = false
		this.instance.toneMapping = THREE.NoToneMapping;
		this.instance.toneMappingExposure = 1;

		this.context = this.instance.getContext();

		// Add stats panel
		if(this.stats) {
			this.stats.setRenderPanel(this.context);
		}
	}

	setPostProcess() {
		this.postProcess = {};

		/**
		 * Effect composer
		 */
		this.renderTarget = new THREE.WebGLRenderTarget(
				this.config.width,
				this.config.height,
				{
						generateMipmaps: false,
						minFilter: THREE.LinearFilter,
						magFilter: THREE.LinearFilter,
						// format: THREE.RGBAFormat,
						// encoding: THREE.sRGBEncoding,
						samples: this.instance.getPixelRatio() === 1 ? 2 : 0
				}
		);
		this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget);
		this.postProcess.composer.setSize(this.config.width, this.config.height);
		this.postProcess.composer.setPixelRatio(this.config.pixelRatio);

		/**
		 * Passes
		 */
		this.postProcess.renderPass = new RenderPass(this.scene, this.camera.instance);
		this.postProcess.composer.addPass(this.postProcess.renderPass);

		this.postProcess.unrealBloomPass = new UnrealBloomPass();
		this.postProcess.unrealBloomPass.strength = this.config.unrealBloomStrength;
		this.postProcess.unrealBloomPass.radius = this.config.unrealBloomRadius;
		this.postProcess.unrealBloomPass.threshold = this.config.unrealBloomThreshold;
		this.postProcess.composer.addPass(this.postProcess.unrealBloomPass);

		if(this.instance.getPixelRatio() === 1 && !this.instance.capabilities.isWebGL2) {
			this.postProcess.smaaPass = new SMAAPass();
			this.postProcess.composer.addPass(this.postProcess.smaaPass);

			//'Using SMAA')
			}
	}

	addDebug() {
		// if(this.debug) {
		// 	this.debug.renderFolder
		// 		.addInput(this.postProcess.unrealBloomPass,'enabled',{
		// 			label: 'Unreal Bloom' })
		// 	this.debug.renderFolder
		// 		.addInput(this.config,'unrealBloomMyStrength',{
		// 			min: 0, max: 1, step: 0.01,
		// 			label: 'Bloom Strength' })
		// 	this.debug.renderFolder
		// 		.addInput(this.config,'unrealBloomMyPulseSpeed',{
		// 			min: 0, max: 10, step: 1,
		// 			label: 'Pulse Speed' })
		// 	this.debug.renderFolder
		// 		.addInput(this.config,'unrealBloomMyWaveLength',{
		// 			min: 0, max: 10, step: 0.01,
		// 			label: 'Wave Length' })
		// 	this.debug.renderFolder
		// 		.addInput(this.postProcess.unrealBloomPass,'radius',{
		// 			min: 0, max: 1, step: 0.01,
		// 			label: 'Bloom Radius' })
		// 	this.debug.renderFolder
		// 		.addInput(this.config,'unrealBloomThreshold',{
		// 			min: 0, max: 1, step: 0.01,
		// 			label: 'Bloom Threshold' })
		// }
	}

	resize() {
		// Instance
		this.instance.setSize(this.config.width, this.config.height);
		this.instance.setPixelRatio(this.config.pixelRatio);

		// Post process
		//this.postProcess.composer.setSize(this.config.width, this.config.height)
		this.postProcess.composer.setPixelRatio(this.config.pixelRatio);
	}

	update() {
		if(this.stats) {
				this.stats.beforeRender();
		}

		if(this.usePostprocess) {
				//this.postProcess.composer.render()
				this.instance.render(this.scene, this.camera.instance);
				// this.config.unrealBloomStrength = (Math.sin(this.time.elapsed * 0.004) * 1.5 + 5.5) * 0.1
				this.postProcess.unrealBloomPass.strength = (Math.sin(this.time.elapsed
																									* (this.config.unrealBloomMyPulseSpeed / 1000))
																									* this.config.unrealBloomMyWaveLength
																									+ (4 + this.config.unrealBloomMyWaveLength))
																									* this.config.unrealBloomMyStrength;
		}
		else {
				this.instance.render(this.scene, this.camera.instance);
		}

		if(this.stats) {
				this.stats.afterRender();
		}
	}

	destroy() {
		this.instance.renderLists.dispose();
		this.instance.dispose();
		this.renderTarget.dispose();
		this.postProcess.composer.renderTarget1.dispose();
		this.postProcess.composer.renderTarget2.dispose();
	}
}

class Camera {
	constructor(_options) {
		// Options
		this.experience = new Experience();
		this.config = this.experience.config;
		this.debug = this.experience.debug;
		this.time = this.experience.time;
		this.sizes = this.experience.sizes;
		this.targetElement = this.experience.targetElement;
		this.scene = this.experience.scene;

		// Set up
		this.mode = 'debug'; // defaultCamera \ debugCamera

		this.setInstance();
		this.setModes();
		// this.addDebug()
	}

	setInstance() {
		// Set up
		if(this.config){
		this.instance = new THREE.PerspectiveCamera(45, this.config.width / this.config.height, 0.1, 150);
		this.instance.rotation.reorder('YXZ');

		this.scene.add(this.instance);
	}else {
		this.setInstance();
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
		this.modes = {};
		//Follow
		this.modes.follow = {
			instance: this.instance.clone(),
			followTarget: null // This will be set to the boat object
		};

		// Default
		this.modes.default = {};
		this.modes.default.instance = this.instance.clone();
		this.modes.default.instance.rotation.reorder('YXZ');

		// Debug
		this.modes.debug = {};
		this.modes.debug.instance = this.instance.clone();
		this.modes.debug.instance.rotation.reorder('YXZ');
		this.modes.debug.instance.position.set(8,2, 8);
		this.modes.debug.instance.lookAt(0,-5, 0);  // Adjust the values if the model's center is not at the origin.


		this.modes.debug.orbitControls = new OrbitControls$1(this.modes.debug.instance, this.targetElement);
		this.modes.debug.orbitControls.enabled = true;
		this.modes.debug.orbitControls.enableKeys = true;
		this.modes.debug.orbitControls.screenSpacePanning = false;
		this.modes.debug.orbitControls.maxDistance = 11;
		this.setLifeCamera(this.config.lifeCamera);

		this.modes.debug.orbitControls.update();
	}

	setLifeCamera(bool) {
		if (bool) {
			this.modes.debug.orbitControls.enablePan = false;
			this.modes.debug.orbitControls.zoomSpeed = 0;
			this.modes.debug.orbitControls.rotateSpeed = 0.25;
			this.modes.debug.orbitControls.autoRotate = false;
			this.modes.debug.orbitControls.autoRotateSpeed = -0.5;
			this.modes.debug.orbitControls.enableDamping = true;
			this.modes.debug.orbitControls.dampingFactor = 0.01;
			this.modes.debug.orbitControls.minPolarAngle = (Math.PI / 4); 
			this.modes.debug.orbitControls.maxPolarAngle = (Math.PI/2)-.05;
			this.modes.debug.orbitControls.minDistance = 2.0;
		} else {
			this.modes.debug.orbitControls.enablePan = true;
			this.modes.debug.orbitControls.zoomSpeed = 1;
			this.modes.debug.orbitControls.rotateSpeed = 1;
			this.modes.debug.orbitControls.autoRotate = false;
			this.modes.debug.orbitControls.enableDamping = false;
			this.modes.debug.orbitControls.minPolarAngle = 0;
			this.modes.debug.orbitControls.maxPolarAngle = (Math.PI/2)-.05;
			this.modes.debug.orbitControls.minDistance = 0;
		}
	}

	addDebug() {
		if (this.debug && this.debug.cameraFolder) {
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'zoomSpeed',
					{ min: 0, max: 2, step: 0.05, label: 'Zoom Speed' });
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'rotateSpeed',
					{ min: 0, max: 2, step: 0.05, label: 'Rotate Speed' });
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'autoRotate',
					{ label: 'Auto Rotate' });
			this.debug.cameraFolder
				.addBinding(this.modes.debug.orbitControls, 'autoRotateSpeed',
					{ min: -5, max: 5, step: 0.1, label: 'Auto Rotate Speed' });

			this.debug.cameraFolder.addSeparator();
			
			this.debug.cameraFolder
				.addBinding(this.config, 'lifeCamera', { label: 'Life Camera' })
				.on('change', () => {
					this.setLifeCamera(this.config.lifeCamera);
					
				});
		}
	}

	resize() {
		this.instance.aspect = this.config.width / this.config.height;
		this.instance.updateProjectionMatrix();

		this.modes.default.instance.aspect = this.config.width / this.config.height;
		this.modes.default.instance.updateProjectionMatrix();

		this.modes.debug.instance.aspect = this.config.width / this.config.height;
		this.modes.debug.instance.updateProjectionMatrix();
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
		this.modes.debug.orbitControls.update();
		// //`Q ${this.instance.quaternion.y}, R ${this.instance.rotation.y}`);
		// Apply coordinates
		this.instance.position.copy(this.modes[this.mode].instance.position);
		this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion);
		this.instance.updateMatrixWorld(); // To be used in projection
	}
}

	destroy() {
		this.modes.debug.orbitControls.destroy();
	}
}

// vertexShader.js
const bakedVertexShader = `
varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
}`;

const bakedFragmentShader = `
uniform sampler2D uBakedColorTexture;
uniform sampler2D uBakedNeutralTexture;
uniform float uNeutralMix;

varying vec2 vUv;

void main() {
    vec3 bakedColor = texture2D(uBakedColorTexture, vUv).rgb;
    vec3 bakedNeutral = texture2D(uBakedNeutralTexture, vUv).rgb;

    vec3 mixColor = mix(bakedNeutral, bakedColor, uNeutralMix);

    gl_FragColor = vec4(mixColor, 1.0);
}`;

// import Fireflies from './Fireflies.js';

class Wagon {
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
                this.models.boat;
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
            this.models.row2.rotation.x = THREE.MathUtils.degToRad(180);
            this.models.row2.position.set(.6, -3, -.7);
            // Attach the row1 to the boat as a child
            this.models.boat.add(this.models.row2);
        }
    }
    toggleFreeMoving() {
        this.isFreeMoving = !this.isFreeMoving;
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
                           this.updateTextPanel(this.textMap[modelName]);
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

// OrbitControls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };
const _ray = new Ray();
const _plane = new Plane();
const TILT_LIMIT = Math.cos( 70 * MathUtils.DEG2RAD );

class OrbitControls extends EventDispatcher {

	constructor( object, domElement ) {

		super();

		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// How far you can dolly in and out ( PerspectiveCamera only )
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can zoom in and out ( OrthographicCamera only )
		this.minZoom = 0;
		this.maxZoom = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = - Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = false;
		this.dampingFactor = 0.05;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push
		this.zoomToCursor = false;

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();
		this.zoom0 = this.object.zoom;

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		//
		// public methods
		//

		this.getPolarAngle = function () {

			return spherical.phi;

		};

		this.getAzimuthalAngle = function () {

			return spherical.theta;

		};

		this.getDistance = function () {

			return this.object.position.distanceTo( this.target );

		};

		this.listenToKeyEvents = function ( domElement ) {

			domElement.addEventListener( 'keydown', onKeyDown );
			this._domElementKeyEvents = domElement;

		};

		this.stopListenToKeyEvents = function () {

			this._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
			this._domElementKeyEvents = null;

		};

		this.saveState = function () {

			scope.target0.copy( scope.target );
			scope.position0.copy( scope.object.position );
			scope.zoom0 = scope.object.zoom;

		};

		this.reset = function () {

			scope.target.copy( scope.target0 );
			scope.object.position.copy( scope.position0 );
			scope.object.zoom = scope.zoom0;

			scope.object.updateProjectionMatrix();
			scope.dispatchEvent( _changeEvent );

			scope.update();

			state = STATE.NONE;

		};

		// this method is exposed, but perhaps it would be better if we can make it private...
		this.update = function () {

			const offset = new Vector3();

			// so camera.up is the orbit axis
			const quat = new Quaternion().setFromUnitVectors( object.up, new Vector3( 0, 1, 0 ) );
			const quatInverse = quat.clone().invert();

			const lastPosition = new Vector3();
			const lastQuaternion = new Quaternion();
			const lastTargetPosition = new Vector3();

			const twoPI = 2 * Math.PI;

			return function update() {

				const position = scope.object.position;

				offset.copy( position ).sub( scope.target );

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion( quat );

				// angle from z-axis around y-axis
				spherical.setFromVector3( offset );

				if ( scope.autoRotate && state === STATE.NONE ) {

					rotateLeft( getAutoRotationAngle() );

				}

				if ( scope.enableDamping ) {

					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
					spherical.phi += sphericalDelta.phi * scope.dampingFactor;

				} else {

					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;

				}

				// restrict theta to be between desired limits

				let min = scope.minAzimuthAngle;
				let max = scope.maxAzimuthAngle;

				if ( isFinite( min ) && isFinite( max ) ) {

					if ( min < - Math.PI ) min += twoPI; else if ( min > Math.PI ) min -= twoPI;

					if ( max < - Math.PI ) max += twoPI; else if ( max > Math.PI ) max -= twoPI;

					if ( min <= max ) {

						spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );

					} else {

						spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
							Math.max( min, spherical.theta ) :
							Math.min( max, spherical.theta );

					}

				}

				// restrict phi to be between desired limits
				spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

				spherical.makeSafe();


				// move target to panned location

				if ( scope.enableDamping === true ) {

					scope.target.addScaledVector( panOffset, scope.dampingFactor );

				} else {

					scope.target.add( panOffset );

				}

				// adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
				// we adjust zoom later in these cases
				if ( scope.zoomToCursor && performCursorZoom || scope.object.isOrthographicCamera ) {

					spherical.radius = clampDistance( spherical.radius );

				} else {

					spherical.radius = clampDistance( spherical.radius * scale );

				}


				offset.setFromSpherical( spherical );

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion( quatInverse );

				position.copy( scope.target ).add( offset );

				scope.object.lookAt( scope.target );

				if ( scope.enableDamping === true ) {

					sphericalDelta.theta *= ( 1 - scope.dampingFactor );
					sphericalDelta.phi *= ( 1 - scope.dampingFactor );

					panOffset.multiplyScalar( 1 - scope.dampingFactor );

				} else {

					sphericalDelta.set( 0, 0, 0 );

					panOffset.set( 0, 0, 0 );

				}

				// adjust camera position
				let zoomChanged = false;
				if ( scope.zoomToCursor && performCursorZoom ) {

					let newRadius = null;
					if ( scope.object.isPerspectiveCamera ) {

						// move the camera down the pointer ray
						// this method avoids floating point error
						const prevRadius = offset.length();
						newRadius = clampDistance( prevRadius * scale );

						const radiusDelta = prevRadius - newRadius;
						scope.object.position.addScaledVector( dollyDirection, radiusDelta );
						scope.object.updateMatrixWorld();

					} else if ( scope.object.isOrthographicCamera ) {

						// adjust the ortho camera position based on zoom changes
						const mouseBefore = new Vector3( mouse.x, mouse.y, 0 );
						mouseBefore.unproject( scope.object );

						scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / scale ) );
						scope.object.updateProjectionMatrix();
						zoomChanged = true;

						const mouseAfter = new Vector3( mouse.x, mouse.y, 0 );
						mouseAfter.unproject( scope.object );

						scope.object.position.sub( mouseAfter ).add( mouseBefore );
						scope.object.updateMatrixWorld();

						newRadius = offset.length();

					} else {

						console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.' );
						scope.zoomToCursor = false;

					}

					// handle the placement of the target
					if ( newRadius !== null ) {

						if ( this.screenSpacePanning ) {

							// position the orbit target in front of the new camera position
							scope.target.set( 0, 0, - 1 )
								.transformDirection( scope.object.matrix )
								.multiplyScalar( newRadius )
								.add( scope.object.position );

						} else {

							// get the ray and translation plane to compute target
							_ray.origin.copy( scope.object.position );
							_ray.direction.set( 0, 0, - 1 ).transformDirection( scope.object.matrix );

							// if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
							// extremely large values
							if ( Math.abs( scope.object.up.dot( _ray.direction ) ) < TILT_LIMIT ) {

								object.lookAt( scope.target );

							} else {

								_plane.setFromNormalAndCoplanarPoint( scope.object.up, scope.target );
								_ray.intersectPlane( _plane, scope.target );

							}

						}

					}

				} else if ( scope.object.isOrthographicCamera ) {

					scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / scale ) );
					scope.object.updateProjectionMatrix();
					zoomChanged = true;

				}

				scale = 1;
				performCursorZoom = false;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if ( zoomChanged ||
					lastPosition.distanceToSquared( scope.object.position ) > EPS ||
					8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ||
					lastTargetPosition.distanceToSquared( scope.target ) > 0 ) {

					scope.dispatchEvent( _changeEvent );

					lastPosition.copy( scope.object.position );
					lastQuaternion.copy( scope.object.quaternion );
					lastTargetPosition.copy( scope.target );

					zoomChanged = false;

					return true;

				}

				return false;

			};

		}();

		this.dispose = function () {

			scope.domElement.removeEventListener( 'contextmenu', onContextMenu );

			scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
			scope.domElement.removeEventListener( 'pointercancel', onPointerUp );
			scope.domElement.removeEventListener( 'wheel', onMouseWheel );

			scope.domElement.removeEventListener( 'pointermove', onPointerMove );
			scope.domElement.removeEventListener( 'pointerup', onPointerUp );


			if ( scope._domElementKeyEvents !== null ) {

				scope._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );
				scope._domElementKeyEvents = null;

			}

			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

		};

		//
		// internals
		//

		const scope = this;

		const STATE = {
			NONE: - 1,
			ROTATE: 0,
			DOLLY: 1,
			PAN: 2,
			TOUCH_ROTATE: 3,
			TOUCH_PAN: 4,
			TOUCH_DOLLY_PAN: 5,
			TOUCH_DOLLY_ROTATE: 6
		};

		let state = STATE.NONE;

		const EPS = 0.000001;

		// current position in spherical coordinates
		const spherical = new Spherical();
		const sphericalDelta = new Spherical();

		let scale = 1;
		const panOffset = new Vector3();

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const panStart = new Vector2();
		const panEnd = new Vector2();
		const panDelta = new Vector2();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		const dollyDirection = new Vector3();
		const mouse = new Vector2();
		let performCursorZoom = false;

		const pointers = [];
		const pointerPositions = {};

		function getAutoRotationAngle() {

			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

		}

		function getZoomScale() {

			return Math.pow( 0.95, scope.zoomSpeed );

		}

		function rotateLeft( angle ) {

			sphericalDelta.theta -= angle;

		}

		function rotateUp( angle ) {

			sphericalDelta.phi -= angle;

		}

		const panLeft = function () {

			const v = new Vector3();

			return function panLeft( distance, objectMatrix ) {

				v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
				v.multiplyScalar( - distance );

				panOffset.add( v );

			};

		}();

		const panUp = function () {

			const v = new Vector3();

			return function panUp( distance, objectMatrix ) {

				if ( scope.screenSpacePanning === true ) {

					v.setFromMatrixColumn( objectMatrix, 1 );

				} else {

					v.setFromMatrixColumn( objectMatrix, 0 );
					v.crossVectors( scope.object.up, v );

				}

				v.multiplyScalar( distance );

				panOffset.add( v );

			};

		}();

		// deltaX and deltaY are in pixels; right and down are positive
		const pan = function () {

			const offset = new Vector3();

			return function pan( deltaX, deltaY ) {

				const element = scope.domElement;

				if ( scope.object.isPerspectiveCamera ) {

					// perspective
					const position = scope.object.position;
					offset.copy( position ).sub( scope.target );
					let targetDistance = offset.length();

					// half of the fov is center to top of screen
					targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

					// we use only clientHeight here so aspect ratio does not distort speed
					panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
					panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

				} else if ( scope.object.isOrthographicCamera ) {

					// orthographic
					panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
					panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

				} else {

					// camera neither orthographic nor perspective
					console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
					scope.enablePan = false;

				}

			};

		}();

		function dollyOut( dollyScale ) {

			if ( scope.object.isPerspectiveCamera || scope.object.isOrthographicCamera ) {

				scale /= dollyScale;

			} else {

				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
				scope.enableZoom = false;

			}

		}

		function dollyIn( dollyScale ) {

			if ( scope.object.isPerspectiveCamera || scope.object.isOrthographicCamera ) {

				scale *= dollyScale;

			} else {

				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
				scope.enableZoom = false;

			}

		}

		function updateMouseParameters( event ) {

			if ( ! scope.zoomToCursor ) {

				return;

			}

			performCursorZoom = true;

			const rect = scope.domElement.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const w = rect.width;
			const h = rect.height;

			mouse.x = ( x / w ) * 2 - 1;
			mouse.y = - ( y / h ) * 2 + 1;

			dollyDirection.set( mouse.x, mouse.y, 1 ).unproject( object ).sub( object.position ).normalize();

		}

		function clampDistance( dist ) {

			return Math.max( scope.minDistance, Math.min( scope.maxDistance, dist ) );

		}

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate( event ) {

			rotateStart.set( event.clientX, event.clientY );

		}

		function handleMouseDownDolly( event ) {

			updateMouseParameters( event );
			dollyStart.set( event.clientX, event.clientY );

		}

		function handleMouseDownPan( event ) {

			panStart.set( event.clientX, event.clientY );

		}

		function handleMouseMoveRotate( event ) {

			rotateEnd.set( event.clientX, event.clientY );

			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

			const element = scope.domElement;

			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

			rotateStart.copy( rotateEnd );

			scope.update();

		}

		function handleMouseMoveDolly( event ) {

			dollyEnd.set( event.clientX, event.clientY );

			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				dollyOut( getZoomScale() );

			} else if ( dollyDelta.y < 0 ) {

				dollyIn( getZoomScale() );

			}

			dollyStart.copy( dollyEnd );

			scope.update();

		}

		function handleMouseMovePan( event ) {

			panEnd.set( event.clientX, event.clientY );

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

			pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

			scope.update();

		}

		function handleMouseWheel( event ) {

			updateMouseParameters( event );

			if ( event.deltaY < 0 ) {

				dollyIn( getZoomScale() );

			} else if ( event.deltaY > 0 ) {

				dollyOut( getZoomScale() );

			}

			scope.update();

		}

		function handleKeyDown( event ) {

			let needsUpdate = false;

			switch ( event.code ) {

				case scope.keys.UP:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						rotateUp( 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight );

					} else {

						pan( 0, scope.keyPanSpeed );

					}

					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						rotateUp( - 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight );

					} else {

						pan( 0, - scope.keyPanSpeed );

					}

					needsUpdate = true;
					break;

				case scope.keys.LEFT:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						rotateLeft( 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight );

					} else {

						pan( scope.keyPanSpeed, 0 );

					}

					needsUpdate = true;
					break;

				case scope.keys.RIGHT:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						rotateLeft( - 2 * Math.PI * scope.rotateSpeed / scope.domElement.clientHeight );

					} else {

						pan( - scope.keyPanSpeed, 0 );

					}

					needsUpdate = true;
					break;

			}

			if ( needsUpdate ) {

				// prevent the browser from scrolling on cursor keys
				event.preventDefault();

				scope.update();

			}


		}

		function handleTouchStartRotate() {

			if ( pointers.length === 1 ) {

				rotateStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

			} else {

				const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
				const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

				rotateStart.set( x, y );

			}

		}

		function handleTouchStartPan() {

			if ( pointers.length === 1 ) {

				panStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

			} else {

				const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
				const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

				panStart.set( x, y );

			}

		}

		function handleTouchStartDolly() {

			const dx = pointers[ 0 ].pageX - pointers[ 1 ].pageX;
			const dy = pointers[ 0 ].pageY - pointers[ 1 ].pageY;

			const distance = Math.sqrt( dx * dx + dy * dy );

			dollyStart.set( 0, distance );

		}

		function handleTouchStartDollyPan() {

			if ( scope.enableZoom ) handleTouchStartDolly();

			if ( scope.enablePan ) handleTouchStartPan();

		}

		function handleTouchStartDollyRotate() {

			if ( scope.enableZoom ) handleTouchStartDolly();

			if ( scope.enableRotate ) handleTouchStartRotate();

		}

		function handleTouchMoveRotate( event ) {

			if ( pointers.length == 1 ) {

				rotateEnd.set( event.pageX, event.pageY );

			} else {

				const position = getSecondPointerPosition( event );

				const x = 0.5 * ( event.pageX + position.x );
				const y = 0.5 * ( event.pageY + position.y );

				rotateEnd.set( x, y );

			}

			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

			const element = scope.domElement;

			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

			rotateStart.copy( rotateEnd );

		}

		function handleTouchMovePan( event ) {

			if ( pointers.length === 1 ) {

				panEnd.set( event.pageX, event.pageY );

			} else {

				const position = getSecondPointerPosition( event );

				const x = 0.5 * ( event.pageX + position.x );
				const y = 0.5 * ( event.pageY + position.y );

				panEnd.set( x, y );

			}

			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

			pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		function handleTouchMoveDolly( event ) {

			const position = getSecondPointerPosition( event );

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;

			const distance = Math.sqrt( dx * dx + dy * dy );

			dollyEnd.set( 0, distance );

			dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

			dollyOut( dollyDelta.y );

			dollyStart.copy( dollyEnd );

		}

		function handleTouchMoveDollyPan( event ) {

			if ( scope.enableZoom ) handleTouchMoveDolly( event );

			if ( scope.enablePan ) handleTouchMovePan( event );

		}

		function handleTouchMoveDollyRotate( event ) {

			if ( scope.enableZoom ) handleTouchMoveDolly( event );

			if ( scope.enableRotate ) handleTouchMoveRotate( event );

		}

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			if ( pointers.length === 0 ) {

				scope.domElement.setPointerCapture( event.pointerId );

				scope.domElement.addEventListener( 'pointermove', onPointerMove );
				scope.domElement.addEventListener( 'pointerup', onPointerUp );

			}

			//

			addPointer( event );

			if ( event.pointerType === 'touch' ) {

				onTouchStart( event );

			} else {

				onMouseDown( event );

			}

		}

		function onPointerMove( event ) {

			if ( scope.enabled === false ) return;

			if ( event.pointerType === 'touch' ) {

				onTouchMove( event );

			} else {

				onMouseMove( event );

			}

		}

		function onPointerUp( event ) {

			removePointer( event );

			if ( pointers.length === 0 ) {

				scope.domElement.releasePointerCapture( event.pointerId );

				scope.domElement.removeEventListener( 'pointermove', onPointerMove );
				scope.domElement.removeEventListener( 'pointerup', onPointerUp );

			}

			scope.dispatchEvent( _endEvent );

			state = STATE.NONE;

		}

		function onMouseDown( event ) {

			let mouseAction;

			switch ( event.button ) {

				case 0:

					mouseAction = scope.mouseButtons.LEFT;
					break;

				case 1:

					mouseAction = scope.mouseButtons.MIDDLE;
					break;

				case 2:

					mouseAction = scope.mouseButtons.RIGHT;
					break;

				default:

					mouseAction = - 1;

			}

			switch ( mouseAction ) {

				case MOUSE.DOLLY:

					if ( scope.enableZoom === false ) return;

					handleMouseDownDolly( event );

					state = STATE.DOLLY;

					break;

				case MOUSE.ROTATE:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						if ( scope.enablePan === false ) return;

						handleMouseDownPan( event );

						state = STATE.PAN;

					} else {

						if ( scope.enableRotate === false ) return;

						handleMouseDownRotate( event );

						state = STATE.ROTATE;

					}

					break;

				case MOUSE.PAN:

					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

						if ( scope.enableRotate === false ) return;

						handleMouseDownRotate( event );

						state = STATE.ROTATE;

					} else {

						if ( scope.enablePan === false ) return;

						handleMouseDownPan( event );

						state = STATE.PAN;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if ( state !== STATE.NONE ) {

				scope.dispatchEvent( _startEvent );

			}

		}

		function onMouseMove( event ) {

			switch ( state ) {

				case STATE.ROTATE:

					if ( scope.enableRotate === false ) return;

					handleMouseMoveRotate( event );

					break;

				case STATE.DOLLY:

					if ( scope.enableZoom === false ) return;

					handleMouseMoveDolly( event );

					break;

				case STATE.PAN:

					if ( scope.enablePan === false ) return;

					handleMouseMovePan( event );

					break;

			}

		}

		function onMouseWheel( event ) {

			if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

			event.preventDefault();

			scope.dispatchEvent( _startEvent );

			handleMouseWheel( event );

			scope.dispatchEvent( _endEvent );

		}

		function onKeyDown( event ) {

			if ( scope.enabled === false || scope.enablePan === false ) return;

			handleKeyDown( event );

		}

		function onTouchStart( event ) {

			trackPointer( event );

			switch ( pointers.length ) {

				case 1:

					switch ( scope.touches.ONE ) {

						case TOUCH.ROTATE:

							if ( scope.enableRotate === false ) return;

							handleTouchStartRotate();

							state = STATE.TOUCH_ROTATE;

							break;

						case TOUCH.PAN:

							if ( scope.enablePan === false ) return;

							handleTouchStartPan();

							state = STATE.TOUCH_PAN;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				case 2:

					switch ( scope.touches.TWO ) {

						case TOUCH.DOLLY_PAN:

							if ( scope.enableZoom === false && scope.enablePan === false ) return;

							handleTouchStartDollyPan();

							state = STATE.TOUCH_DOLLY_PAN;

							break;

						case TOUCH.DOLLY_ROTATE:

							if ( scope.enableZoom === false && scope.enableRotate === false ) return;

							handleTouchStartDollyRotate();

							state = STATE.TOUCH_DOLLY_ROTATE;

							break;

						default:

							state = STATE.NONE;

					}

					break;

				default:

					state = STATE.NONE;

			}

			if ( state !== STATE.NONE ) {

				scope.dispatchEvent( _startEvent );

			}

		}

		function onTouchMove( event ) {

			trackPointer( event );

			switch ( state ) {

				case STATE.TOUCH_ROTATE:

					if ( scope.enableRotate === false ) return;

					handleTouchMoveRotate( event );

					scope.update();

					break;

				case STATE.TOUCH_PAN:

					if ( scope.enablePan === false ) return;

					handleTouchMovePan( event );

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_PAN:

					if ( scope.enableZoom === false && scope.enablePan === false ) return;

					handleTouchMoveDollyPan( event );

					scope.update();

					break;

				case STATE.TOUCH_DOLLY_ROTATE:

					if ( scope.enableZoom === false && scope.enableRotate === false ) return;

					handleTouchMoveDollyRotate( event );

					scope.update();

					break;

				default:

					state = STATE.NONE;

			}

		}

		function onContextMenu( event ) {

			if ( scope.enabled === false ) return;

			event.preventDefault();

		}

		function addPointer( event ) {

			pointers.push( event );

		}

		function removePointer( event ) {

			delete pointerPositions[ event.pointerId ];

			for ( let i = 0; i < pointers.length; i ++ ) {

				if ( pointers[ i ].pointerId == event.pointerId ) {

					pointers.splice( i, 1 );
					return;

				}

			}

		}

		function trackPointer( event ) {

			let position = pointerPositions[ event.pointerId ];

			if ( position === undefined ) {

				position = new Vector2();
				pointerPositions[ event.pointerId ] = position;

			}

			position.set( event.pageX, event.pageY );

		}

		function getSecondPointerPosition( event ) {

			const pointer = ( event.pointerId === pointers[ 0 ].pointerId ) ? pointers[ 1 ] : pointers[ 0 ];

			return pointerPositions[ pointer.pointerId ];

		}

		//

		scope.domElement.addEventListener( 'contextmenu', onContextMenu );

		scope.domElement.addEventListener( 'pointerdown', onPointerDown );
		scope.domElement.addEventListener( 'pointercancel', onPointerUp );
		scope.domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );

		// force an update at start

		this.update();

	}

}

/**
 * Work based on :
 * https://github.com/Slayvin: Flat mirror for three.js
 * https://home.adelphi.edu/~stemkoski/ : An implementation of water shader based on the flat mirror
 * http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

class Water extends Mesh {

	constructor( geometry, options = {} ) {

		super( geometry );

		this.isWater = true;

		const scope = this;

		const textureWidth = options.textureWidth !== undefined ? options.textureWidth : 512;
		const textureHeight = options.textureHeight !== undefined ? options.textureHeight : 512;

		const clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const time = options.time !== undefined ? options.time : 0.0;
		const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
		const sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3( 0.70707, 0.70707, 0.0 );
		const sunColor = new Color( options.sunColor !== undefined ? options.sunColor : 0x623281  );
		const waterColor = new Color( options.waterColor !== undefined ? options.waterColor : 0x001e0f  );
		const eye = options.eye !== undefined ? options.eye : new Vector3( 0, 0, 0 );
		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : FrontSide;
		const fog = options.fog !== undefined ? options.fog : false;

		//

		const mirrorPlane = new Plane();
		const normal = new Vector3();
		const mirrorWorldPosition = new Vector3();
		const cameraWorldPosition = new Vector3();
		const rotationMatrix = new Matrix4();
		const lookAtPosition = new Vector3( 0, 0, - 1 );
		const clipPlane = new Vector4();

		const view = new Vector3();
		const target = new Vector3();
		const q = new Vector4();

		const textureMatrix = new Matrix4();

		const mirrorCamera = new PerspectiveCamera();

		const renderTarget = new WebGLRenderTarget( textureWidth, textureHeight );

		const mirrorShader = {

			uniforms: UniformsUtils.merge( [
				UniformsLib[ 'fog' ],
				UniformsLib[ 'lights' ],
				{
					'normalSampler': { value: null },
					'mirrorSampler': { value: null },
					'alpha': { value: 1.0 },
					'time': { value: 0.0 },
					'size': { value: 10 },
					'distortionScale': { value: 20.0 },
					'textureMatrix': { value: new Matrix4() },
					'sunColor': { value: new Color( 0x623281  ) },
					'sunDirection': { value: new Vector3( 0.70707, 0.70707, 0 ) },
					'eye': { value: new Vector3() },
					'waterColor': { value: new Color( 0x74ccf4  ) }
				}
			] ),

			vertexShader: /* glsl */`
				uniform mat4 textureMatrix;
				uniform float time;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				#include <common>
				#include <fog_pars_vertex>
				#include <shadowmap_pars_vertex>
				#include <logdepthbuf_pars_vertex>

				void main() {
					mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;

				#include <beginnormal_vertex>
				#include <defaultnormal_vertex>
				#include <logdepthbuf_vertex>
				#include <fog_vertex>
				#include <shadowmap_vertex>
			}`,

			fragmentShader: /* glsl */`
				uniform sampler2D mirrorSampler;
				uniform float alpha;
				uniform float time;
				uniform float size;
				uniform float distortionScale;
				uniform sampler2D normalSampler;
				uniform vec3 sunColor;
				uniform vec3 sunDirection;
				uniform vec3 eye;
				uniform vec3 waterColor;

				varying vec4 mirrorCoord;
				varying vec4 worldPosition;

				vec4 getNoise( vec2 uv ) {
					vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
					vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
					vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
					vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
					vec4 noise = texture2D( normalSampler, uv0 ) +
						texture2D( normalSampler, uv1 ) +
						texture2D( normalSampler, uv2 ) +
						texture2D( normalSampler, uv3 );
					return noise * 0.5 - 1.0;
				}

				void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
					vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
					float direction = max( 0.0, dot( eyeDirection, reflection ) );
					specularColor += pow( direction, shiny ) * sunColor * spec;
					diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
				}

				#include <common>
				#include <packing>
				#include <bsdfs>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <lights_pars_begin>
				#include <shadowmap_pars_fragment>
				#include <shadowmask_pars_fragment>

				void main() {

					#include <logdepthbuf_fragment>
					vec4 noise = getNoise( worldPosition.xz * size );
					vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

					vec3 diffuseLight = vec3(0.0);
					vec3 specularLight = vec3(0.0);

					vec3 worldToEye = eye-worldPosition.xyz;
					vec3 eyeDirection = normalize( worldToEye );
					sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

					float distance = length(worldToEye);

					vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
					vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

					float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
					float rf0 = 0.3;
					float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
					vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
					vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
					vec3 outgoingLight = albedo;
					gl_FragColor = vec4( outgoingLight, alpha );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <fog_fragment>	
				}`

		};

		const material = new ShaderMaterial( {
			fragmentShader: mirrorShader.fragmentShader,
			vertexShader: mirrorShader.vertexShader,
			uniforms: UniformsUtils.clone( mirrorShader.uniforms ),
			lights: true,
			side: side,
			fog: fog
		} );

		material.uniforms[ 'mirrorSampler' ].value = renderTarget.texture;
		material.uniforms[ 'textureMatrix' ].value = textureMatrix;
		material.uniforms[ 'alpha' ].value = alpha;
		material.uniforms[ 'time' ].value = time;
		material.uniforms[ 'normalSampler' ].value = normalSampler;
		material.uniforms[ 'sunColor' ].value = sunColor;
		material.uniforms[ 'waterColor' ].value = waterColor;
		material.uniforms[ 'sunDirection' ].value = sunDirection;
		material.uniforms[ 'distortionScale' ].value = distortionScale;

		material.uniforms[ 'eye' ].value = eye;

		scope.material = material;

		scope.onBeforeRender = function ( renderer, scene, camera ) {

			mirrorWorldPosition.setFromMatrixPosition( scope.matrixWorld );
			cameraWorldPosition.setFromMatrixPosition( camera.matrixWorld );

			rotationMatrix.extractRotation( scope.matrixWorld );

			normal.set( 0, 0, 1 );
			normal.applyMatrix4( rotationMatrix );

			view.subVectors( mirrorWorldPosition, cameraWorldPosition );

			// Avoid rendering when mirror is facing away

			if ( view.dot( normal ) > 0 ) return;

			view.reflect( normal ).negate();
			view.add( mirrorWorldPosition );

			rotationMatrix.extractRotation( camera.matrixWorld );

			lookAtPosition.set( 0, 0, - 1 );
			lookAtPosition.applyMatrix4( rotationMatrix );
			lookAtPosition.add( cameraWorldPosition );

			target.subVectors( mirrorWorldPosition, lookAtPosition );
			target.reflect( normal ).negate();
			target.add( mirrorWorldPosition );

			mirrorCamera.position.copy( view );
			mirrorCamera.up.set( 0, 1, 0 );
			mirrorCamera.up.applyMatrix4( rotationMatrix );
			mirrorCamera.up.reflect( normal );
			mirrorCamera.lookAt( target );

			mirrorCamera.far = camera.far; // Used in WebGLBackground

			mirrorCamera.updateMatrixWorld();
			mirrorCamera.projectionMatrix.copy( camera.projectionMatrix );

			// Update the texture matrix
			textureMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
			textureMatrix.multiply( mirrorCamera.projectionMatrix );
			textureMatrix.multiply( mirrorCamera.matrixWorldInverse );

			// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
			// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
			mirrorPlane.setFromNormalAndCoplanarPoint( normal, mirrorWorldPosition );
			mirrorPlane.applyMatrix4( mirrorCamera.matrixWorldInverse );

			clipPlane.set( mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant );

			const projectionMatrix = mirrorCamera.projectionMatrix;

			q.x = ( Math.sign( clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
			q.y = ( Math.sign( clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
			q.z = - 1.0;
			q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

			// Calculate the scaled plane vector
			clipPlane.multiplyScalar( 2.0 / clipPlane.dot( q ) );

			// Replacing the third row of the projection matrix
			projectionMatrix.elements[ 2 ] = clipPlane.x;
			projectionMatrix.elements[ 6 ] = clipPlane.y;
			projectionMatrix.elements[ 10 ] = clipPlane.z + 1.0 - clipBias;
			projectionMatrix.elements[ 14 ] = clipPlane.w;

			eye.setFromMatrixPosition( camera.matrixWorld );

			// Render

			const currentRenderTarget = renderer.getRenderTarget();

			const currentXrEnabled = renderer.xr.enabled;
			const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

			scope.visible = false;

			renderer.xr.enabled = false; // Avoid camera modification and recursion
			renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

			renderer.setRenderTarget( renderTarget );

			renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

			if ( renderer.autoClear === false ) renderer.clear();
			renderer.render( scene, mirrorCamera );

			scope.visible = true;

			renderer.xr.enabled = currentXrEnabled;
			renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

			renderer.setRenderTarget( currentRenderTarget );

			// Restore viewport

			const viewport = camera.viewport;

			if ( viewport !== undefined ) {

				renderer.state.viewport( viewport );

			}

		};

	}

}

/**
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * https://www.researchgate.net/publication/220720443_A_Practical_Analytic_Model_for_Daylight
 *
 * First implemented by Simon Wallner
 * http://simonwallner.at/project/atmospheric-scattering/
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/

class Sky extends Mesh {

	constructor() {
	
		const shader = Sky.SkyShader;
		// this.camera= ;
		// //this.camera.instance.position);
		const material = new ShaderMaterial({
			name: 'SkyShader',
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: UniformsUtils.clone(shader.uniforms),
			side: BackSide,
			depthWrite: false
		});

		super(new BoxGeometry(1, 1, 1), material);
		this.experience= new Experience();
		this.material.uniforms.cameraPos.value.copy(this.experience.camera.instance.position);
		this.isSky = true;

	}

}


Sky.SkyShader = {

	uniforms: {
		'turbidity': { value: 2 },
		'rayleigh': { value: 1 },
		'mieCoefficient': { value: 0.005 },
		'mieDirectionalG': { value: 0.8 },
		'sunPosition': { value: new Vector3() },
		'up': { value: new Vector3(0, 1, 0) },
		'cameraPos': { value: new Vector3() },
		'sunColor': { value: new Vector3(1, 0.16, 0.25) }
	},

	vertexShader: /* glsl */`
		uniform vec3 sunPosition;
		uniform float rayleigh;
		uniform float turbidity;
		uniform float mieCoefficient;
		uniform vec3 up;
		uniform vec3 camerapos;
		uniform vec3 sunColor;

		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;

		// constants for atmospheric scattering
		const float e = 2.71828182845904523536028747135266249775724709369995957;
		const float pi = 3.141592653589793238462643383279502884197169;

		// wavelength of used primaries, according to preetham
		const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
		// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
		// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
		const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

		// mie stuff
		// K coefficient for the primaries
		const float v = 4.0;
		const vec3 K = vec3( 0.686, 0.678, 0.666 );
		// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
		const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

		// earth shadow hack
		// cutoffAngle = pi / 1.95;
		const float cutoffAngle = 1.6110731556870734;
		const float steepness = 1.5;
		const float EE = 1000.0;

		float sunIntensity( float zenithAngleCos ) {
			zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
			return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
		}

		vec3 totalMie( float T ) {
			float c = ( 0.2 * T ) * 10E-18;
			return 0.434 * c * MieConst;
		}

		void main() {

			vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
			vWorldPosition = worldPosition.xyz;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			gl_Position.z = gl_Position.w; // set z to camera.far

			vSunDirection = normalize( sunPosition );

			vSunE = sunIntensity( dot( vSunDirection, up ) );

			vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

			float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

			// extinction (absorbtion + out scattering)
			// rayleigh coefficients
			vBetaR = totalRayleigh * rayleighCoefficient;

			// mie coefficients
			vBetaM = totalMie( turbidity ) * mieCoefficient;

		}`,

	fragmentShader: /* glsl */`
		varying vec3 vWorldPosition;
		varying vec3 vSunDirection;
		varying float vSunfade;
		varying vec3 vBetaR;
		varying vec3 vBetaM;
		varying float vSunE;
		// Sun rendering logic
		uniform vec3 cameraPos; // Add this uniform for sun calculation
		uniform vec3 sunColor; // Color of the sun, can be adjusted for different times of day

		uniform float mieDirectionalG;
		uniform vec3 up;

		// constants for atmospheric scattering
		const float pi = 3.141592653589793238462643383279502884197169;

		const float n = 1.0003; // refractive index of air
		const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

		// optical length at zenith for molecules
		const float rayleighZenithLength = 8.4E3;
		const float mieZenithLength = 1.25E3;
		// 66 arc seconds -> degrees, and the cosine of that
		const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

		// 3.0 / ( 16.0 * pi )
		const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
		// 1.0 / ( 4.0 * pi )
		const float ONE_OVER_FOURPI = 0.07957747154594767;

		float rayleighPhase( float cosTheta ) {
			return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
		}

		float hgPhase( float cosTheta, float g ) {
			float g2 = pow( g, 2.0 );
			float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
			return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
		}
		
	
		// Function to calculate the sun's color based on its position
		vec3 calculateSunColor(vec3 direction, vec3 sunDir, vec3 color) {
			float intensity = max(dot(direction, sunDir), 0.0);
			return color * intensity;
		}
		void main() {

			vec3 direction = normalize( vWorldPosition - cameraPos );

			// optical length
			// cutoff angle at 90 to avoid singularity in next formula.
			float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
			float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
			float sR = rayleighZenithLength * inverse;
			float sM = mieZenithLength * inverse;

			// combined extinction factor
			vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

			// in scattering
			float cosTheta = dot( direction, vSunDirection );

			float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
			vec3 betaRTheta = vBetaR * rPhase;

			float mPhase = hgPhase( cosTheta, mieDirectionalG );
			vec3 betaMTheta = vBetaM * mPhase;

			vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
			Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

			// nightsky
			float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
			float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
			vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
			vec3 L0 = vec3( 0.1 ) * Fex;

			// composition + solar disc
			float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
			L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

			vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

			vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

			vec3 finalSunColor = calculateSunColor(direction, vSunDirection, sunColor);
			vec3 skyColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) ); // Use your calculated sky color here
			vec3 finalColor = mix(skyColor, finalSunColor, finalSunColor.b);
	
			gl_FragColor = vec4( finalColor, 1.0 );
	
			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`

};

class OceanScene {
        constructor() {
    
            this.init();
            this.animate();
            this.time = 0.45; // Start at the beginning of the day
            this.azimuthSpeed = 0.7;
            this.speed = 0.0009;
            this.parameters.azimuth = -137.0;
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
        dom.overFLow = 'auto';
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
            this.camera = Experience.instance.camera.instance;

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
                this.azimuthSpeed = 0.008;
            } else {
                this.speed = 0.001;
                this.azimuthSpeed = 0.08;
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

            if (intersects.length > 0) ;
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

class World {
	constructor(_options) {
		this.experience = new Experience();
		this.resources = this.experience.resources;
		this.debug = this.experience.debug;
		this.config = this.experience.config;
		this.scene = this.experience.scene;
		this.time = this.experience.time;
		this.clock = new THREE.Clock();
		this.sizes = this.experience.sizes;
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		
		this.resources.on('groupEnd', (_group) => {
			if (_group.name === 'asset') {
				
				this.setOcean();
			
				this.setWagon();
				
				//this.setWordsShadow()
				//this.setGradientShadow()
				this.setFireflies();
		

					
	

			}
		});
	}
    
	//setHelpers() { this.helpers = new Helpers() }
	setWagon() { 
		this.wagon = new Wagon(); }
		setFireflies() { 
			// this.fireflies = new Fireflies()
		 }
	

	addStar() {
		this.star = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 3, 3),
			new THREE.MeshBasicMaterial({ color: '#fff' }),
			);
		this.star.position.set(10, 7, 7);
		this.star.scale.set(0.3, 0.3, 0.3);

		this.scene.add(this.star);
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
			this.fireflies.update();
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
							child.material.wireframe = this.config.wireframe;
						}
					}
					for (const child of this.informers.models.children) {
						// //child);
						if (child.material) {
							child.material.wireframe = this.config.wireframe;
						}
					}
				});
			this.debug.worldFolder
				.addInput(this.config, 'neutral', { min: 0, max: 1, step: 0.1, label: 'Wagon' })
				.on('change', () => {
					this.wagon.model.pack1.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.wagon.model.pack2.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.trees.model.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.grass.model.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.owlEyes.model.material.uniforms.uNeutralMix.value = this.config.neutral;
				});
			this.debug.worldFolder
				.addInput(this.config, 'neutral', { min: 0, max: 1, step: 0.1, label: 'Lights' })
				.on('change', () => {
					this.windows.model.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.fire.model.material.uniforms.uNeutralMix.value = this.config.neutral;
					this.portal.model.material.uniforms.uNeutralMix.value = this.config.neutral;
				});

			this.debug.worldFolder.addSeparator();
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
					this.windows.model.material.uniforms.uColor.value.set(this.config.lightColor);
				});
			this.debug.worldFolder
				.addInput(this.config, 'firefliersColor', { view: 'color', label: 'Fireflies' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uColor.value.set(this.config.firefliersColor);
				});
			this.debug.worldFolder
				.addInput(this.config, 'fireColorUp', { view: 'color', label: 'Fire Top' })
				.on('change', () => {
					this.fire.model.material.uniforms.uColorUp.value.set(this.config.fireColorUp);
				});
			this.debug.worldFolder
				.addInput(this.config, 'fireColorDown', { view: 'color', label: 'Fire Bottom' })
				.on('change', () => {
					this.fire.model.material.uniforms.uColorDown.value.set(this.config.fireColorDown);
				});
			this.debug.worldFolder
				.addInput(this.config, 'shadowColor', { view: 'color', label: 'Shadow' })
				.on('change', () => {
					this.gradientShadow.model.material.uniforms.uColorShadow.value.set(this.config.shadowColor);
				});
			this.debug.worldFolder
				.addInput(this.config, 'wordsShadowColor', { view: 'color', label: 'Text Shadow' })
				.on('change', () => {
					this.wordsShadow.model.material.color.set(this.config.wordsShadowColor);
				});

			this.debug.worldFolder.addSeparator();

			this.debug.worldFolder
				.addInput(this.config, 'firefliesSize', { min: 40, max: 1000, step: 10, label: 'Fireflies Size' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uSize.value = this.config.firefliesSize;
				});
			this.debug.worldFolder
				.addInput(this.config, 'firefliesSpeed', { min: 0, max: 80, step: 1, label: 'Fireflies Speed' })
				.on('change', () => {
					this.fireflies.model.material.uniforms.uTimeFrequency.value = this.config.firefliesSpeed / 10000;
				});
		}
	}

	resize() { }
	destroy() { }
}

class Events {
	constructor(_options) {
		this.experience = new Experience();
		this.resources = this.experience.resources;
		this.debug = this.experience.debug;
		this.camera = this.experience.camera;
		this.config = this.experience.config;
		this.world = this.experience.world;
		this.raycaster = this.experience.raycaster;
		this.time = this.experience.time;
		this.clock = new THREE.Clock();
		this.sizes = this.experience.sizes;

		// this.setIKeyEvent()
		this.setLoaderViewer();
		this.setCursorPosition();
		this.setIconActiveEvent();
	}

	setIKeyEvent() {
		this.config.html_iKey.onmouseenter = () => {
			//'iKey enter');
		};
		this.config.html_iKey.onmouseleave = () => {
			//'iKey leave');
		};
		this.config.html_iKey.onclick = () => {
			//'iKey click');
		};
	}

	setLoaderViewer() {
		this.config.html_loaderKey.onclick = () => {
			if (this.config.loaderIsHidden) {
				this.config.html_loader.classList.remove('unvisible');
				this.config.loaderIsHidden = false;
				this.debugMemory = this.debug.expanded;
				this.debug.expanded = false;
			} else {
				this.config.html_loader.classList.add('unvisible');
				this.config.loaderIsHidden = true;
				if (this.debugMemory) {
					this.debug.expanded = true;
				}
			}
		};
	}

	setCursorPosition() {
		this.cursorPosition = new THREE.Vector2();
		window.addEventListener('mousemove', (event) => {
			//"moved")
			this.cursorPosition.x = event.clientX / this.sizes.width * 2 - 1;
			this.cursorPosition.y = -(event.clientY / this.sizes.height * 2 - 1);
		}, { passive: true });
	}

	setIconActiveEvent() {
		window.addEventListener('click', () => {
			if (this.config.hoverTarget)
			{
				if (this.config.activeTarget) {
					this.world.informers[`${this.config.activeTarget}`].material.uniforms.uActiveMix.value = 1;
				}
				this.config.activeTarget = this.config.hoverTarget;

				this.world.informers[`${this.config.activeTarget}`].material.uniforms.uActiveMix.value = 0;
				htmlInformer.innerHTML = this.config[`${this.config.activeTarget}`];
				this.config.html_textBlock.classList.add('visible');
				this.config.html_textBlock.classList.add('active');
			}

			if (!this.config.hoverTarget)
			{
				if (this.config.activeTarget) {
					this.world.informers[`${this.config.activeTarget}`].material.uniforms.uActiveMix.value = 1;
					this.config.html_textBlock.classList.remove('visible');
					this.config.html_textBlock.classList.remove('active');

					this.config.activeTarget = null;
				}
			}
		});
	}

	update() {
		if (this.config.loaderIsHidden) {
			this.raycaster.setFromCamera(this.cursorPosition, this.camera.instance);
			this.intersects = this.raycaster.intersectObjects(
				[
				//this.world.informers.models,
				//this.world.informers.targets,
				//this.world.wagon.model.pack1,
				//this.world.trees.model,
				//this.world.portal.model,
				], true);

			if (this.intersects.length && this.intersects[0].object.name !== 'wagon')
			{
				this.config.hoverTarget = this.intersects[0].object.name;

				this.world.informers[`${this.config.hoverTarget}`].material.uniforms.uActiveMix.value = 0;

				if (!this.config.activeTarget) {
					htmlInformer.innerHTML = this.config[`${this.config.hoverTarget}`];
					this.config.html_textBlock.classList.add('visible');
				}
			}
			else
			{
				if (this.config.hoverTarget && this.config.hoverTarget !== this.config.activeTarget) {
					this.world.informers[`${this.config.hoverTarget}`].material.uniforms.uActiveMix.value = 1;
				}

				if (!this.config.activeTarget) {
					this.config.html_textBlock.classList.remove('visible');
				}

				this.config.hoverTarget = null;
			}

			// Activate portal
			if (this.intersects.length && this.intersects[0].object.name === 'icoGithub') {
				this.config.portalActive = true;
			} else { this.config.portalActive = false; }
		}
	}
}

const assets = [
	
	{
		name: 'asset',
		data: {},
		items: [
			// Base
			{ name: 'wagonModel', source: '/models_new.glb', type: 'glb' },
			
			{ name: 'wagonTexturePack1', source: '/boat.jpg', type: 'texture' },
			{ name: 'wagonTexturePack2', source: '/Gate1.jpg', type: 'texture' },
			{ name: 'wagonTexturePack3', source: '/Gate02.png', type: 'texture' },
			{ name: 'wagonTexturePack4', source: '/india.jpg', type: 'texture' },
			{ name: 'wagonTexturePack5', source: '/trinity_texture.jpg', type: 'texture' },
	
			// { name: 'wagonTexturePack5', source: '/assets/lectern_book_BaseColor.jpg', type: 'texture' },
			// { name: 'wagonTexturePack6', source: '/assets/lotus.jpg', type: 'texture' },
			// { name: 'wagonTexturePack8', source: '/assets/procedural_wood.jpg', type: 'texture' },
			// { name: 'wagonTexturePack9', source: '/assets/peeb.png', type: 'texture' },
			// { name: 'wagonTexturePack0', source: '/assets/peeble.jpg', type: 'texture' },
			
			

		]
	},
];

class Experience {
	static instance

	constructor(_options = {}) {
		this.setHtmlTimer('0%');

		if (Experience.instance) { return Experience.instance }
		Experience.instance = this;

		// Options
		this.targetElement = _options.targetElement;
		if (!this.targetElement) {
			console.warn('Missing \'targetElement\' property');
			return
		}
		this.config = new Config(this.targetElement);
		
		this.time = new Time();
		this.sizes = new Sizes();

		this.setDebug();
		this.setStats();
		this.setScene();
		this.setCamera();
		this.setRenderer();
		this.setResources();
		
		this.setLoader();
		
		this.setWorld();
		
		this.setRaycaster();
		this.setEvents();
        this.update();
		
	}

	setDebug() {
		if (this.config.debug) {
			this.debug = new Pane({
				title: 'Panel',
				expanded: false,
			});
			
			this.debug.containerElem_.classList.add("panel");
			// this.debug.containerElem__.className += "  panel"
			this.debug.containerElem_.style.width = '20%';
			this.debug.containerElem_.draggable= true;

		}
		if (this.debug) {
		
			this.debug.waterFolder =  this.debug.addFolder({title:'Water',expanded: false });
			this.debug.skyFolder=  this.debug.addFolder({title:'Ocean',expanded: false});
			// this.debug.worldFolder = this.debug.addFolder({ title: 'World' })
			this.debug.cameraFolder = this.debug.addFolder({ title: 'Camera',expanded: false });
		
			// this.debug.renderFolder = this.debug.addFolder({
			// 	title: 'Post-Processing',
			// 	expanded: false
			// })
			if(this.debug) {
				// Listen for resize events
				window.addEventListener('resize', () => {
					this.adjustPanelSize();
				});
			
				// Initial adjustment
				this.adjustPanelSize();
			}
			var width = window.innerWidth;
		
			if(width<600){
				width='60%';
			}
			else if (width<450) {
				width='40%';
			} 
			else width ='80%';
	
		}
	document.getElementsByClassName('tp-rotv')[0].style.width=width;
	}
	adjustPanelSize() {
		const maxWidth = 320; // Maximum width of the panel
		const viewportWidth = window.innerWidth;
		const panelWidthPercentage = 0.8; // Adjust this value as needed
	
		if(viewportWidth < 768) { // Consider as a mobile device threshold
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
	
	setCamera() { this.camera = new Camera(); }

	setRenderer() {
			this.renderer = new Renderer({ rendererInstance: this.rendererInstance, alpha: true });
			this.targetElement.appendChild( this.renderer.instance.domElement );
		}
		
	

	setResources() { this.resources = new Resources(assets); }

	setHtmlTimer(value) { htmlLoaderTimer.innerHTML = value; }
	setLoader() {
		this.resources.on('progress', (_progress) => {
			this.setHtmlTimer((Math.round(_progress.loaded / _progress.toLoad * 100)) + '%');
		});
		this.resources.on('end', (_progress) => {
			window.setTimeout(() => {
				this.config.html_loader.classList.add('unvisible');
				this.config.html_credits.classList.remove('unvisible');
				this.setHtmlTimer('');
				this.config.loaderIsHidden = true;
				// this.debug.title = 'Play With Me'
				// this.debug.expanded = true
			}, 1000);
		});
	}

	setWorld() { this.world = new World(); }

	setRaycaster() { this.raycaster = new THREE.Raycaster(); }
	setEvents() { this.events = new Events(); }

	update() {
		if (this.stats) this.stats.update();

		this.camera.update();

		if (this.world) this.world.update();
		if (this.renderer) this.renderer.update();
		if (this.events) this.events.update();

		window.requestAnimationFrame(() => {
			this.update();
		});
	}

	resize() {
		// Config
		const boundings = this.targetElement.getBoundingClientRect();
		this.config.width = boundings.width;
		this.config.height = boundings.height;
		this.config.smallestSide = Math.min(this.config.width, this.config.height);
		this.config.largestSide = Math.max(this.config.width, this.config.height);

		this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2);

		if (this.camera) this.camera.resize();
		if (this.renderer) this.renderer.resize();
		if (this.world) this.world.resize();
	}

	destroy() { }
}

const ScriptComponent = () => {
  useEffect(() => {
    const experience = new Experience({
      targetElement: document.querySelector(".experience")
    });
    let boatMovement = false;
    let shouldFollow = false;
    let Mpressed = false;
    function handleMouseMove(event) {
      if (!experience.world.ocean && !experience.world.wagon)
        return;
      experience.world.wagon.isFreeMoving = experience.world.ocean.parameters.isFreeMoving;
      const boatMovementChanged = experience.world.ocean.parameters.boatMovement !== boatMovement;
      boatMovement = experience.world.ocean.parameters.boatMovement;
      if (boatMovementChanged) {
        document.dispatchEvent(new CustomEvent("MoveBoat", { detail: { event } }));
      }
      if (boatMovement) {
        document.dispatchEvent(new CustomEvent("movetheboat", { detail: { event } }));
      }
      if (Mpressed) {
        document.dispatchEvent(new CustomEvent("movetheboat", { detail: { event } }));
      }
    }
    function toggleFollowMode(event) {
      var sampleJoystick = {
        zone: document.getElementById("text-panel"),
        mode: "dynamic",
        position: {
          left: "50%",
          top: "50%"
        },
        size: 150,
        color: "black"
      };
      var joystick = nipplejs.create(sampleJoystick);
      joystick.on("move", function(evt, data) {
        if (!data.direction)
          return;
        let deltaX = 0, deltaZ = 0;
        var maxSpeed = 8e-4;
        switch (data.direction.angle) {
          case "up":
            deltaZ = maxSpeed;
            break;
          case "down":
            deltaZ = -maxSpeed;
            break;
          case "left":
            deltaX = maxSpeed;
            break;
          case "right":
            deltaX = -maxSpeed;
            break;
        }
        experience.world.wagon.boatProgress += deltaZ;
        experience.world.wagon.horizontalProgress += deltaX;
        experience.world.wagon.verticalProgress += deltaZ;
        experience.world.wagon.update();
      });
      if (event.key === "m" || event.key === "M") {
        Mpressed = !Mpressed;
      }
      if (experience.world.wagon.models) {
        shouldFollow = !shouldFollow;
        if (shouldFollow) {
          experience.camera.setMode("follow");
          experience.camera.setFollowTarget(experience.world.wagon.models.boat);
        } else {
          const currentPosition = new THREE.Vector3().copy(experience.camera.modes.follow.instance.position);
          currentPosition.z += 10;
          currentPosition.y += 2;
          experience.camera.modes.debug.orbitControls.target.copy(currentPosition);
          experience.camera.modes.debug.orbitControls.update();
          experience.camera.setMode("debug");
        }
        if (experience.world.wagon.models.boat) {
          experience.world.wagon.update();
        }
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("MoveBoat", toggleFollowMode);
    document.addEventListener("keypress", toggleFollowMode);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("movetheboat", moveTheBoat);
      document.removeEventListener("MoveBoat", toggleFollowMode);
      document.removeEventListener("keypress", toggleFollowMode);
    };
  }, []);
  return null;
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate(_a || (_a = __template([`<html lang="en" data-astro-cid-j7pv25f6> <head><meta charset="utf-8"><meta content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" name="viewport"><title>Aarya Sharma Portfolio</title><!-- Preload primary fonts --><link rel="preload" href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">`, `<noscript><link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"></noscript><link rel="preload" href="https://fonts.googleapis.com/css?family=Amatic+SC" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link href="https://fonts.googleapis.com/css?family=Amatic+SC" rel="stylesheet"></noscript><!-- Defer JavaScript libraries --><script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"><\/script><script defer src="https://cdnjs.cloudflare.com/ajax/libs/nipplejs/0.8.7/nipplejs.min.js"><\/script><!-- Defer font-awesome CSS --><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></noscript>`, `</head> <body data-astro-cid-j7pv25f6> <div class="experience" data-astro-cid-j7pv25f6></div> <div class="loader" data-astro-cid-j7pv25f6> <img class="gif" src="/loading.gif" data-astro-cid-j7pv25f6> <div class="timer" style="display: none;" id="htmlLoaderTimer" data-astro-cid-j7pv25f6></div> </div> <div class="credits unvisible" data-astro-cid-j7pv25f6> <div class="pic loaderKey" data-astro-cid-j7pv25f6></div> </div> <div class="base" id="base" style="display: none;" data-astro-cid-j7pv25f6> <div class="menu" data-astro-cid-j7pv25f6> <div class="icon" data-astro-cid-j7pv25f6> <div class="bar" data-astro-cid-j7pv25f6></div> </div> </div> <div class="icons" data-astro-cid-j7pv25f6> <i class="fa fa-user menu-text" aria-hidden="true" data-astro-cid-j7pv25f6>Recruiters</i> <i class="fa fa-calendar-o menu-text" aria-hidden="true" data-astro-cid-j7pv25f6>RESUME</i> <i class="fa fa-tachometer menu-text" aria-hidden="true" data-astro-cid-j7pv25f6>Contact</i> </div> <div class="section" data-astro-cid-j7pv25f6> <div class="cover1" data-astro-cid-j7pv25f6> <div class="cover2" data-astro-cid-j7pv25f6> <a class="content" target="_blank" rel="noopener" href="https://aarya00s.github.io/quiz/" data-astro-cid-j7pv25f6></a> </div> </div> </div> <a class="section-static top" target="_blank" rel="noopener" href="https://aarya00s.github.io/check/" data-astro-cid-j7pv25f6></a> <a class="section-static bottom" target="_blank" rel="noopener" href="https://aaryascontactme.netlify.app/" data-astro-cid-j7pv25f6></a> </div> <div id="container" data-astro-cid-j7pv25f6></div> <div class="information" data-astro-cid-j7pv25f6> <div class="text" id="htmlInformer" data-astro-cid-j7pv25f6>
Lorem ipsum...
<!-- Your content --> </div> </div> <div id="text-panel" style="display: none; position: fixed; bottom: 0; width: 100%; background: rgba(255, 255, 255, 0); color: gold; text-align: center; padding: 10px; font-size: 60px; font-family: 'Amatic SC', cursive;" data-astro-cid-j7pv25f6>
Welcome, Press M or go to the "Panel" above to move the boat and toggle different options
</div> <div id="joystick-container" style="position:absolute; bottom: 10%; right: 10% , width 79%;" data-astro-cid-j7pv25f6></div> <noscript> <div data-astro-cid-j7pv25f6><img alt="" src="https://mc.yandex.ru/watch/93544529" style="position:absolute; left:-9999px;" data-astro-cid-j7pv25f6></div> </noscript> <script type="module">
        // Ensure the document is fully rendered before executing
        document.addEventListener('DOMContentLoaded', () => {
          // Dynamically load jQuery to not affect the initial load time
          import('https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js')
            .then(() => {
              // jQuery is now loaded and can be used
              $(document).ready(function () {
                $(".menu").click(function () {
                  $(this).parent().toggleClass("close");
                  // Toggle classes for text visibility
                  if ($('#base').hasClass('close')) {
                    $('.menu-text').css('display', 'block');
                  } else {
                    $('.menu-text').css('display', 'none');
                  }
                });
              });
            })
            .catch(console.error); // Log errors if jQuery fails to load
        });
      <\/script> <!-- Scripts are added with a client directive in Astro --> `, "</body></html>"])), maybeRenderHead(), renderHead(), renderComponent($$result, "ScriptComponent", ScriptComponent, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/Migration1/Migration/src/js/script.jsx", "client:component-export": "default", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate`  ` }));
}, "D:/Migration1/Migration/src/pages/index.astro", void 0);

const $$file = "D:/Migration1/Migration/src/pages/index.astro";
const $$url = "";

export { $$Index as default, $$file as file, $$url as url };
