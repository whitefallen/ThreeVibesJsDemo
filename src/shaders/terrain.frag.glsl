// Fragment Shader for Living Shader Terrain
// Implements physically-based lighting, height-based coloring, and fog integration

uniform vec3 uLightDirection;
uniform vec3 uFogColor;
uniform float uFogDensity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDistance;

void main() {
  // Normalize the interpolated normal
  vec3 normal = normalize(vNormal);
  
  // Height-based color gradient (geological earth tones)
  vec3 colorLow = vec3(0.20, 0.15, 0.10);      // Dark brown valleys
  vec3 colorMid = vec3(0.40, 0.35, 0.25);      // Medium brown
  vec3 colorHigh = vec3(0.60, 0.55, 0.45);     // Light tan peaks
  
  // Map height to color (smooth transitions)
  float heightNorm = clamp((vPosition.y + 2.0) / 4.0, 0.0, 1.0);
  vec3 baseColor;
  if (heightNorm < 0.5) {
    baseColor = mix(colorLow, colorMid, heightNorm * 2.0);
  } else {
    baseColor = mix(colorMid, colorHigh, (heightNorm - 0.5) * 2.0);
  }
  
  // Optional: Add subtle slope-based variation
  float slope = 1.0 - abs(normal.y);
  baseColor = mix(baseColor, baseColor * 0.9, slope * 0.3);
  
  // Lambert diffuse lighting
  vec3 lightDir = normalize(uLightDirection);
  float diffuse = max(dot(normal, lightDir), 0.0);
  
  // Add ambient lighting to avoid pure black
  float ambient = 0.3;
  float lighting = ambient + diffuse * 0.7;
  
  // Apply lighting to base color
  vec3 litColor = baseColor * lighting;
  
  // Manual exponential fog calculation
  float fogFactor = 1.0 - exp(-uFogDensity * vDistance);
  fogFactor = clamp(fogFactor, 0.0, 1.0);
  
  // Blend with fog color
  vec3 finalColor = mix(litColor, uFogColor, fogFactor);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
