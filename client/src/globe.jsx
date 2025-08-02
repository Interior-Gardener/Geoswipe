import * as THREE from 'three';
import Globe from 'three-globe';
import { io } from "socket.io-client";

// Connect to backend
const socket = io("http://localhost:3000");

// Setup Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add globe
const globe = new Globe()
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
  .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');

scene.add(globe);
scene.add(new THREE.AmbientLight(0xffffff));
camera.position.z = 300;

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Listen for gesture data
socket.on("gesture-from-server", (data) => {
  const g = data.gesture;
  console.log("Gesture received:", g);

  if (g === "pinch") {
    camera.position.z -= 10;
  } else if (g === "open_palm") {
    camera.position.z += 10;
  } else if (g === "pointing") {
    globe.rotation.y += 0.1;
  } else if (g === "fist") {
    globe.rotation.y -= 0.1;
  }
});
