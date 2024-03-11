import { Object3D } from "three";
import { mesh } from "./mesh";

const object = new Object3D();

object.add(mesh);

export default object;
export { material } from "./material";
export { options } from "./options";
