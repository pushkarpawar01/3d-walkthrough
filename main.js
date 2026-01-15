import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 0, 100);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.6, 0); // Eye level height

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Building materials
const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf0f0f0,
    roughness: 0.8,
    metalness: 0.2
});

const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B7355,
    roughness: 0.9,
    metalness: 0.1
});

const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.1
});

const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,
    roughness: 0.8,
    metalness: 0.1
});

// Building dimensions
const roomWidth = 10;
const roomDepth = 10;
const roomHeight = 3;
const wallThickness = 0.2;

// Create building structure
function createBuilding() {
    const building = new THREE.Group();
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    building.add(floor);
    
    // Main lobby room
    createRoom(building, 0, 0, roomWidth, roomDepth, roomHeight, 'Lobby');
    
    // Room 1 (to the right)
    createRoom(building, roomWidth + 2, 0, roomWidth, roomDepth, roomHeight, 'Office 1');
    
    // Room 2 (to the left)
    createRoom(building, -(roomWidth + 2), 0, roomWidth, roomDepth, roomHeight, 'Office 2');
    
    // Room 3 (in front)
    createRoom(building, 0, roomDepth + 2, roomWidth, roomDepth, roomHeight, 'Conference Room');
    
    // Room 4 (behind)
    createRoom(building, 0, -(roomDepth + 2), roomWidth, roomDepth, roomHeight, 'Kitchen');
    
    // Hallways connecting rooms
    createHallway(building, roomWidth, 0, 2, roomDepth, roomHeight);
    createHallway(building, -roomWidth, 0, 2, roomDepth, roomHeight);
    createHallway(building, 0, roomDepth, roomWidth, 2, roomHeight);
    createHallway(building, 0, -roomDepth, roomWidth, 2, roomHeight);
    
    return building;
}

function createRoom(group, x, z, width, depth, height, roomName) {
    const room = new THREE.Group();
    room.userData.roomName = roomName;
    
    // Walls
    const wallPositions = [
        { x: 0, z: depth / 2, rot: 0 }, // Front
        { x: 0, z: -depth / 2, rot: 0 }, // Back
        { x: width / 2, z: 0, rot: Math.PI / 2 }, // Right
        { x: -width / 2, z: 0, rot: Math.PI / 2 } // Left
    ];
    
    wallPositions.forEach(pos => {
        const wallGeometry = new THREE.BoxGeometry(
            pos.rot === 0 ? width : wallThickness,
            height,
            pos.rot === 0 ? wallThickness : depth
        );
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(pos.x, height / 2, pos.z);
        wall.rotation.y = pos.rot;
        wall.castShadow = true;
        wall.receiveShadow = true;
        room.add(wall);
    });
    
    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    ceiling.receiveShadow = true;
    room.add(ceiling);
    
    // Room floor
    const roomFloorGeometry = new THREE.PlaneGeometry(width, depth);
    const roomFloor = new THREE.Mesh(roomFloorGeometry, floorMaterial);
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.receiveShadow = true;
    room.add(roomFloor);
    
    // Add room to building at position
    room.position.set(x, 0, z);
    group.add(room);
    
    // Store room bounds for detection
    room.userData.bounds = {
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2
    };
}

function createHallway(group, x, z, width, depth, height) {
    const hallway = new THREE.Group();
    
    // Hallway floor
    const hallwayFloorGeometry = new THREE.PlaneGeometry(width, depth);
    const hallwayFloor = new THREE.Mesh(hallwayFloorGeometry, floorMaterial);
    hallwayFloor.rotation.x = -Math.PI / 2;
    hallwayFloor.receiveShadow = true;
    hallway.add(hallwayFloor);
    
    // Hallway walls (only sides, not ends)
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    hallway.add(leftWall);
    
    const rightWallGeometry = new THREE.BoxGeometry(wallThickness, height, depth);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(width / 2, height / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    hallway.add(rightWall);
    
    // Hallway ceiling
    const hallwayCeilingGeometry = new THREE.PlaneGeometry(width, depth);
    const hallwayCeiling = new THREE.Mesh(hallwayCeilingGeometry, ceilingMaterial);
    hallwayCeiling.rotation.x = Math.PI / 2;
    hallwayCeiling.position.y = height;
    hallwayCeiling.receiveShadow = true;
    hallway.add(hallwayCeiling);
    
    hallway.position.set(x, 0, z);
    group.add(hallway);
}

// Add building to scene
const building = createBuilding();
scene.add(building);

// Store all rooms for detection
const rooms = [];
building.traverse((child) => {
    if (child.userData.roomName) {
        rooms.push(child);
    }
});

// First-person controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

const moveSpeed = 5.0;
const lookSpeed = 0.002;

let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;

// Pointer lock controls
const canvas = renderer.domElement;
canvas.setAttribute('tabindex', '0'); // Make canvas focusable
canvas.style.outline = 'none';
let isPointerLocked = false;

// Focus canvas on load
canvas.focus();

canvas.addEventListener('click', () => {
    canvas.focus();
    canvas.requestPointerLock();
});

// Ensure canvas gets focus when page loads
window.addEventListener('load', () => {
    canvas.focus();
});

// Also focus on any click on the page
document.addEventListener('click', (e) => {
    if (e.target === canvas || canvas.contains(e.target)) {
        canvas.focus();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === canvas;
});

// Mouse movement
document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;
    
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
    euler.setFromQuaternion(camera.quaternion);
    euler.y -= movementX * lookSpeed;
    euler.x -= movementY * lookSpeed;
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    camera.quaternion.setFromEuler(euler);
});

// Keyboard controls - use both document and canvas listeners
function handleKeyDown(event) {
    // Prevent default for space to avoid scrolling
    if (event.code === 'Space') {
        event.preventDefault();
    }
    
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            console.log('W pressed - moveForward:', moveForward);
            break;
        case 'KeyS':
            moveBackward = true;
            console.log('S pressed - moveBackward:', moveBackward);
            break;
        case 'KeyA':
            moveLeft = true;
            console.log('A pressed - moveLeft:', moveLeft);
            break;
        case 'KeyD':
            moveRight = true;
            console.log('D pressed - moveRight:', moveRight);
            break;
        case 'Space':
            moveUp = true;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            moveDown = true;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'Space':
            moveUp = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            moveDown = false;
            break;
    }
}

// Add event listeners to both document and canvas
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('keyup', handleKeyUp);

// Also handle window blur to reset movement
window.addEventListener('blur', () => {
    moveForward = moveBackward = moveLeft = moveRight = moveUp = moveDown = false;
});

// Collision detection (simple box collision)
function checkCollision(newPosition) {
    const playerHeight = 1.6;
    const playerRadius = 0.3;
    
    // Check collision with walls
    const walls = [];
    building.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material === wallMaterial) {
            walls.push(child);
        }
    });
    
    for (const wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                newPosition.x - playerRadius,
                newPosition.y - playerHeight / 2,
                newPosition.z - playerRadius
            ),
            new THREE.Vector3(
                newPosition.x + playerRadius,
                newPosition.y + playerHeight / 2,
                newPosition.z + playerRadius
            )
        );
        
        if (wallBox.intersectsBox(playerBox)) {
            return true;
        }
    }
    
    return false;
}

// Get current room name
function getCurrentRoom() {
    const pos = camera.position;
    
    for (const room of rooms) {
        const bounds = room.userData.bounds;
        if (pos.x >= bounds.minX && pos.x <= bounds.maxX &&
            pos.z >= bounds.minZ && pos.z <= bounds.maxZ) {
            return room.userData.roomName;
        }
    }
    
    return 'Hallway';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now();
    let delta = (time - prevTime) / 1000;
    
    // Clamp delta to prevent large jumps and ensure minimum value
    if (delta > 0.1) delta = 0.1; // Cap at 100ms
    if (delta <= 0) delta = 0.016; // Default to ~60fps if delta is 0 or negative
    
    // Calculate movement direction relative to camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();
    
    // Calculate movement vector
    const moveVector = new THREE.Vector3();
    if (moveForward) moveVector.add(forward);
    if (moveBackward) moveVector.sub(forward);
    if (moveRight) moveVector.add(right);
    if (moveLeft) moveVector.sub(right);
    
    // Debug: Log forward/right vectors when keys are pressed
    if (moveForward || moveBackward || moveLeft || moveRight) {
        console.log('Forward:', forward, 'Right:', right, 'Move flags - F:', moveForward, 'B:', moveBackward, 'L:', moveLeft, 'R:', moveRight);
    }
    
    // Normalize and scale by speed
    if (moveVector.length() > 0) {
        moveVector.normalize();
        moveVector.multiplyScalar(moveSpeed * delta);
        
        // Debug logging
        console.log('Move vector:', moveVector, 'Delta:', delta, 'Speed:', moveSpeed, 'Final length:', moveVector.length());
    } else if (moveForward || moveBackward || moveLeft || moveRight) {
        console.log('WARNING: Move flags set but moveVector is zero!');
    }
    
    // Apply horizontal movement
    const oldPosition = camera.position.clone();
    camera.position.add(moveVector);
    
    // Handle vertical movement
    if (moveUp) {
        camera.position.y += moveSpeed * delta;
    }
    if (moveDown) {
        camera.position.y -= moveSpeed * delta;
    }
    
    // Keep camera at eye level (unless moving up/down)
    if (!moveUp && !moveDown) {
        camera.position.y = 1.6;
    }
    
    // Simple collision - revert if collision detected
    // Temporarily disable to test movement
    // const hasCollision = checkCollision(camera.position);
    // if (hasCollision) {
    //     console.log('Collision detected, reverting movement');
    //     camera.position.copy(oldPosition);
    // }
    
    if (moveVector.length() > 0) {
        console.log('Position before:', oldPosition, 'Position after:', camera.position, 'Move vector:', moveVector);
    }
    
    // Update room display
    const currentRoom = getCurrentRoom();
    document.getElementById('current-room').textContent = currentRoom;
    
    prevTime = time;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();
