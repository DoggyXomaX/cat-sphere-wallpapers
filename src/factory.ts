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
  RawShaderMaterial,
} from "three";

export function createMaterial(texture: Texture, columns: number, rows: number) {
  texture.repeat.set(1 / columns, 1 / rows);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return new RawShaderMaterial({
    uniforms: { map: { value: texture }, mapTransform: { value: texture.matrix } },
    vertexShader: `
      precision lowp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 mapTransform;
      varying vec2 vUv;
      void main() {
        vUv = (mapTransform * vec3(uv, 1.0)).xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision lowp float;
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(map, vUv);
      }
    `,
  });
}

export function createSphere(geometry: BufferGeometry, material: Material) {
  const sphere = new Mesh(geometry, material);
  sphere.scale.set(0.6, 0.6, 0.7);
  sphere.rotation.reorder("YXZ");
  return sphere;
}

export function createCamera() {
  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;
  return camera;
}

export function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createGeometry() {
  return new SphereGeometry(1, 6, 6);
}

export function createScene(backgroundTexture: Texture | undefined, children?: Object3D[]) {
  const scene = new Scene();
  if (backgroundTexture) scene.background = backgroundTexture;
  children?.forEach((child) => scene.add(child));
  return scene;
}

export function loadTexture(url: string): Promise<Texture<HTMLImageElement> | undefined> {
  const textureLoader = new TextureLoader();
  return new Promise((resolve) => {
    textureLoader.load(
      url,
      (texture) => {
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.colorSpace = SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      () => resolve(undefined),
    );
  });
}
