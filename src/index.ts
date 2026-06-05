import { BufferGeometry, Material, Mesh, PerspectiveCamera, Scene, Texture, WebGLRenderer } from "three";
import { lerp } from "./utils";
import {
  createGeometry,
  createCamera,
  createMaterial,
  createRenderer,
  createScene,
  createSphere,
  loadTexture,
} from "./factory3D";
import { RENDER_SIZE } from "./defaults";

import mixedUrl from "./assets/mixed2.webp";
import backgroundUrl from "./assets/background.jpg";

const DEG2RAD = Math.PI / 180;
const FPS = 24;
const DELTA_TIME = 1 / FPS;

const World: {
  scene?: Scene;
  texture?: Texture;
  transitionTexture?: Texture;
  material?: Material;
  transitionMaterial?: Material;
  geometry?: BufferGeometry;
  sphere?: Mesh;
  transitionSphere?: Mesh;
  camera?: PerspectiveCamera;
  renderer?: WebGLRenderer;
} = {};

const State = {
  columns: 2,
  rows: 1,
  skinInterval: 5000,
  blinkInterval: 1500,
  rotationXInterval: 1000,
  rotationXSpread: 25 * DEG2RAD,
  rotationYSpread: 45 * DEG2RAD,
  closeBlinkInterval: 200,
  randomAspect: 0.6,
  transitionInterval: 0.75,
  transitionDistance: 4.0,

  targetRotationX: 0,
  targetRotationY: 0,
  rotationY: 0,
  rotationX: 0,
  speed: 0.02,
  skin: 0,
  prevSkin: 0,
  isBlink: false,
  transition: 0,
};

function init(
  texture: Texture<HTMLImageElement> | undefined,
  backgroundTexture: Texture<HTMLImageElement> | undefined,
) {
  if (!texture) {
    console.error("Failed to load texture!");
    return;
  }

  State.transition = State.transitionInterval;
  State.rows = (texture.image.naturalHeight / (texture.image.naturalWidth / State.columns)) | 0;

  World.texture = texture;
  World.transitionTexture = texture.clone();
  World.material = createMaterial(World.texture, State.columns, State.rows);
  World.transitionMaterial = createMaterial(World.transitionTexture, State.columns, State.rows);
  World.geometry = createGeometry();
  World.sphere = createSphere(World.geometry, World.material);
  World.transitionSphere = createSphere(World.geometry, World.transitionMaterial);
  World.camera = createCamera();
  World.renderer = createRenderer();
  World.scene = createScene(backgroundTexture, [World.sphere, World.transitionSphere]);

  update();
  onSkinUpdate();
  onBlinkUpdate();
  onXUpdate();
  window.addEventListener("resize", onResize);
  onResize();
}

function update() {
  window.setTimeout(update, DELTA_TIME * 1000);

  State.rotationX = lerp(State.rotationX, State.targetRotationX, DELTA_TIME * 2);
  State.rotationY = lerp(State.rotationY, State.targetRotationY, DELTA_TIME * 2);

  World.sphere!.rotation.y = State.rotationY - Math.PI / 2;
  World.sphere!.rotation.z = State.rotationX;

  if (State.transition < State.transitionInterval) {
    State.transition += DELTA_TIME;

    const t = Math.min(1, State.transition / State.transitionInterval);
    World.sphere!.position.setY(State.transitionDistance * (1 - t));
    World.transitionSphere!.position.setY(-State.transitionDistance * t);
    World.transitionSphere!.rotation.copy(World.sphere!.rotation);
  } else {
    World.sphere!.position.setY(0);
    World.transitionSphere!.position.setY(-State.transitionDistance);
  }

  World.renderer!.render(World.scene!, World.camera!);
}

function onResize() {
  const aspect = window.innerWidth / window.innerHeight;

  let width = RENDER_SIZE;
  let height = RENDER_SIZE / aspect;
  if (aspect < 1) {
    width = RENDER_SIZE * aspect;
    height = RENDER_SIZE;
  }
  World.renderer!.setSize(width, height);
  World.renderer!.setViewport(0, 0, width, height);
  World.camera!.aspect = aspect;
  World.camera!.updateProjectionMatrix();
}

function setFrame(texture: Texture, x: number, y: number) {
  texture.offset.set(x / State.columns, 1 - (y + 1) / State.rows);
  texture.updateMatrix();
}

function updateSphereTextures() {
  setFrame(World.texture!, State.isBlink ? 1 : 0, State.skin | 0);
  setFrame(World.transitionTexture!, State.isBlink ? 1 : 0, State.prevSkin | 0);
}

function onSkinUpdate() {
  window.setTimeout(onSkinUpdate, State.skinInterval);
  State.prevSkin = State.skin;
  State.skin = (State.skin + 1) % State.rows;
  State.transition = 0;
  updateSphereTextures();
}

function onBlinkUpdate() {
  const interval =
    (1 - State.randomAspect + State.randomAspect * Math.random()) *
    (State.isBlink ? State.blinkInterval : State.closeBlinkInterval);
  window.setTimeout(onBlinkUpdate, interval);
  State.isBlink = !State.isBlink;
  updateSphereTextures();
}

function onXUpdate() {
  const interval = (1 - State.randomAspect + Math.random() * State.randomAspect) * State.rotationXInterval;
  window.setTimeout(onXUpdate, interval);
  State.targetRotationX = Math.random() * State.rotationXSpread * 2 - State.rotationXSpread;
  State.targetRotationY = Math.random() * State.rotationYSpread * 2 - State.rotationYSpread;
}

Promise.all([loadTexture(mixedUrl), loadTexture(backgroundUrl)]).then(([a, b]) => init(a, b));
