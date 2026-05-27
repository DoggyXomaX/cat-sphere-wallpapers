import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";
import { lerp } from './utils.js';

const DEG2RAD = Math.PI / 180;

const World = {
  scene: null,
  geometry: null,
  renderer: null,
  camera: null,
  texture: null,
  transitionTexture: null,
  material: null,
  transitionMaterial: null,
  sphere: null,
  transitionSphere: null,
};

const State = {
  columns: 2,
  rows: 1,
  mainScale: 0.8,
  skinInterval: 5000,
  blinkInterval: 1500,
  rotationXInterval: 1000,
  rotationXSpread: 25 * DEG2RAD,
  closeBlinkInterval: 200,
  randomAspect: 0.6,
  transitionInterval: 0.75,
  transitionDistance: 4.0,
  
  prevTime: 0,
  isForward: 0,
  targetForward: -1,
  targetRotationX: 0,
  rotationY: 0,
  rotationX: 0,
  speed: 0.02,
  skin: 0,
  prevSkin: 0,
  isBlink: false,
  transition: 0,
};

function createMaterial(texture) {
  texture.repeat.set(1 / State.columns, 1 / State.rows);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide, transparent: false });
}

function createSphere(geometry, material) {
  const sphere = new THREE.Mesh(geometry, material);
  sphere.scale.set(0.75 * State.mainScale, 0.75 * State.mainScale, 0.85 * State.mainScale);
  sphere.rotation.reorder('YXZ');
  return sphere;
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;
  return camera;
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function createGeometry() {
  return new THREE.SphereGeometry(1, 6, 6);
}

function createScene(...children) {
  const scene = new THREE.Scene();
  children.forEach((child) => scene.add(child));
  return scene;
}

function init(texture) {
  State.transition = State.transitionInterval;
  State.rows = texture.image.naturalHeight / (texture.image.naturalWidth / State.columns) | 0;

  World.texture = texture;
  World.transitionTexture = texture.clone();
  World.material = createMaterial(World.texture);
  World.transitionMaterial = createMaterial(World.transitionTexture);
  World.geometry = createGeometry();
  World.sphere = createSphere(World.geometry, World.material);
  World.transitionSphere = createSphere(World.geometry, World.transitionMaterial);
  World.camera = createCamera();
  World.renderer = createRenderer();
  World.scene = createScene(World.sphere, World.transitionSphere);

  update(0);
  onSkinUpdate();
  onBlinkUpdate();
  onXUpdate();
  window.addEventListener('resize', onResize);
}

function update(time) {
  window.requestAnimationFrame(update);

  const deltaTime = (time - State.prevTime) / 1000;
  State.prevTime = time;

  if (State.isForward > 0) {
    State.rotationY += State.speed * State.isForward;
    if (State.rotationY > Math.PI / 6) State.targetForward = -State.targetForward;
  } else {
    State.rotationY += State.speed * State.isForward;
    if (State.rotationY < -Math.PI / 6) State.targetForward = -State.targetForward;
  }

  State.rotationX = lerp(State.rotationX, State.targetRotationX, deltaTime * 2);
  State.isForward = lerp(State.isForward, State.targetForward, deltaTime * 5);

  World.sphere.rotation.y = State.rotationY - Math.PI / 2;
  World.sphere.rotation.z = State.rotationX;

  if (State.transition < State.transitionInterval) {
    console.log('transition!');
    State.transition += deltaTime;

    const t = State.transition / State.transitionInterval;
    World.sphere.position.setY(State.transitionDistance * (1 - t));
    World.transitionSphere.position.setY(-State.transitionDistance * t);
    World.transitionSphere.rotation.copy(World.sphere.rotation);
  } else {
    World.sphere.position.setY(0);
    World.transitionSphere.position.setY(-State.transitionDistance);
  }

  World.renderer.render(World.scene, World.camera);
}

function onResize() {
  World.renderer.setSize(window.innerWidth, window.innerHeight);
  World.camera.aspect = window.innerWidth / window.innerHeight;
  World.camera.updateProjectionMatrix();
}

function setFrame(texture, x, y) {
  texture.offset.set(x / State.columns, 1 - (y + 1) / State.rows);
}

function updateSphereTextures() {
  setFrame(World.texture, State.isBlink ? 1 : 0, State.skin | 0);
  setFrame(World.transitionTexture, State.isBlink ? 1 : 0, State.prevSkin | 0);
}

function onSkinUpdate() {
  window.setTimeout(onSkinUpdate, State.skinInterval);
  State.prevSkin = State.skin;
  State.skin = (State.skin + 1) % State.rows;
  State.transition = 0;
  updateSphereTextures();
}

function onBlinkUpdate() {
  const interval = (1 - State.randomAspect + State.randomAspect * Math.random()) * (State.isBlink ? State.blinkInterval : State.closeBlinkInterval);
  window.setTimeout(onBlinkUpdate, interval);
  State.isBlink = !State.isBlink;
  updateSphereTextures();
}

function onXUpdate() {
  const interval = (1 - State.randomAspect + Math.random() * State.randomAspect) * State.rotationXInterval;
  window.setTimeout(onXUpdate, interval);
  State.targetRotationX = Math.random() * State.rotationXSpread * 2 - State.rotationXSpread;
}

new THREE.TextureLoader().load("./assets/mixed2.webp", init);
