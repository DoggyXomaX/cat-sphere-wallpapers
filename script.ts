import * as THREE from "three"

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

const texture = new THREE.TextureLoader().load("./assets/gleep2.png");
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.SphereGeometry(1, 32, 16);

const material = new THREE.MeshBasicMaterial({
  map: texture,
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta();

  sphere.rotation.y += delta * 0.6;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});