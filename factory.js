import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";

export function createMaterial(texture, columns, rows) {
  texture.repeat.set(1 / columns, 1 / rows);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true });
}

export function createSphere(geometry, material) {
  const sphere = new THREE.Mesh(geometry, material);
  sphere.scale.set(0.6, 0.6, 0.7);
  sphere.rotation.reorder('YXZ');
  return sphere;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;
  return camera;
}

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createGeometry() {
  return new THREE.SphereGeometry(1, 6, 6);
}

export function createScene(...children) {
  const scene = new THREE.Scene();
  children.forEach((child) => scene.add(child));
  return scene;
}