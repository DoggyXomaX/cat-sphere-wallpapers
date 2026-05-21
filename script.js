import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const cols = 2;
let rows = 1;
const texture = new THREE.TextureLoader().load("./assets/mixed2.webp", () => {
  rows = texture.image.naturalHeight / (texture.image.naturalWidth / cols) | 0
  texture.repeat.set(1 / cols, 1 / rows);
  transitionTexture.repeat.set(1 / cols, 1 / rows);
});
texture.colorSpace = THREE.SRGBColorSpace;
const transitionTexture = new THREE.TextureLoader().load("./assets/mixed2.webp");
transitionTexture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.SphereGeometry(1, 6, 6);
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: true });
const transitionMaterial = new THREE.MeshBasicMaterial({ map: transitionTexture, side: THREE.FrontSide, transparent: true });

const mainScale = 0.8;
const sphere = new THREE.Mesh(geometry, material);
sphere.scale.set(0.75 * mainScale, 0.75 * mainScale, 0.85 * mainScale);
sphere.rotation.reorder("YXZ");
scene.add(sphere);
const transitionSphere = new THREE.Mesh(geometry, transitionMaterial);
transitionSphere.scale.copy(sphere.scale);
transitionSphere.rotation.reorder("YXZ");
scene.add(transitionSphere);

const DEG2RAD = Math.PI / 180;

let isForward = 0;
let targetForward = -1;
let rotationY = 0;
let rotationX = 0;
let targetRotationX = 0;
const speed = 0.02;
const skinInterval = 5000;
const blinkInterval = 1500;
const rotationXInterval = 1000;
const rotationXSpread = 25 * DEG2RAD;
const closeBlinkInterval = 200;
const randomAspect = 0.6;
const transitionInterval = 0.75;
const transitionDistance = 4.0;
let skin = 0;
let prevSkin = 0;
let transition = skinInterval;
let isBlink = false;

const lerp = (a, b, t) => {
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return a + (b - a) * t;
};

const setFrame = (x, y) => texture.offset.set(x / cols, 1 - (y + 1) / rows);
const setTransitionFrame = (x, y) => transitionTexture.offset.set(x / cols, 1 - (y + 1) / rows);

const updateFrame = () => {
  setFrame(isBlink ? 1 : 0, skin | 0);
  setTransitionFrame(isBlink ? 1 : 0, prevSkin | 0);
};

const onSkinInterval = () => {
  window.setTimeout(onSkinInterval, skinInterval);
  prevSkin = skin;
  skin = (skin + 1) % rows;
  transition = 0;
  updateFrame();
};

// Changes blink frame
const onBlinkInterval = () => {
  const interval = (1 - randomAspect + randomAspect * Math.random()) * (isBlink ? blinkInterval : closeBlinkInterval);
  window.setTimeout(onBlinkInterval, interval);
  isBlink = !isBlink;
  updateFrame();
};

// Changes target x rotation
const onXInterval = () => {
  const interval = (1 - randomAspect + Math.random() * randomAspect) * rotationXInterval;
  window.setTimeout(onXInterval, interval);
  targetRotationX = Math.random() * rotationXSpread * 2 - rotationXSpread;
};

let prevTime = 0;
const animate = (time) => {
  window.requestAnimationFrame(animate);

  const deltaTime = (time - prevTime) / 1000;
  prevTime = time;

  if (isForward > 0) {
    rotationY += speed * isForward;
    if (rotationY > Math.PI / 6) targetForward = -targetForward;
  } else {
    rotationY += speed * isForward;
    if (rotationY < -Math.PI / 6) targetForward = -targetForward;
  }

  rotationX = lerp(rotationX, targetRotationX, deltaTime * 2);
  isForward = lerp(isForward, targetForward, deltaTime * 5);

  sphere.rotation.y = rotationY - Math.PI / 2;
  sphere.rotation.z = rotationX;

  if (transition < transitionInterval) {
    transition += deltaTime;

    const t = transition / transitionInterval;
    sphere.position.setY(transitionDistance * (1 - t));
    transitionSphere.position.setY(-transitionDistance * t);
    transitionSphere.rotation.copy(sphere.rotation);
  } else {
    sphere.position.setY(0);
    transitionSphere.position.setY(-transitionDistance);
  }

  renderer.render(scene, camera);
};

onSkinInterval();
onBlinkInterval();
onXInterval();
animate(0);
