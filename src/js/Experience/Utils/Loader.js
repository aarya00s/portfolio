import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
export default class Resources extends EventEmitter
{
	/**
	 * Constructor
	 */
	constructor()
	{
		super()

		this.experience = new Experience()
		this.renderer = this.experience.renderer.instance

		this.setLoaders()

		this.toLoad = 0
		this.loaded = 0
		this.items = {}
	}

	/**
	 * Set loaders
	 */
	setLoaders()
	{
		this.loaders = []
		const ktx2Loader = new KTX2Loader()
		.setTranscoderPath( 'jsm/libs/basis/' )
		.detectSupport( this.renderer );

		// Images
		this.loaders.push({
			extensions: ['jpg', 'png', 'webp'],
			action: (_resource) =>
			{
				const image = new Image()

				image.addEventListener('load', () =>
				{
					this.fileLoadEnd(_resource, image)
				})

				image.addEventListener('error', () =>
				{
					this.fileLoadEnd(_resource, image)
				})

				image.src = _resource.source
			}
		})

		// Draco
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		dracoLoader.setDecoderConfig({ type: 'js' })

		this.loaders.push({
			extensions: ['drc'],
			action: (_resource) =>
			{
				dracoLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data)

					DRACOLoader.releaseDecoderModule()
				})
			}
		})

		// GLTF
		const gltfLoader = new GLTFLoader()
		gltfLoader.setDRACOLoader(dracoLoader)
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
		})

		// FBX
		const fbxLoader = new FBXLoader()

		this.loaders.push({
			extensions: ['fbx'],
			action: (_resource) =>
			{
				fbxLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data)
				})
			}
		})

		// RGBE | HDR
		const rgbeLoader = new RGBELoader()

		this.loaders.push({
			extensions: ['hdr'],
			action: (_resource) =>
			{
				rgbeLoader.load(_resource.source, (_data) =>
				{
					this.fileLoadEnd(_resource, _data)
				})
			}
		})
	}

	/**
	 * Load
	 */
	load(_resources = [])
	{
		for(const _resource of _resources)
		{
			this.toLoad++
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
		this.loaded++
		this.items[_resource.name] = _data

		this.trigger('fileEnd', [_resource, _data])

		if(this.loaded === this.toLoad)
		{
			this.trigger('end')
		}
	}
}
