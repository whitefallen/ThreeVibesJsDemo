# Living Shader Terrain

A real-time, procedurally generated terrain visualization system built with Three.js, featuring shader-based displacement and infinite terrain appearance.

## Features

- **Procedural Terrain Generation**: All terrain displacement computed entirely on the GPU using custom GLSL shaders
- **Infinite Appearance**: Stationary mesh with world-space noise sampling creates the illusion of infinite terrain as the camera moves
- **Shader-Based Displacement**: Vertex shader implements 2D simplex noise and Fractal Brownian Motion (FBM)
- **Normal Reconstruction**: Vertex shader reconstructs normals using finite difference approximation for accurate lighting
- **Distance-Based LOD**: Performance optimization reducing FBM octaves for distant vertices
- **Temporal Animation**: Slow tectonic/breathing effect through domain-space noise manipulation
- **Physically-Based Rendering**: Fragment shader with Lambert diffuse lighting, height-based coloring, and exponential fog
- **Automatic Camera Movement**: Smooth forward drift with optional mouse look control

## Technical Implementation

### Architecture
- **Geometry**: Single `PlaneGeometry` (256×256 subdivisions, 10×10 world units) permanently at origin
- **Infinite Illusion**: Camera position tracked via `uWorldOffset` uniform; vertex shader samples noise at world-space coordinates
- **Noise**: Custom GLSL implementation of 2D simplex noise with 3-5 octave FBM
- **Animation**: Time-based domain warping for geological movement effect
- **Lighting**: Reconstructed vertex normals, directional light, height-based earth tone gradients
- **Fog**: `THREE.FogExp2` for infinite horizon effect

### Performance
- Target: 60fps on modern desktop browsers
- 65,536 vertices with shader-based LOD optimization
- Reduced octaves for distant geometry to prevent aliasing and improve performance

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The project is configured for automatic deployment to GitHub Pages via GitHub Actions:

1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys to GitHub Pages
3. Access at: `https://whitefallen.github.io/ThreeVibesJsDemo/`

## Project Structure

```
/src
  main.js              # Entry point, animation loop, camera control
  scene.js             # Scene setup, camera, lights, fog
  terrain.js           # Terrain mesh, material, uniforms
  shaders/
    terrain.vert.glsl  # Vertex shader: displacement, normal reconstruction, LOD
    terrain.frag.glsl  # Fragment shader: lighting, coloring, fog
/public                # Static assets
index.html             # HTML entry point
vite.config.js         # Vite configuration with GitHub Pages base path
package.json           # Dependencies and scripts
.github/workflows/
  deploy.yml           # GitHub Actions deployment workflow
```

## Shader Details

### Vertex Shader
- Implements 2D simplex noise algorithm
- FBM with configurable octaves (3-5 based on distance)
- World-space coordinate sampling for infinite effect
- Finite difference normal reconstruction
- Distance-based LOD optimization

### Fragment Shader
- Lambert diffuse lighting model
- Height-based color gradients (dark valleys to light peaks)
- Optional slope-based variation
- Manual exponential fog blending

## Controls

- **Mouse Movement** (if enabled): Rotate camera view
- Camera automatically drifts forward through the terrain

## Configuration

Key parameters in `src/main.js`:
- `CAMERA_SPEED`: Forward drift speed (units/second)
- `CAMERA_HEIGHT`: Height above terrain
- `CAMERA_TILT`: Downward viewing angle
- `ENABLE_MOUSE_LOOK`: Toggle mouse control

Key uniforms in `src/terrain.js`:
- `uScale`: Horizontal noise frequency
- `uHeight`: Vertical displacement amplitude
- `uTime`: Temporal animation
- `uWorldOffset`: Camera position for world-space sampling

## Browser Compatibility

Tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires WebGL 1.0+ support.

## License

MIT