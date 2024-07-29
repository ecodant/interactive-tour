import {
  Scene,
  Mesh,
  Matrix,
  StandardMaterial,
  Color3,
  Texture,
  Vector3,
  MeshBuilder,
  ActionManager,
  ExecuteCodeAction,
  CubeTexture,
  FreeCamera,
} from "@babylonjs/core";

export const createHotspot = (scene: Scene, index: number): Mesh => {
  const planeMaterial = new StandardMaterial(`hotspotMaterial${index}`, scene);
  const texture = new Texture("/assets/hotspot_floor.png", scene);
  texture.hasAlpha = true;
  planeMaterial.diffuseTexture = texture;
  planeMaterial.emissiveColor = new Color3(1, 1, 1);
  planeMaterial.ambientColor = Color3.White();
  planeMaterial.useAlphaFromDiffuseTexture = true;

  const planeMesh = MeshBuilder.CreatePlane(
    `Hotspot${index}`,
    { width: 0.4, height: 0.4 },
    scene,
  );
  planeMesh.material = planeMaterial;

  const refPoint = scene.getMeshByName(`1401-C0${index}`);
  if (refPoint) {
    planeMesh.position.x = refPoint.position.x;
    planeMesh.position.z = refPoint.position.z;
    planeMesh.position.y = 0.3;
  }
  planeMesh.rotation = new Vector3(Math.PI / 2, 0, 0);

  return planeMesh;
};

export const assignHotspotEvent = (
  scene: Scene,
  hotspot: Mesh,
  index: number,
  cubTextures: CubeTexture[],
  setCurrentTextureIndex: (value: React.SetStateAction<number>) => void,
) => {
  hotspot.actionManager = new ActionManager(scene);
  hotspot.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const collisionMesh = scene.getMeshByName("Collision") as Mesh;
      if (collisionMesh) {
        const material = collisionMesh.material as StandardMaterial;
        material.reflectionTexture = cubTextures[index];
        material.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        const camera = scene.getCameraByName("mainCamera") as FreeCamera;
        const refPoint = scene.getMeshByName(`1401-C0${index}`);
        if (refPoint) {
          camera.position = refPoint.position;
        }

        const distance = collisionMesh.position.subtract(camera.position);
        const reflectionMatrix = Matrix.Translation(
          distance.x,
          distance.y,
          distance.z,
        );
        cubTextures[index].setReflectionTextureMatrix(reflectionMatrix);

        setCurrentTextureIndex(index);
        scene.render();
      }
    }),
  );
};
