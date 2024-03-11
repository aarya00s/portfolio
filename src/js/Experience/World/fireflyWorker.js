var mapText, mapPositions, boatPath, models;

self.onmessage = function(e) {
    const { task, data } = e.data;

    switch (task) {
        // case 'startCalculations':
        //     startCalculations();
        //     break;
        case 'useExperienceData':
           
            // Directly use the data without redeclaring the variables
            models = data.models;
            boatPath = data.boatPath; // Ensure this is already in a serializable format

            mapText = {
                'Gate1': "Hey!! Welcome to\n Aarya's website\n you can interact with\n almost everything\n ~Love YOU I",
                'Gate2': "I have reached gate2",
                "INDIA": "I have reached India \n this is where\n I did my \n initial education\n ye mera INDIA I love my India",
                "trinity": "I have reached trinity"
            };

            // Assuming models is an object with model names as keys and their data as values
            mapPositions = Object.keys(models).reduce((acc, key) => {
                const model = models[key];
                // Assuming model.position is already in a serializable format
                acc[key] = model.position;
                return acc;
            }, {});
 startCalculations()
            break;
        // Add more cases as needed
    }
};

function startCalculations() {
    //"Starting calculations...");

    if (!mapPositions || !boatPath) {
        console.error('mapPositions or boatPath not initialized.');
        return;
    }

    let combinedResults = new Map();

    Object.keys(mapPositions).forEach(modelName => {

        if(mapText[modelName]){
        const positions = calculateTextPositions(modelName);
        // Combine results into a single map
        positions.forEach((value, key) => {
            combinedResults.set(key, value);
        });
    }
    });

    // Convert the combined map to a structure suitable for postMessage
    const resultMap = Array.from(combinedResults).map(([key, value]) => ({ key, value }));
   
 
    self.postMessage({ task: 'allPositionsCalculated', positions: resultMap });
}

function calculateTextPositions(modelName) {
    //modelName);
    const text = mapText[modelName];
    //"Model Name:", modelName); // Debugging
   
    //"Text for model:", text);
    const modelPosition = mapPositions[modelName];
    // Ensure boatPath is handled correctly based on its format
    const nearbyBoatPathPoints = boatPath.filter(point => {
        const dx = point.x - modelPosition.x;
        const dy = point.y - modelPosition.y;
        const dz = point.z - modelPosition.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return distance <= 90;
    });
    const result = new Map();

    nearbyBoatPathPoints.forEach(boatPathPoint => {
        const offset = calculateOffset(boatPathPoint, modelPosition); // Define calculateOffset function or adjust logic
        const positions = calculatePositionsForText(text, offset);
    
       
       result.set(boatPathPoint, positions);
    });
    this.result=result;
    return result;


}
function calculateOffset(boatPathPoint, modelPosition) {
    return {
        x: boatPathPoint.x - modelPosition.x,
        y: boatPathPoint.y - modelPosition.y,
        z: boatPathPoint.z - modelPosition.z
    };
}
  function calculatePositionsForText(text, offset) {
    this.canvas=new OffscreenCanvas(1024, 980);
    this.ctx= canvas.getContext('2d');
    // Setup canvas for text drawing
    const fontSize = 40;
    this.canvas.width = 1024;
    this.canvas.height = 980;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
    this.ctx.font = `${fontSize}px Brush Script`;
    this.ctx.fillStyle = 'white';
    
    // this.ctx.fillText(text, 10, this.canvas.height / 2 + fontSize / 3);
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2; // Adjust line height as needed
    

    // Render each line separately
    lines.forEach((line, index) => {
        this.ctx.fillText(line, 10,this.canvas.height / 2 + fontSize / 3 + (lineHeight * index-5));
    });
    
//  offset.x-=13;
//  offset.y=-6
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    return this.extractPositionsFromImageData(imageData, offset);
}
function extractPositionsFromImageData(imageData, offset) {
    const positions = [];
    const thickness = 3; // Number of layers to add thickness
const layerSpacing = 0.02;
    const scale = typeof offset.scale === 'number' ? offset.scale : 1; // Adjust scale if needed
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const alpha = imageData.data[(y * imageData.width + x) * 4 + 3];
            if (alpha > 128) {
                // Generate multiple positions around each filled pixel for increased density
                const baseX = (x / imageData.width) * 2 - 1;
                const baseY = -(y / imageData.height) * 2 + 1;
                for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
                    for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                        for (let z = 0; z < thickness; z++) {
              
                            const position = {
                                x: (baseX + dx / imageData.width) * scale + offset.x,
                                y: (baseY + dy / imageData.height) * scale + offset.y,
                                z: offset.z + (z - thickness / 2) * layerSpacing
                            };
                    
                        positions.push(position);
                        }
                    }
                }
            }
        }
    }
    return positions;
}