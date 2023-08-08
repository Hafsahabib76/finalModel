import * as THREE from "https://cdn.skypack.dev/three@0.132.2/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
// Inside the <script> tag from the previous code snippet

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd3d3d3);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0x000, 3);
scene.add(directionalLight);

// Load the 360-degree .glb model
const loader = new GLTFLoader();
let model;
loader.load('GWE_new.glb', (gltf) => {
  model = gltf.scene;

   // Traverse the model's children to find clickable meshes and add them to the array
   model.traverse((child) => {
    if (child.isMesh) {
      // Assuming 'clickableArea' is a property on the mesh that indicates it's clickable
      if (child.clickableArea) {
        console.log("isclickableArea");

        clickableObjects.push(child);
      }
    }
  });


  // Set the desired scale factors for the first model
  const scaleFactorX = 7; // Set the size in the X direction
  const scaleFactorY = 7; // Set the size in the Y direction
  const scaleFactorZ = 7; // Set the size in the Z direction

  // Set the scale of the first model
  model.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);

  // Position the model in the scene
  model.position.set(0, 0, 0); // Set the desired position (modify as needed)

  // Add the first model to the scene
  scene.add(model);

  // Optional: Add camera controls (OrbitControls)
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 2, 2);
  controls.update();
});

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);
  // Your model rotation or animation code goes here (e.g., model.rotation.y += 0.01;)
  renderer.render(scene, camera);
}
animate();

camera.position.set(0, 2, 2);
controls.target.set(0, 0, 0);
controls.update();

// Inside the <script> tag from the previous code snippets
// Create a raycaster and a mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to handle mouse clicks
function onMouseClick(event) {

  // Calculate normalized device coordinates from the mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Intersect objects in the scene with the raycaster
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Check for intersections
  if (intersects.length > 0) {
    // You have a click on an object
    const clickedObject = intersects[0].object;

    // Perform actions based on the clicked object (e.g., open another model)
    // ...

    if(clickedObject.name === "mesh_300"){
        console.log("mesh_300 clicked");
        loadAnotherModel(clickedObject, model);
    } else {
        console.log("no mesh");
    }

  }
}

// Attach the onMouseClick function to the document's click event
document.addEventListener('click', onMouseClick, false);

// Inside the <script> tag from the previous code snippets

// // Function to load and display another model
// function loadAnotherModel(clickedObject, firstModel) {
//     const anotherLoader = new GLTFLoader();
//     anotherLoader.load('chair.glb', (gltf) => {
//     // Hide the first model
//     firstModel.visible = false;
//       const anotherModel = gltf.scene;
//       // Position the model based on the clicked block's position
//       anotherModel.position.copy(clickedObject.position);
//       // Add the new model to the scene
//       scene.add(anotherModel);
//     });
// }
  
// Function to load and display another model
function loadAnotherModel(clickedObject, firstModel) {
    
  
    // Hide the first model
    firstModel.visible = false;
  
    const anotherLoader = new GLTFLoader();
    anotherLoader.load('chair.glb', (gltf) => {
      const anotherModel = gltf.scene;
      // Position the model based on the clicked block's position
      anotherModel.position.copy(clickedObject.position);
      // Add the new model to the scene
      scene.add(anotherModel);
  
    });
  }
  
