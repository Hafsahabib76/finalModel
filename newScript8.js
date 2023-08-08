
import * as THREE from "https://cdn.skypack.dev/three@0.132.2/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js";
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';

// SCENE CREATION
const scene = new THREE.Scene();
scene.background = new THREE.Color('#c8f0f9');

// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true }) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
document.body.appendChild(renderer.domElement);

// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 1);
scene.add(camera);

// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82)
scene.add(ambient);
const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96)
sunLight.position.set(-79, 44, 25)
scene.add(sunLight);

// const ambientLight = new THREE.AmbientLight(0xffffff);
// scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0x000, 3);
// scene.add(directionalLight);


// LOAD THE 360-DEGREE MAIN MODEL (.glb)
const loader = new GLTFLoader();
let model;
loader.load('GWE_new.glb', (gltf) => {
  model = gltf.scene;

  setModelScale(model, 3.2, 3.2, 3.2);
  // Position the model in the scene
  model.position.set(0, 0, 0); 

  // Add the main model to the scene
  scene.add(model);
});

function setModelScale(model, x, y, z){
  // Set the desired scale factors for the first model
  const scaleFactorX = x;
  const scaleFactorY = y; 
  const scaleFactorZ = z; 

  // Set the scale of the first model
  model.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);

}

// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
  controls.enableDamping = true
  controls.dampingFactor = 0.04
  controls.minDistance = 1.6
  controls.maxDistance = 60
  controls.enableRotate = true
  controls.enableZoom = false
  controls.maxPolarAngle = Math.PI / 2.5
}
setOrbitControlsLimits();

// RENDER LOOP FUNCTION
function renderLoop() {
  controls.update() // update orbit controls
  TWEEN.update(); //update the TWEEN animations
  renderer.render(scene, camera) // render the scene using the camera
  requestAnimationFrame(renderLoop) // loop the render function
}
renderLoop() // start rendering

/* *********************************** RAYCASTER ********************************** */
let clicksEnabled = true;
let clickedObject, clickedPoint;
// CREATE A RAYCASTER AND A MOUSE VECTOR
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// FUNCTION TO HANDLE MOUSE CLICKS ON MAIN MODEL
function onMouseClick(event) {
  if (!clicksEnabled) {
    return;
  }
  // Calculate normalized device coordinates from the mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Intersect objects in the scene with the raycaster
  const intersects = raycaster.intersectObjects(scene.children, true);
  const intersect2 = raycaster.intersectObjects([model], true);
  // Check for intersections
  if (intersects.length > 0) {
    // console.log(intersects);
    clickedObject = intersects[0].object;
    console.log(clickedObject);
    clickedPoint = intersect2[0].point;
    // console.log(clickedObject);
    if (clickedObject.name === 'mesh_248') {
      console.log('mesh_300 clicked');
      animateZoomInAndScale(clickedPoint, model);
    } else {
      console.log('no mesh');
    }
  }
}

// Attach the onMouseClick function to the document's click event
document.addEventListener('click', onMouseClick, false);

// Function to animate zoom in and scale for the first model
function animateZoomInAndScale(clickedPoint, firstModel) {
  const targetPosition = clickedPoint.clone();
  console.log(targetPosition);
  const initialScale = firstModel.scale.clone();

  // Zoom in and scale animation
  new TWEEN.Tween(camera.position)
    .to({ x: targetPosition.x, y: targetPosition.y +3, z: targetPosition.z}, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      controls.update();
    })
    .start();

  new TWEEN.Tween(firstModel.scale)
    .to({ x: initialScale.x * 8, y: initialScale.y * 8, z: initialScale.z * 8 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      firstModel.visible = true;
    })
    .onComplete(() => {
      hideFirstModelAndLoadAnother(firstModel, targetPosition);
    })
    .start();
}

// Create a cross-circle button
const backButton = document.createElement('button');
backButton.innerHTML = '&#10005;'; // Cross symbol as button text
backButton.style.position = 'absolute';
backButton.style.bottom = '10%';
backButton.style.left = '50%';
backButton.style.transform = 'translateX(-50%)';
backButton.style.padding = '5px 10px';
backButton.style.fontSize = '20px';
backButton.style.cursor = 'pointer';
backButton.style.display = 'none';
document.body.appendChild(backButton);

let anotherModelData;
let isAnotherModelVisible = false;

// Function to hide the second model and show the first model
function goBackToMainModel(anotherModel, mainModel) {
  if (anotherModel){
    setModelScale(mainModel, 6, 6, 6);
    mainModel.visible = true;
    anotherModel.visible = false;
    isAnotherModelVisible = false;
    backButton.style.display = 'none';
    clicksEnabled = true; // Enable clicks again
  }
}

// Function to animate zoom out and scale for the main model
function animateZoomOutAndScale(mainModel, anotherModel, targetPosition) {
  const initialScale = anotherModel.scale.clone();

  // Zoom out and scale animation
  new TWEEN.Tween(camera.position)
    .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z + 3 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      controls.update();
    })
    .start();

  new TWEEN.Tween(anotherModel.scale)
    .to({ x: initialScale.x / 2, y: initialScale.y / 2, z: initialScale.z / 2 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      anotherModel.visible = true;
    })
    .onComplete(() => {
        goBackToMainModel(anotherModel, mainModel);
    })
    .start();
}

// Attach the onClick function to the backButton's click event
backButton.addEventListener('click', () => {
  if (isAnotherModelVisible) {
    // goBackToMainModel(model, anotherModelData);
    animateZoomOutAndScale(model, anotherModelData, clickedPoint);
  }
});


// Function to hide the first model and load the second model
function hideFirstModelAndLoadAnother(firstModel, targetPosition) {
  // Hide the first model
  firstModel.visible = false;

  const anotherLoader = new GLTFLoader();
  anotherLoader.load('fac.glb', (gltf) => {
    const anotherModel = gltf.scene;

    // Position the model based on the clicked block's position
    // anotherModel.position.copy(targetPosition);
    anotherModel.position.set(0, 0, 0); 
    // Add the new model to the scene
    scene.add(anotherModel);
    camera.position.set(0, 0, 1);

    // Animate the second model (optional)
    new TWEEN.Tween(anotherModel.rotation)
    .to({ y: anotherModel.rotation.y - Math.PI }, 1000)  // Rotate by half the angle anticlockwise
    .easing(TWEEN.Easing.Linear.None)
    .start();

    backButton.style.display = 'block';
    anotherModelData = anotherModel;
    isAnotherModelVisible = true;
    clicksEnabled = false; // Disable clicks
  });
}

