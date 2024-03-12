export default [
	
	{
		name: 'asset',
		data: {},
		items: [
			// Base
			{ name: 'wagonModel', source: '/models_new.glb', type: 'glb' },
			
			{ name: 'wagonTexturePack1', source: '/boat.jpg', type: 'texture' },
			{ name: 'wagonTexturePack2', source: '/Gate1.jpg', type: 'texture' },
			{ name: 'wagonTexturePack3', source: '/Gate02.jpg', type: 'texture' },
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
export function processGLBModel(gltf) {

    const models = {};
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            // Extract and keep the original transformations
            models[child.name] = {
                mesh: child,
                position: child.position.clone(),
                rotation: child.rotation.clone(),
                scale: child.scale.clone()
            };
        }
    });
    return models;
}