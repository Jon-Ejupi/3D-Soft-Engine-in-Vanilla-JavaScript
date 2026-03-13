// Grab the canvas element where we'll be "painting" our 3D scene
const canvas = document.querySelector('#frontBuffer');

/**
 * Matrix Class: Handles 4x4 linear algebra.
 * This is the engine's "math brain" for rotating and moving objects.
 */
class Matrix {
    constructor() {
        // Initialize as an Identity Matrix (the "1" of matrices)
        this.data = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    /**
     * Projects a 3D vertex (x, y, z) into a new position based on the matrix.
     * Uses Homogeneous Coordinates (w) to allow for translation and perspective.
     */
    multiplyVector(v) {
        const x = v.x * this.data[0] + v.y * this.data[4] + v.z * this.data[8] + this.data[12];
        const y = v.x * this.data[1] + v.y * this.data[5] + v.z * this.data[9] + this.data[13];
        const z = v.x * this.data[2] + v.y * this.data[6] + v.z * this.data[10] + this.data[14];
        const w = v.x * this.data[3] + v.y * this.data[7] + v.z * this.data[11] + this.data[15];
        
        // Perspective Divide: This makes objects smaller as they get further away (Z increases)
        return (w !== 0) ? { x: x / w, y: y / w, z: z / w } : { x, y, z };
    }

    /**
     * Combines two transformations into one (e.g., Rotate AND then Translate).
     */
    static Multiply(a, b) {
        let result = new Matrix();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) { 
                result.data[i * 4 + j] = 
                    a.data[i * 4 + 0] * b.data[0 * 4 + j] +
                    a.data[i * 4 + 1] * b.data[1 * 4 + j] +
                    a.data[i * 4 + 2] * b.data[2 * 4 + j] +
                    a.data[i * 4 + 3] * b.data[3 * 4 + j];
            }
        }
        return result;
    }

    // Creates a matrix that spins an object around the Vertical (Y) axis
    static RotationY(angle) {
        let m = new Matrix();
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        m.data[0] = c;  m.data[2] = -s;
        m.data[8] = s;  m.data[10] = c;
        return m;
    }

    // Creates a matrix that moves an object in 3D space
    static Translation(x, y, z) {
        let m = new Matrix();
        m.data[12] = x;
        m.data[13] = y;
        m.data[14] = z;
        return m;
    }
}

/**
 * Device Class: Handles the actual drawing onto the HTML5 Canvas.
 */
class Device {
    constructor(canvas) {
        this.workingCanvas = canvas;
        this.workingContext = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    // Draws a polygon (face) and fills it with color
    drawFace(points, color) {
        this.workingContext.beginPath();
        this.workingContext.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.workingContext.lineTo(points[i].x, points[i].y);
        }
        this.workingContext.closePath();
        this.workingContext.fillStyle = color;
        this.workingContext.fill();
        this.workingContext.strokeStyle = "white"; // Wireframe outline
        this.workingContext.stroke();
    }

    clear() {
        this.workingContext.clearRect(0, 0 , this.width, this.height);
    }
}

const device = new Device(canvas);

// The 8 corners of a cube in 3D space
const cubeVertices = [
    {x: -1, y:  1, z: 1}, {x:  1, y:  1, z: 1},
    {x: -1, y: -1, z: 1}, {x:  1, y: -1, z: 1},
    {x: -1, y:  1, z: -1}, {x:  1, y:  1, z: -1},
    {x: -1, y: -1, z: -1}, {x:  1, y: -1, z: -1}
];

// Define which vertices connect to form the 6 square faces of the cube
const cubeFaces = [
    [0, 1, 3, 2], // Front
    [4, 5, 7, 6], // Back
    [2, 3, 7, 6], // Bottom
    [0, 2, 6, 4], // Left
    [1, 3, 7, 5]  // Right
];

let rotation = 0;

function renderLoop() {
    device.clear();
    rotation += 0.02; // Increment rotation for animation

    // 1. Setup Transformation Matrices
    const rotMat = Matrix.RotationY(rotation);
    const transMat = Matrix.Translation(0, 0, 5); // Push cube 5 units into the screen
    
    // Combine Rotation and Translation: Order matters (TRS: Translate, Rotate, Scale)
    const worldMat = Matrix.Multiply(rotMat, transMat);

    // 2. Project 3D points to 2D screen coordinates
    const projectedPoints = cubeVertices.map(v => {
        let worldV = worldMat.multiplyVector(v);
        return {
            // Simple perspective projection: Divide X and Y by Z
            x : (worldV.x / worldV.z) * (device.width * 0.5) + device.width / 2,
            y :(worldV.y / worldV.z) * (device.height * 0.5) + device.height / 2,
            z: worldV.z // Keep Z for sorting
        }
    });

    // 3. Painter's Algorithm: Sort faces by depth (Z)
    // We calculate the average Z of each face so the furthest faces are drawn first.
    // This prevents "see-through" glitches where back faces appear over front faces.
    const renderFaces = cubeFaces.map(indices => {
        const argZ = (
            projectedPoints[indices[0]].z +
            projectedPoints[indices[1]].z +
            projectedPoints[indices[2]].z +
            projectedPoints[indices[3]].z 
        ) / 4;
        return {indices, argZ};
    });

    // Sort descending by Z (Back-to-Front)
    renderFaces.sort((a, b) => b.argZ - a.argZ);

    // 4. Draw the sorted faces
    renderFaces.forEach(face => {
        const points = face.indices.map(i => projectedPoints[i]);
        device.drawFace(points, "rgba(0, 150, 255, 0.7)"); 
    });
  
    requestAnimationFrame(renderLoop);
}

renderLoop();