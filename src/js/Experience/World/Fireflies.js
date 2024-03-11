import * as THREE from 'three';
import Experience from '../Experience.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { gsap } from 'gsap';
import firefliersVertexShader from './shaders/firefliers/vertex.js'
import firefliersFragmentShader from './shaders/firefliers/fragment.js'
export default class Fireflies {
	constructor() {
		this.experience = new Experience();
		this.init();
		this.currentText = "";
		this.var = 0;
		this.particleSystem
	}
	createVerticesFromPoints(points) {
		// Create a Float32Array to hold the vertex positions
		const positions = new Float32Array(points.length * 3);

		// Fill the positions array with the x, y, z coordinates of each point
		points.forEach((point, i) => {
			positions[i * 3] = point.x;
			positions[i * 3 + 1] = point.y;
			positions[i * 3 + 2] = point.z;
		});


		// Create a new BufferGeometry and set its position attribute using the positions array
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		return geometry;
	}


	init() {
		// Renderer setup
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		// Scene setup
		this.scene = this.experience.scene

		// Camera setup
		this.camera = this.experience.camera.instance

		// Lighting
		const light = new THREE.AmbientLight(0xFFFFFF, 10);
		this.scene.add(light);
		// Handle window resize
		window.addEventListener('resize', () => this.onWindowResize(), false);
		// Particle material
		this.pMaterial = new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 1 },
				aScale: 5,
				uTimeFrequency: { value: 5 / 10000 },
				uPixelRationn: { value: Math.min(Math.max(window.devicePixelRatio, 1), 10) },
				uSize: { value: 90.0 }, // Adjust size based on whether it's for text
				uColor: { value: new THREE.Color('#FFA500') },
				cameraPos: this.camera
			},
			vertexShader: firefliersVertexShader,
			fragmentShader: firefliersFragmentShader,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		// Placeholder for texts
		this.texts = [];
		// Animation variables


	}


	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}


	async setTextAsFireflies(text, position) {

		if (this.currentText === text) {
			// Update positions based on the boat's current position
			this.updatePositions(position);
			return;
		}

		this.currentText = text;
		const loader = new FontLoader();
		loader.load('https://dl.dropboxusercontent.com/s/bkqic142ik0zjed/swiss_black_cond.json?', font => {
			const textGeometry = new TextGeometry(text, {
				font: font,
				size: .12,
				height: 1	,
				curveSegments: 50,

			});

			textGeometry.center();

			// Generate points from the text geometry
			this.points = this.randomPointsInBufferGeometry(textGeometry, 70000);

			// Use the adapted createVertices function to create the geometry for the particles
			const particlesGeometry = this.createVerticesFromPoints(this.points);
			this.group = new THREE.Group();
			this.particleSystem = new THREE.Points(particlesGeometry, this.pMaterial);
	
			this.group.add(this.particleSystem)
			this.group.quaternion.copy(this.camera.quaternion);
			this.scene.add(this.group);
			// Set target positions for animation
			this.targetPositions = this.points.map(point => {
				return new THREE.Vector3((point.x + position.x)*15, (point.y + position.y)*15, (point.z + position.z));
			});

this.updateTextPanel(text)
			// this.morphTo('#FFA500');
		});

	}
    updateTextPanel(text) {
	
		const panel = document.getElementById('text-panel');
		if(panel) {
			panel.innerText = text;
		}
	}
	randomPointsInBufferGeometry(geometry, n) {
		var vertices = geometry.attributes.position.array;
		var cumulativeAreas = [];
		var vA = new THREE.Vector3();
		var vB = new THREE.Vector3();
		var vC = new THREE.Vector3();
		var il = vertices.length / 9;
		let totalArea = 0;

		// Helper function to calculate the area of a triangle
		function triangleArea(vA, vB, vC) {
			var edge1 = new THREE.Vector3().subVectors(vB, vA);
			var edge2 = new THREE.Vector3().subVectors(vC, vA);
			var crossProduct = new THREE.Vector3().crossVectors(edge1, edge2);
			return crossProduct.length() / 2;
		}

		// Calculate total area and cumulative areas
		for (let i = 0; i < il; i++) {
			vA.fromArray(vertices, i * 9);
			vB.fromArray(vertices, i * 9 + 3);
			vC.fromArray(vertices, i * 9 + 6);

			var area = triangleArea(vA, vB, vC);
			totalArea += area;
			cumulativeAreas.push(totalArea);
		}

		// Binary search to find the target area index
		function binarySearchIndices(value) {
			function binarySearch(start, end) {
				if (end < start) return start;
				var mid = start + Math.floor((end - start) / 2);
				if (cumulativeAreas[mid] > value) {
					return binarySearch(start, mid - 1);
				} else if (cumulativeAreas[mid] < value) {
					return binarySearch(mid + 1, end);
				} else {
					return mid;
				}
			}
			return binarySearch(0, cumulativeAreas.length - 1);
		}

		// Helper function to generate a random point within a triangle
		function randomPointInTriangle(vA, vB, vC) {
			var a = Math.random();
			var b = Math.random();

			if ((a + b) > 1) {
				a = 1 - a;
				b = 1 - b;
			}

			var c = 1 - a - b;

			return new THREE.Vector3(
				vA.x * a + vB.x * b + vC.x * c,
				vA.y * a + vB.y * b + vC.y * c,
				vA.z * a + vB.z * b + vC.z * c
			);
		}

		// Generate random points
		var result = [];
		for (let i = 0; i < n; i++) {
			var r = Math.random() * totalArea;
			var index = binarySearchIndices(r);
			vA.fromArray(vertices, index * 9);
			vB.fromArray(vertices, index * 9 + 3);
			vC.fromArray(vertices, index * 9 + 6);
			result.push(randomPointInTriangle(vA, vB, vC));
		}

		return result;
	}

	morphTo(color) {

		//"callled time"+this.var++)
		// Assuming targetPositions is an array of THREE.Vector3
		const positions = this.particleSystem.geometry.attributes.position;
		const numVertices = positions.count;
		const gsapTargets = [];

		// Prepare GSAP targets with properties GSAP can animate
		for (let i = 0; i < numVertices; i++) {
			const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
			gsapTargets.push({ x: vertex.x, y: vertex.y, z: vertex.z });
		}

		// Animate each GSAP target towards its corresponding target position
		gsapTargets.forEach((gsapTarget, index) => {
			const targetPosition = this.targetPositions[index];
			// console.log(targetPosition)
			let animation = gsap.to(gsapTarget, {
				x: targetPosition.x-2,
				y: targetPosition.y -3,
				z: targetPosition.z -10,
				duration: 2,
				ease: "elastic",
				onUpdate: () => {
					// Apply the animated values back to the geometry
					positions.setXYZ(index, gsapTarget.x, gsapTarget.y, gsapTarget.z);
					positions.needsUpdate = true;

				}

			});

		});



		// Optionally animate color
		gsap.to(this.particleSystem.material.uniforms.uColor.value, {
			r: new THREE.Color(color).r,
			g: new THREE.Color(color).g,
			b: new THREE.Color(color).b,
			duration: 2,

			onUpdate: () => {
				// This might not be necessary if you're only changing the color
				// since Three.js materials update automatically when their properties change.
				this.particleSystem.material.needsUpdate = true;

			}

		});
	}
	updatePositions(newPosition) {
		const positions = this.particleSystem.geometry.attributes.position;
		for (let i = 0; i < positions.count; i++) {
			const updatedPosition = newPosition;
			positions.setXYZ(i, updatedPosition.x, updatedPosition.y, updatedPosition.z);
		}
		
		positions.needsUpdate = true;
	}
	update() {
		this.pMaterial.uniforms.uTime.value += 200;
		if (this.group) {
			this.group.quaternion.copy(this.camera.quaternion);
		}
		this.renderer.render(this.scene, this.camera);
		if (this.particleSystem == null) {
			

		}
		else {
			
			// Assuming this.boatPosition is updated elsewhere with the boat's current position
			const deltaPosition = this.boatPosition.clone().sub(this.previousBoatPosition);

			if (deltaPosition.lengthSq() > 0) { // Check if there's any movement
				const positions = this.particleSystem.geometry.attributes.position;
				for (let i = 0; i < positions.count; i++) {
					positions.setXYZ(
						i,
						positions.getX(i) + deltaPosition.x,
						positions.getY(i) + deltaPosition.y,
						positions.getZ(i) + deltaPosition.z
					);
				}
				positions.needsUpdate = true;

				// Update previousBoatPosition for the next frame
				this.previousBoatPosition.copy(this.boatPosition);
			}
		}
	}

}