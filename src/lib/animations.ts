import {
  Animation,
  Vector3,
  QuadraticEase,
  EasingFunction,
  Mesh,
  Camera,
} from "@babylonjs/core";

const ease = new QuadraticEase();
ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

export const cameraAnimation = (camera: Camera, targetPosition: Vector3) => {
  camera.animations = [];

  const ease2 = new QuadraticEase();
  ease2.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
  const animation = new Animation(
    "animCamera",
    "position",
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  const keys = [];
  keys.push({ frame: 0, value: camera.position });
  keys.push({ frame: 25, value: targetPosition });
  animation.setKeys(keys);
  animation.setEasingFunction(ease2);
  camera.animations.push(animation);
};

export const opacityAnimation = (mesh: Mesh, frameToFinish: number) => {
  mesh.animations = [];

  const animation = new Animation(
    "meshAnim",
    "visibility",
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  const keys = [];
  keys.push({ frame: 0, value: 1 });
  keys.push({ frame: 14, value: 0.7 });
  keys.push({ frame: frameToFinish, value: 1 });
  animation.setKeys(keys);
  animation.setEasingFunction(ease);
  mesh.animations.push(animation);
};
