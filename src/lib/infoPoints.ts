import {
  Scene,
  Mesh,
  StandardMaterial,
  Color3,
  Texture,
  Vector3,
  MeshBuilder,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
export const createInfoPoint = (scene: Scene, position: Vector3) => {
  // Create the info point (small plane)
  const infoPoint = MeshBuilder.CreatePlane("infoPoint", { size: 0.2 }, scene);
  infoPoint.position = position;

  // Make the plane always face the camera
  infoPoint.billboardMode = Mesh.BILLBOARDMODE_ALL;

  // Add material with an icon texture
  const material = new StandardMaterial("infoPointMaterial", scene);
  material.diffuseTexture = new Texture("/assets/info_icon.png", scene);
  material.diffuseTexture.hasAlpha = true;
  material.emissiveColor = new Color3(1, 1, 1);
  material.ambientColor = Color3.White();
  material.useAlphaFromDiffuseTexture = true;
  infoPoint.material = material;

  // Create the info panel (larger plane, initially hidden)
  const infoPanel = MeshBuilder.CreatePlane(
    "infoPanel",
    { width: 1.4, height: 0.7 },
    scene,
  );
  // Slightly above the info point
  infoPanel.position = position.add(new Vector3(0, 0.3, 0));
  infoPanel.billboardMode = Mesh.BILLBOARDMODE_ALL;

  const panelMaterial = new StandardMaterial("infoPanelMaterial", scene);
  panelMaterial.diffuseTexture = new Texture("/assets/info-card.png", scene);
  panelMaterial.diffuseTexture.hasAlpha = true;
  panelMaterial.emissiveColor = new Color3(1, 1, 1);
  panelMaterial.ambientColor = Color3.White();
  panelMaterial.useAlphaFromDiffuseTexture = true;
  infoPanel.material = panelMaterial;
  infoPanel.isVisible = false;

  // toggle for the info panel
  infoPoint.actionManager = new ActionManager(scene);
  infoPoint.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      infoPanel.isVisible = !infoPanel.isVisible;
      infoPoint.isVisible = !infoPanel.isVisible;
    }),
  );
  infoPanel.actionManager = new ActionManager(scene);
  infoPanel.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      infoPanel.isVisible = !infoPanel.isVisible;
      infoPoint.isVisible = !infoPanel.isVisible;
    }),
  );

  return infoPoint;
};
