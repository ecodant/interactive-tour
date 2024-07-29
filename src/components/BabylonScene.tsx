import React, { useEffect, useRef, useState, useCallback } from "react";
//Import Scenes and Utils
import { setupScene } from "@/lib/sceneSetup";
import { cubeMaps, infoPoints } from "@/lib/vrTourInfo";
import { assignHotspotEvent, createHotspot } from "@/lib/hotspots";
import { createInfoPoint } from "@/lib/infoPoints";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Scene,
  FreeCamera,
  Vector3,
  SceneLoader,
  Mesh,
  CubeTexture,
  StandardMaterial,
  Color3,
  Texture,
  Matrix,
  UniversalCamera,
} from "@babylonjs/core";
import { Button } from "../components/ui/button";

const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [collisionMesh, setCollisionMesh] = useState<Mesh | null>(null);
  const [cubeTextures, setCubeTextures] = useState<CubeTexture[]>([]);
  const [currentTextureIndex, setCurrentTextureIndex] = useState(0);

  const preloadCubeTextures = useCallback((scene: Scene) => {
    const textures = cubeMaps.map((path) => new CubeTexture(path, scene));
    setCubeTextures(textures);
    return textures;
  }, []);

  const loadHotspots = useCallback(
    (scene: Scene, cubTextures: CubeTexture[]) => {
      cubeMaps.forEach((_, index) => {
        const hotspot = createHotspot(scene, index);
        assignHotspotEvent(
          scene,
          hotspot,
          index,
          cubTextures,
          setCurrentTextureIndex,
        );
      });
    },
    [],
  );

  const createInfoPoints = useCallback((scene: Scene) => {
    infoPoints.forEach((point) => createInfoPoint(scene, point.position));
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const { scene, engine } = setupScene(canvasRef.current);

      let camera = scene.getCameraByName("mainCamera");
      if (!camera) {
        camera = new UniversalCamera("camera", Vector3.Zero(), scene);
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

          camera.position = scene.getMeshByName("1401-C00")!.position;
          const mesh = scene.getMeshByName("Collision") as Mesh;
          // console.log("First updated of the mesh, bro");
          scene.activeCamera = camera;
          if (mesh) {
            setCollisionMesh(mesh);
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

            loadHotspots(scene, textures);
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
  }, [createInfoPoints, loadHotspots, preloadCubeTextures]);

  const handleChangeTexture = useCallback(
    (index: number) => {
      if (scene && collisionMesh && cubeTextures.length > index) {
        const material = collisionMesh.material as StandardMaterial;
        material.reflectionTexture = cubeTextures[index];
        material.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        const camera = scene.getCameraByName("mainCamera") as FreeCamera;
        camera.position = scene.getMeshByName("1401-C0" + index)!.position;
        const distance = collisionMesh.position.subtract(camera.position);
        const reflectionMatrix = Matrix.Translation(
          distance.x,
          distance.y,
          distance.z,
        );
        cubeTextures[index].setReflectionTextureMatrix(reflectionMatrix);

        setCurrentTextureIndex(index);
        scene.render();
      }
    },
    [scene, cubeTextures, collisionMesh],
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
