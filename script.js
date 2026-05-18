import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const cols = 2;
const rows = 4;
const texture = new THREE.TextureLoader().load("./assets/mixed2.webp");
texture.colorSpace = THREE.SRGBColorSpace;
texture.repeat.set(1 / cols, 1 / rows);
const setFrame = (x, y) => texture.offset.set(x / cols, 1 - (y + 1) / rows);

const geometry = new THREE.SphereGeometry(1, 128, 32);
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });

const mainScale = 0.8;
const sphere = new THREE.Mesh(geometry, material);
sphere.scale.set(0.75 * mainScale, 0.75 * mainScale, 0.85 * mainScale);
scene.add(sphere);

let isForward = 0;
let targetForward = -1;
let rotationY = 0;
const speed = 0.02;

const lerp = (a, b, t) => {
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return a + (b - a) * t;
};

let prevTime = 0;
const animate = (time) => {
  const deltaTime = (time - prevTime) / 1000;
  prevTime = time;

  if (isForward > 0) {
    rotationY += speed * isForward;
    if (rotationY > Math.PI / 6) targetForward = -targetForward;
  } else {
    rotationY += speed * isForward;
    if (rotationY < -Math.PI / 6) targetForward = -targetForward;
  }

  isForward = lerp(isForward, targetForward, deltaTime * 2);

  sphere.rotation.y = rotationY - Math.PI / 2;

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

animate(0);

const changeInterval = 5000;
const blinkInterval = 1500;
const closeBlinkInterval = 200;
const randomAspect = 0.6;
let skin = 0;
let isBlink = false;

const updateFrame = () => {
  setFrame(isBlink ? 1 : 0, skin | 0);
};

const onInterval = () => {
  window.setTimeout(onInterval, changeInterval);
  skin = (skin + 1) % rows;
  updateFrame();
};

const onBlinkInterval = () => {
  const interval = isBlink ? blinkInterval : closeBlinkInterval;
  window.setTimeout(onBlinkInterval, (1 - randomAspect + randomAspect * Math.random()) * interval);
  isBlink = !isBlink;
  updateFrame();
};

onInterval();
onBlinkInterval();
