
import { InstancedBufferGeometry, Points }from 'three/src/Three' ;
import { material } from "./material";

const geometry = new InstancedBufferGeometry(3, 7);
export const mesh = new Points(geometry, material);
