import { Engine, Scene, UniversalCamera, Vector3 } from "@babylonjs/core";

export const setupScene = (
  canvas: HTMLCanvasElement,
): { scene: Scene; engine: Engine } => {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const camera = new UniversalCamera("mainCamera", Vector3.Zero(), scene);
  camera.speed = 0.05;
  camera.minZ = 0.1;
  camera.fov = 1.4;
  camera.attachControl(canvas, true);
  return { scene, engine };
};
