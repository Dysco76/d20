/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let rolling = false;

const D20Scene = () => {
  const containerRef = useRef();

  const handleClick = () => {
    rolling = true;

    setTimeout(() => {
        rolling = false;
        }, 3000);
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Enable soft shadows
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 0.5;
    camera.position.y = 0.2;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    //Add a simple floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x245f87 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add lighting to the scene
    const pointLight = new THREE.PointLight(0xffffff, 0.1);
    pointLight.position.set(2, 2, 3);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048 * 2;
    pointLight.shadow.mapSize.height = 2048 * 2;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 50;

    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    scene.background = new THREE.Color(0x245f87);

    let d20Model;

    const loader = new GLTFLoader();
    loader.load(
      "models/d-20-red/scene.gltf",
      (gltf) => {
        const scale = 2; // Adjust this value to increase or decrease the scale
        gltf.scene.scale.set(scale, scale, scale);
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true; // Enable each mesh in the model to cast shadows
            child.name = "d20";
          }
        });
        gltf.scene.position.y += 0.1;
        scene.add(gltf.scene);
        d20Model = gltf.scene;
      },
      undefined,
      (error) => console.error(error)
    );

    const animate = () => {
      requestAnimationFrame(animate);
      // Apply a simple rotation animation to the d20
      if (d20Model && rolling) {
        d20Model.rotation.x += 0.1;
        d20Model.rotation.y += 0.01;
        d20Model.rotation.z += 0.1;
      }

      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    return () => {
        containerRef.current.removeChild(renderer.domElement);
      };
  }, []);

  return (
    <div ref={containerRef}>
      <button onClick={handleClick}>Roll d20</button>
    </div>
  );
};

export default D20Scene;
