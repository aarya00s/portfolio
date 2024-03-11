import * as THREE from "three";
import perlin, { material, options } from "./perlin";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Experience from "../Experience";

export default class Example {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      1000,
    );
    this.camera.position.z = 10;

    this.geometry = new THREE.SphereGeometry(0, 0, 0);
    this.material = new THREE.MeshStandardMaterial({
      roughness: 50,
      metalness: 400,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene = new THREE.Scene();

    // this.scene.add(this.mesh);
    this.scene.add(perlin);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.stats = new Stats();

    document.body.appendChild(this.stats.dom);
    document.body.appendChild(this.renderer.domElement);
    document.body.style.cssText = "margin: 0; overflow: hidden";
    window.addEventListener("resize", this.onWindowResize, false);

    this.start = Date.now();
    this.animate();
  }

  animate = () => {

    this.stats.begin();

    this.animatePerlin();
    this.animateMaterial();

    this.camera.lookAt(this.scene.position);
    if(Experience.instance.world.wagon)
    {
        perlin.position.set(0,0,0);
        perlin.scale.set(300,300,300)
    }
    this.controls && this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.stats.end();

    requestAnimationFrame(this.animate);
  };

  animatePerlin = () => {
    const { sinVel, ampVel } = options.spin;
    const performance = Date.now() * 0.003;
    perlin.rotation.x +=
      (Math.sin(performance * sinVel) * ampVel * Math.PI) / 180;
    perlin.rotation.y += options.perlin.vel;
  };

  animateMaterial = () => {
    material.uniforms["time"].value =
      options.perlin.speed * (Date.now() - this.start);
    material.uniforms["pointscale"].value = options.perlin.perlins;
    material.uniforms["decay"].value = options.perlin.decay;
    material.uniforms["complex"].value = options.perlin.complex;
    material.uniforms["waves"].value = options.perlin.waves;
    material.uniforms["eqcolor"].value = options.perlin.eqcolor;
    material.uniforms["fragment"].value = options.perlin.fragment;
    material.uniforms["redhell"].value = options.perlin.redhell;
  };

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}