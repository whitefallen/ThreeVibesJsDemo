import * as THREE from 'three';
import { createScene, createCamera, createRenderer, createLights, onWindowResize } from './scene.js';
import { createTerrain, updateTerrainUniforms } from './terrain.js';

/**
 * Main application entry point
 * Initializes the Living Shader Terrain system and animation loop
 */

// Initialize scene components
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
const lights = createLights(scene);
const terrain = createTerrain(scene);

// Add renderer to DOM
const container = document.getElementById('canvas-container');
container.appendChild(renderer.domElement);

// Clock for animation timing
const clock = new THREE.Clock();

// Camera movement configuration
const CAMERA_SPEED = 0.5; // Units per second (forward drift speed) - reduced for debugging
const CAMERA_HEIGHT = 3.0; // Height above terrain
const CAMERA_TILT = -0.3; // Downward tilt in radians (~17 degrees) - increased to see terrain better

// Optional mouse look state (set to false to disable)
const ENABLE_MOUSE_LOOK = true;
let mouseX = 0;
let mouseY = 0;
const mouseSensitivity = 0.002;

// Mouse look event listeners
if (ENABLE_MOUSE_LOOK) {
  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  });
}

/**
 * Updates camera position with automatic forward drift
 */
function updateCamera(deltaTime) {
  // Get camera's forward direction (in XZ plane)
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(camera.quaternion);
  forward.y = 0; // Keep movement in XZ plane
  forward.normalize();
  
  // Move camera forward
  camera.position.x += forward.x * CAMERA_SPEED * deltaTime;
  camera.position.z += forward.z * CAMERA_SPEED * deltaTime;
  
  // Maintain constant height
  camera.position.y = CAMERA_HEIGHT;
  
  // Optional mouse look (rotate camera based on mouse position)
  if (ENABLE_MOUSE_LOOK) {
    // Horizontal rotation (yaw)
    const targetYaw = mouseX * Math.PI * 0.25; // ±45 degrees max
    
    // Vertical rotation (pitch) - clamped to prevent looking straight up/down
    const targetPitch = CAMERA_TILT + mouseY * 0.3; // Base tilt ± 17 degrees
    const clampedPitch = Math.max(-0.5, Math.min(0.1, targetPitch));
    
    // Smooth interpolation for camera rotation
    camera.rotation.y += (targetYaw - camera.rotation.y) * 0.1;
    camera.rotation.x += (clampedPitch - camera.rotation.x) * 0.1;
  } else {
    // Fixed forward-looking camera
    camera.rotation.x = CAMERA_TILT;
    camera.rotation.y = 0;
  }
}

/**
 * Main animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();
  
  // Update camera position (automatic forward drift)
  updateCamera(deltaTime);
  
  // Update terrain uniforms with current time and camera position
  // CRITICAL: This must happen every frame before rendering
  updateTerrainUniforms(terrain.uniforms, elapsedTime, camera.position);
  
  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  onWindowResize(camera, renderer);
});

// Log startup info
console.log('Living Shader Terrain initialized');
console.log(`Terrain subdivisions: 256x256 (${256 * 256} vertices)`);
console.log(`Camera speed: ${CAMERA_SPEED} units/second`);
console.log(`Mouse look: ${ENABLE_MOUSE_LOOK ? 'enabled' : 'disabled'}`);
console.log('Scene children:', scene.children.length);
console.log('Camera position:', camera.position);
console.log('Terrain mesh position:', terrain.mesh.position);

// Expose for debugging
window.DEBUG = { scene, camera, terrain };

// Start animation loop
animate();
