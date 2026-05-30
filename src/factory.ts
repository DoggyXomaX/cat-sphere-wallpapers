import {
  SRGBColorSpace,
  NearestFilter,
  MeshBasicMaterial,
  FrontSide,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  SphereGeometry,
  Scene,
  TextureLoader,
  Texture,
  Object3D,
  BufferGeometry,
  Material,
} from 'three';

export function createMaterial(texture: Texture, columns: number, rows: number) {
  texture.repeat.set(1 / columns, 1 / rows);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return new MeshBasicMaterial({ map: texture, side: FrontSide, transparent: true });
}

export function createSphere(geometry: BufferGeometry, material: Material) {
  const sphere = new Mesh(geometry, material);
  sphere.scale.set(0.6, 0.6, 0.7);
  sphere.rotation.reorder('YXZ');
  return sphere;
}

export function createCamera() {
  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;
  return camera;
}

export function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createGeometry() {
  return new SphereGeometry(1, 6, 6);
}

export function createScene(...children: Object3D[]) {
  const scene = new Scene();
  children.forEach((child) => scene.add(child));
  return scene;
}

export function loadTextureAtlas(url: string): Promise<Texture<HTMLImageElement> | undefined> {
  const textureLoader = new TextureLoader();
  return new Promise((resolve) => {
    textureLoader.load(url, (texture) => {
      texture.minFilter = NearestFilter;
      texture.magFilter = NearestFilter;
      resolve(texture);
    }, undefined, () => resolve(undefined));
  });
}