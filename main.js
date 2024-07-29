import * as BABYLON from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas');

window.addEventListener('resize', function(){
  engine.setSize(window.innerWidth, window.innerHeight);
});

const engine = new BABYLON.Engine(canvas, true);
const namesSpaces = ["Acesso", "Comedor", "Estudio", "Cocina", "Ropas", "Baño Social", "Alcoba Social", "Alcoba Principal", "Baño Principal"];
const cubesTexturesURL = [
  "/cubemaps/aceso/",
  "/cubemaps/comedor/",
  "/cubemaps/estudio/",
  "/cubemaps/cocina/",
  "/cubemaps/ropas/",
  "/cubemaps/baño_social/",
  "/cubemaps/alcoba_social/",
  "/cubemaps/alcoba_principal/",
  "/cubemaps/baño_principal/"];

const collisionMeshes = [];
  
//Global ELEMENTS DOM
const nextButton = document.getElementById("nextButton");
const backButton = document.getElementById("backButton");
const descriptionBox = document.getElementById("description-field");

const createScene = function () {
  engine.disableManifestCheck = true;
  let scene = new BABYLON.Scene(engine);
  scene.ambientColor = BABYLON.Color3.Gray();
  let camera = new BABYLON.ArcRotateCamera("camera", 1, 1, 10, BABYLON.Vector3.Zero(), scene);
  camera.wheelPrecision = 30;
  camera.minZ = 0.1;

  let cameraPoint01 = new BABYLON.FreeCamera("camPoint01", BABYLON.Vector3.Zero(), scene);
  cameraPoint01.speed = 0.05;
  cameraPoint01.minZ = 0.001;
  cameraPoint01.fov = 1.2;
  cameraPoint01.rotation.y = -Math.PI / 2;

  camera.attachControl(canvas, true);

  let cubeTexture01;
  let keys = [];
  let indexCubes = 0;
  let collisionMesh01;

  let ease = new BABYLON.QuadraticEase();
  ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

  BABYLON.SceneLoader.ImportMesh(
    "",
    "/models/",
    "Collisions_Apto-1415.babylon",
    scene,
    function(meshes){
        cubeTexture01 = new BABYLON.CubeTexture(cubesTexturesURL[0], scene);

        cameraPoint01.position = scene.getMeshByName("1401-C00").position;
        scene.activeCamera = cameraPoint01;
        scene.activeCamera.attachControl(canvas);

        collisionMesh01 = scene.getMeshByName("Collision");

        
        collisionMesh01.material = new BABYLON.StandardMaterial("mat", scene);

        collisionMesh01.material.diffuseColor = BABYLON.Color3.Gray();
        collisionMesh01.material.reflectionTexture = cubeTexture01;
        collisionMesh01.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

        let distance = collisionMesh01.position.subtract(cameraPoint01.position);
        let reflectionMatrix = BABYLON.Matrix.Translation(distance.x, distance.y, distance.z);

        collisionMesh01.material.reflectionTexture.setReflectionTextureMatrix(reflectionMatrix);

        collisionMeshes[0] = collisionMesh01;
        preLoadCube();
    }
);

nextButton.addEventListener("click", function() {
  if (indexCubes < collisionMeshes.length - 1){
      indexCubes += 1;
      descriptionBox.innerHTML = `${namesSpaces[indexCubes]}`;

      setCameraAnimation(scene.getMeshByName("1401-C0" + indexCubes).position)

      setFadeIn(collisionMeshes[indexCubes])
      setFadeOut(collisionMeshes[indexCubes - 1])
      scene.beginAnimation(cameraPoint01, 0, 100, false);
      scene.beginAnimation(collisionMeshes[indexCubes - 1], 0, 100, false);
      scene.beginAnimation(collisionMeshes[indexCubes], 0, 100, false);
  }
 
});

backButton.addEventListener("click", function() {

  if (indexCubes > 0){
      indexCubes -= 1;

      descriptionBox.innerHTML = `${namesSpaces[indexCubes]}`;
      setCameraAnimation(scene.getMeshByName("1401-C0" + indexCubes).position)

      setFadeIn(collisionMeshes[indexCubes])
      setFadeOut(collisionMeshes[indexCubes + 1])
      scene.beginAnimation(cameraPoint01, 0, 100, false);
      scene.beginAnimation(collisionMeshes[indexCubes + 1], 0, 100, false);
      scene.beginAnimation(collisionMeshes[indexCubes], 0, 100, false);
  }
});

  return scene;


  function setCameraAnimation(destinationPosition) {
    cameraPoint01.animations = [];
  
    let cameraAnimation = new BABYLON.Animation("cameraAnimation", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    keys = []; 
    keys.push({ frame: 0, value: cameraPoint01.position });
    keys.push({ frame: 40, value: destinationPosition }); 
    cameraAnimation.setKeys(keys);
    cameraAnimation.setEasingFunction(ease);
  
    cameraPoint01.animations.push(cameraAnimation);
  }
  
  function setFadeIn(meshObject) {
    meshObject.animations = [];
    let fadeInAnimation = new BABYLON.Animation("fadeInAnimation", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    keys = []; 
    keys.push({ frame: 0, value: 0 });
    keys.push({ frame: 50, value: 1 });
    fadeInAnimation.setKeys(keys);
    fadeInAnimation.setEasingFunction(ease);
  
    meshObject.animations.push(fadeInAnimation);
  }
  
  function setFadeOut(meshObject) {
    meshObject.animations = [];
    let fadeOutAnimation = new BABYLON.Animation("fadeOutAnimation", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
  
    keys = []; 
    keys.push({ frame: 0, value: 1 });
    keys.push({ frame: 50, value: 0 });
    fadeOutAnimation.setKeys(keys);
    fadeOutAnimation.setEasingFunction(ease);
  
    meshObject.animations.push(fadeOutAnimation);
  }
  
  function preLoadCube(){
    for (let i = 1; i < cubesTexturesURL.length; i++) {

      collisionMeshes[i] = collisionMeshes[0].clone("collisionMesh0" + i);
      collisionMeshes[i].material = new BABYLON.StandardMaterial("mat0" + i, scene);
      collisionMeshes[i].material.diffuseColor = BABYLON.Color3.Gray();
      collisionMeshes[i].material.reflectionTexture = new BABYLON.CubeTexture(cubesTexturesURL[i], scene);
      collisionMeshes[i].material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

      let distance = collisionMeshes[i].position.subtract(scene.getMeshByName("1401-C0" + i).position);
      let reflectionMatrix = BABYLON.Matrix.Translation(distance.x, distance.y, distance.z);

      collisionMeshes[i].material.reflectionTexture.setReflectionTextureMatrix(reflectionMatrix);
      collisionMeshes[i].material.disableLighting = true;
      collisionMeshes[i].visibility = 0;
      
    }
  }

};


engine.runRenderLoop(function () {
  scene.render();
});

var scene = createScene();
