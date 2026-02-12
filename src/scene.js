import * as THREE from 'three';

/**
 * Creates and configures the Three.js scene with camera, lights, and fog
 */
export function createScene() {
  // Create scene
  const scene = new THREE.Scene();
  
  // Set background color (matching fog color)
  scene.background = new THREE.Color(0x87ceeb);
  
  // Configure exponential fog for infinite terrain illusion
  const fogColor = 0x87ceeb; // Sky blue
  const fogDensity = 0.001; // Tuned to hide far-field LOD reduction
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);
  
  return scene;
}

/**
 * Creates and configures the camera with proper positioning
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    1000 // Far plane - high enough to see distant terrain
  );
  
  // Position camera above terrain with slight downward angle
  // Start further back so terrain is in front of camera
  camera.position.set(0, 3, 8);
  camera.rotation.x = -0.3; // ~17 degrees downward tilt
  
  return camera;
}

/**
 * Creates directional lighting for terrain visualization
 */
export function createLights(scene) {
  // Main directional light (simulating sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(1, 1, 0.5).normalize();
  scene.add(directionalLight);
  
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  return {
    directionalLight,
    ambientLight
  };
}

/**
 * Creates and configures the WebGL renderer
 */
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  return renderer;
}

/**
 * Handles window resize events
 */
export function onWindowResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
