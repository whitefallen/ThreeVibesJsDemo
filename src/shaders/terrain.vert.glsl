// Vertex Shader for Living Shader Terrain
// Implements procedural displacement, normal reconstruction, and distance-based LOD

uniform float uTime;
uniform vec2 uWorldOffset;
uniform float uScale;
uniform float uHeight;
uniform vec2 uCameraXZ;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDistance;

// 2D Simplex noise implementation
// Based on simplified simplex noise algorithm
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractal Brownian Motion with temporal animation
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  // Slow temporal offset for tectonic/breathing effect
  vec2 timeOffset = vec2(uTime * 0.05, uTime * 0.03);
  
  for (int i = 0; i < 5; i++) {
    if (i >= octaves) break;
    
    // Add temporal animation through domain warping
    vec2 samplePos = p * frequency + timeOffset * (0.5 + float(i) * 0.1);
    value += snoise(samplePos) * amplitude;
    
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Sample height at a given world position
float sampleHeight(vec2 worldPos, int octaves) {
  return fbm(worldPos * uScale, octaves) * uHeight;
}

void main() {
  // Convert local vertex position to world space
  vec2 worldPos = vec2(position.x, position.z) + uWorldOffset;
  
  // Calculate distance to camera for LOD
  vec2 vertexXZ = worldPos;
  float distanceToCamera = length(vertexXZ - uCameraXZ);
  vDistance = distanceToCamera;
  
  // Distance-based LOD: reduce octaves for distant vertices
  int octaves = 5;
  if (distanceToCamera > 50.0) {
    octaves = 3;
  } else if (distanceToCamera > 30.0) {
    octaves = 4;
  }
  
  // Sample height at this vertex position
  float height = sampleHeight(worldPos, octaves);
  
  // Displace vertex along Y axis
  vec3 displacedPosition = position;
  displacedPosition.y = height;
  
  // Normal reconstruction using finite differences
  float delta = 0.05; // Finite difference step size
  float heightL = sampleHeight(worldPos + vec2(-delta, 0.0), octaves);
  float heightR = sampleHeight(worldPos + vec2(delta, 0.0), octaves);
  float heightD = sampleHeight(worldPos + vec2(0.0, -delta), octaves);
  float heightU = sampleHeight(worldPos + vec2(0.0, delta), octaves);
  
  // Compute tangent vectors
  vec3 tangentX = normalize(vec3(2.0 * delta, heightR - heightL, 0.0));
  vec3 tangentZ = normalize(vec3(0.0, heightU - heightD, 2.0 * delta));
  
  // Cross product to get normal
  vec3 reconstructedNormal = normalize(cross(tangentZ, tangentX));
  
  // Pass to fragment shader
  vNormal = reconstructedNormal;
  vPosition = displacedPosition;
  
  // Transform to clip space
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
