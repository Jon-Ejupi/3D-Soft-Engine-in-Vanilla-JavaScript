🧊 TinyJS 3D Engine

A lightweight, "from-scratch" 3D wireframe and polygon rasterizer built using pure JavaScript and the HTML5 2D Canvas API. This project demonstrates the core linear algebra and projection techniques used in modern game engines like Unity or Unreal, but implemented manually without WebGL.
🚀 Features

    Custom 4x4 Matrix Math: Manual implementation of Identity, Rotation, and Translation matrices.

    Perspective Projection: Simulates depth by dividing coordinates by Z, making objects appear smaller as they move away.

    Painter’s Algorithm: A custom depth-sorting system that prevents "see-through" glitches by rendering back-faces before front-faces.

    Homogeneous Coordinates: Supports W component calculations for proper 3D-to-2D translation.

    Real-time Rendering Loop: Uses requestAnimationFrame for smooth 60fps animation.

🛠️ How It Works

The engine follows a standard 3D pipeline:

    Model Space: Defines the cube's vertices as simple {x,y,z} objects.

    World Transform: Multiplies the vertices by a Rotation matrix (to spin it) and a Translation matrix (to push it into the scene).

    Projection: Maps the 3D "World" coordinates to 2D "Screen" coordinates using the formula:
    xscreen​=zworld​xworld​​⋅scale+offset

    Rasterization: The Device class takes these 2D points and uses the Canvas fill() and stroke() methods to draw the actual polygons.

📂 File Structure

    index.html: Holds the <canvas> element (ID: frontBuffer).

    main.js: Contains the Matrix math class, the Device renderer, and the renderLoop.

🎮 Getting Started

    Ensure you have an HTML file with a canvas:
    HTML

    <canvas id="frontBuffer" width="800" height="600"></canvas>

    Include the main.js script.

    Open the HTML file in any modern browser.

📈 Future Improvements

    [ ] Back-face Culling: Optimization to skip drawing faces pointing away from the camera.

    [ ] Lighting: Implement basic Flat or Gouraud shading based on face normals.

    [ ] Camera Class: Move the view logic into a dedicated Camera object for easier navigation.



🌐 Website 
        https://3dtinyjs.netlify.app
