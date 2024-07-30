import React, { useEffect, useRef, useState, useCallback } from "react";
//Import Scenes and Utils
import { setupScene } from "@/lib/sceneSetup";
import { cubeMaps, infoPoints } from "@/lib/vrTourInfo";
import { createHotpot } from "@/lib/hotspots";
import { createInfoPoint } from "@/lib/infoPoints";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Scene,
  Vector3,
  SceneLoader,
  Mesh,
  CubeTexture,
  StandardMaterial,
  Color3,
  Texture,
  Matrix,
  FreeCamera,
} from "@babylonjs/core";
import { Button } from "../components/ui/button";
import { cameraAnimation, opacityAnimation } from "@/lib/animations";

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [collisionMesh, setCollisionMesh] = useState<Mesh | null>(null);
  const [cubeTextures, setCubeTextures] = useState<CubeTexture[]>([]);
  const [cameraLocations, setCameraLocation] = useState<Vector3[]>([]);
  const [currentTextureIndex, setCurrentTextureIndex] = useState(0);

  const preloadCubeTextures = useCallback((scene: Scene) => {
    const textures = cubeMaps.map((path, index) => {
      const cubeTex = new CubeTexture(path, scene);
      cubeTex.coordinatesMode = Texture.SKYBOX_MODE;

      const pointPosition = scene.getMeshByName("1401-C0" + index)?.position;

      if (pointPosition) {
        const distance = Vector3.Zero().subtract(pointPosition);
        const reflectionMatrix = Matrix.Translation(
          distance.x,
          distance.y,
          distance.z,
        );
        cubeTex.setReflectionTextureMatrix(reflectionMatrix);
      }

      return cubeTex;
    });

    setCubeTextures(textures);
    return textures;
  }, []);

  const createInfoPoints = useCallback((scene: Scene) => {
    for (let i = 0; i < infoPoints.length; i++) {
      createInfoPoint(scene, infoPoints[i].position, infoPoints[i].card_path);
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const { scene, engine } = setupScene(canvasRef.current);

      let camera = scene.getCameraByName("mainCamera");
      if (!camera) {
        camera = new FreeCamera("camera", Vector3.Zero(), scene);
      }

      const material = new StandardMaterial("currentMat", scene);
      material.diffuseColor = Color3.Gray();

      SceneLoader.ImportMesh(
        "",
        "/models/",
        "Collisions_Apto.babylon",
        scene,
        function () {
          const textures = preloadCubeTextures(scene);

          const cameraSpots: Vector3[] = [];
          for (let i = 0; i < textures.length; i++) {
            const spot = scene.getMeshByName("1401-C0" + i)?.position;
            if (spot) cameraSpots.push(spot);
          }
          setCameraLocation(cameraSpots);

          camera.position = cameraSpots[0];
          const mesh = scene.getMeshByName("Collision") as Mesh;
          scene.activeCamera = camera;
          if (mesh) {
            setCollisionMesh(mesh);

            opacityAnimation(mesh, 25);
            cameraAnimation(camera, cameraSpots[1]);

            material.reflectionTexture = textures[0];
            material.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            mesh.material = material;

            const distance = mesh.position.subtract(camera.position);
            const reflectionMatrix = Matrix.Translation(
              distance.x,
              distance.y,
              distance.z,
            );
            textures[0].setReflectionTextureMatrix(reflectionMatrix);

            for (let i = 0; i < cubeMaps.length; i++) {
              const pointPosition = scene.getMeshByName(
                "1401-C0" + i,
              )?.position;
              if (pointPosition)
                createHotpot(scene, i, pointPosition, () => {
                  setCurrentTextureIndex(i);
                  cameraAnimation(camera, cameraSpots[i]);
                  scene.beginAnimation(camera, 0, 100, false, 1, () => {
                    material.reflectionTexture = textures[i];
                  });
                });
            }
            createInfoPoints(scene);
          }
        },
      );

      setScene(scene);
      engine.runRenderLoop(() => {
        scene.render();
      });

      window.addEventListener("resize", () => {
        engine.resize();
      });

      return () => {
        scene.dispose();
        engine.dispose();
      };
    }
  }, [createInfoPoints, preloadCubeTextures]);

  const handleChangeTexture = useCallback(
    (index: number) => {
      if (scene && collisionMesh && cubeTextures.length > index) {
        const camera = scene.getCameraByName("mainCamera") as FreeCamera;

        cameraAnimation(camera, cameraLocations[index]);
        scene.beginAnimation(camera, 0, 100, false, 1, () => {
          const material = collisionMesh.material as StandardMaterial;
          material.reflectionTexture = cubeTextures[index];

          // console.log("Index base : " + index);
          setCurrentTextureIndex(index);
          // console.log("This the current index: " + currentTextureIndex);
        });
        scene.beginAnimation(collisionMesh, 0, 100, false);
        scene.render();
      }
    },
    [scene, cubeTextures, collisionMesh, cameraLocations],
  );

  return (
    <div>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="flex flex-row justify-center w-full bottom-0 space-x-2 absolute">
        <Button
          onClick={() => {
            if (currentTextureIndex > 0)
              handleChangeTexture(currentTextureIndex - 1);
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            if (currentTextureIndex < 8)
              handleChangeTexture(currentTextureIndex + 1);
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-col justify-center absolute bottom-0 top-0 space-y-3 px-4 ">
        {cubeMaps.map((_, index) => (
          <Button
            key={index}
            className="w-[100px]"
            onClick={() => handleChangeTexture(index)}
          >
            Space {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BabylonScene;
