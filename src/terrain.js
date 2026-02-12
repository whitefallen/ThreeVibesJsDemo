import * as THREE from 'three';
import vertexShader from './shaders/terrain.vert.glsl?raw';
import fragmentShader from './shaders/terrain.frag.glsl?raw';

/**
 * Creates the terrain mesh with custom shader material
 * The mesh stays permanently at the origin - only uniforms change
 */
export function createTerrain(scene) {
  // Create plane geometry with high subdivision for smooth displacement
  // 256x256 = 65,536 vertices - manageable for modern GPUs
  const geometry = new THREE.PlaneGeometry(
    10, // Width in world units
    10, // Height in world units
    256, // Width segments
    256  // Height segments
  );
  
  // Rotate to horizontal (XZ plane)
  geometry.rotateX(-Math.PI / 2);
  
  // Get fog parameters from scene (if fog exists)
  const fogColor = scene.fog ? scene.fog.color : new THREE.Color(0x87ceeb);
  const fogDensity = scene.fog ? scene.fog.density : 0.001;
  
  // Initialize shader uniforms
  const uniforms = {
    uTime: { value: 0.0 },
    uWorldOffset: { value: new THREE.Vector2(0, 0) },
    uScale: { value: 0.3 }, // Horizontal noise frequency
    uHeight: { value: 2.0 }, // Vertical displacement amplitude
    uCameraXZ: { value: new THREE.Vector2(0, 0) },
    uLightDirection: { value: new THREE.Vector3(1, 1, 0.5).normalize() },
    uFogColor: { value: fogColor },
    uFogDensity: { value: fogDensity }
  };
  
  // Create shader material
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    wireframe: false
  });
  
  // Create mesh
  const mesh = new THREE.Mesh(geometry, material);
  
  // CRITICAL: Mesh position stays at origin and never changes
  mesh.position.set(0, 0, 0);
  
  scene.add(mesh);
  
  return {
    mesh,
    uniforms
  };
}

/**
 * Updates terrain uniforms each frame
 * Must be called before rendering
 */
export function updateTerrainUniforms(uniforms, time, cameraPosition) {
  // Update time for temporal animation
  uniforms.uTime.value = time;
  
  // Update world offset to track camera position (x, z only)
  uniforms.uWorldOffset.value.set(cameraPosition.x, cameraPosition.z);
  
  // Update camera XZ position for distance calculations in shader
  uniforms.uCameraXZ.value.set(cameraPosition.x, cameraPosition.z);
}
