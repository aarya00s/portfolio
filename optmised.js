// Assuming ES Modules syntax; convert to require() if using CommonJS
import fs from 'fs/promises';
import gltfPipeline from 'gltf-pipeline';
const { processGlb } = gltfPipeline;

const filePath = './public/models_new.glb'; // Adjust this to your GLB file's path
const outputPath = './public/optimised/model.glb'; // Adjust this to where you want to save the optimized model
async function optimizeGlb(filePath, outputPath) {
    try {
        // Read the GLB file
        const glbData = await fs.readFile(filePath);

        // Options for glTF pipeline
        const options = {
            dracoOptions: {
                compressionLevel: 10
            },
            resourceDirectory: process.cwd()
        };

        // Process the GLB for optimization
        const processedGlb = await processGlb(glbData, options);

        // Save the optimized GLB
        await fs.writeFile(outputPath, Buffer.from(processedGlb.glb));
        console.log(`Optimized GLB saved to ${outputPath}`);
    } catch (error) {
        console.error('Failed to optimize GLB:', error);
    }
}

optimizeGlb(filePath, outputPath);