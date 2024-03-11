import { ShaderMaterial } from "three";
import { fragmentShader, vertexShader } from "./shaders";

export const material = new ShaderMaterial({
  wireframe: false,
  //fog: true,
  uniforms: {
    time: {
      type: "f",
      value: 0.0
    },
    pointscale: {
      type: "f",
      value: 0.0
    },
    decay: {
      type: "f",
      value: 0.0
    },
    complex: {
      type: "f",
      value: 0.0
    },
    waves: {
      type: "f",
      value: 0.0
    },
    eqcolor: {
      type: "f",
      value: 0.0
    },
    fragment: {
      type: "i",
      value: true
    },
    redhell: {
      type: "i",
      value: true
    }
  },
  vertexShader: vertexShader(),
  fragmentShader: fragmentShader()
});
