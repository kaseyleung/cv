import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.research-stage');
const canvas = document.querySelector('#research-canvas');
const status = document.querySelector('#research-status');
const captionIndex = document.querySelector('#focus-index');
const captionTitle = document.querySelector('#focus-title');
const captionDescription = document.querySelector('#focus-description');
const focusButtons = [...document.querySelectorAll('[data-focus]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8e6dc, 10, 22);

const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, 0.1, 60);
camera.position.set(4.4, 3.2, 8.1);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 4.2;
controls.maxDistance = 13;
controls.minPolarAngle = 0.45;
controls.maxPolarAngle = Math.PI * 0.48;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.32;
controls.target.set(0, 1, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xf4f0e3, 0x73786c, 2.2));

const keyLight = new THREE.DirectionalLight(0xfff4dc, 3.1);
keyLight.position.set(-3.5, 7, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -6;
keyLight.shadow.camera.right = 6;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -5;
keyLight.shadow.bias = -0.0003;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xc1d4be, 2.2);
rimLight.position.set(4, 4, -4);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xe6a27d, 42, 8, 2);
fillLight.position.set(-1.5, 2.2, 3.2);
scene.add(fillLight);

const materials = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0xd8e2d9, transparent: true, opacity: 0.22, roughness: 0.12, metalness: 0.12, transmission: 0.45, thickness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.12, depthWrite: false }),
  glassEdge: new THREE.MeshStandardMaterial({ color: 0xb9c9bd, metalness: 0.62, roughness: 0.25 }),
  black: new THREE.MeshStandardMaterial({ color: 0x30342f, metalness: 0.7, roughness: 0.28 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x20231f, metalness: 0.48, roughness: 0.36 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb6b8ab, metalness: 0.78, roughness: 0.22 }),
  warm: new THREE.MeshStandardMaterial({ color: 0xd27b59, metalness: 0.42, roughness: 0.3 }),
  lens: new THREE.MeshPhysicalMaterial({ color: 0x809a8d, metalness: 0.3, roughness: 0.1, transmission: 0.45, thickness: 0.12, clearcoat: 1 }),
  soft: new THREE.MeshStandardMaterial({ color: 0xf5ead0, emissive: 0xffdca1, emissiveIntensity: 1.5, roughness: 0.44, side: THREE.DoubleSide }),
  floor: new THREE.MeshStandardMaterial({ color: 0xd9d8cb, roughness: 0.62, metalness: 0.06 })
};

const stageGroup = new THREE.Group();
scene.add(stageGroup);

const makeMesh = (geometry, material, position, parent = stageGroup) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const makeRod = (start, end, radius, material, parent) => {
  const startPoint = new THREE.Vector3(...start);
  const endPoint = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12), material);
  rod.position.copy(startPoint).add(endPoint).multiplyScalar(0.5);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  rod.castShadow = true;
  rod.receiveShadow = true;
  parent.add(rod);
  return rod;
};

const markInteractive = (group, key) => {
  group.traverse((child) => {
    if (child.isMesh) child.userData.focusKey = key;
  });
};

const floor = makeMesh(new THREE.PlaneGeometry(200, 200), materials.floor, [0, -0.08, 0]);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
floor.castShadow = false;

const platform = new THREE.Group();
stageGroup.add(platform);
makeMesh(new THREE.BoxGeometry(4.8, 0.12, 2.55), materials.glass, [0, 0.42, 0], platform);
makeMesh(new THREE.BoxGeometry(4.84, 0.025, 2.59), materials.glassEdge, [0, 0.35, 0], platform);
makeMesh(new THREE.BoxGeometry(4.8, 0.018, 2.55), materials.glassEdge, [0, 0.49, 0], platform);
for (const cornerX of [-2.05, 2.05]) {
  for (const cornerZ of [-0.96, 0.96]) {
    makeMesh(new THREE.BoxGeometry(0.07, 0.64, 0.07), materials.glass, [cornerX, 0.05, cornerZ], platform);
  }
}
for (const grooveZ of [-0.94, 0.94]) {
  makeMesh(new THREE.BoxGeometry(4.15, 0.009, 0.012), materials.glassEdge, [0, 0.507, grooveZ], platform);
}

const microphone = new THREE.Group();
microphone.position.set(-1.32, 0.52, 0.12);
stageGroup.add(microphone);
makeMesh(new THREE.CylinderGeometry(0.035, 0.045, 1.45, 16), materials.steel, [0, 0.76, 0], microphone);
makeMesh(new THREE.CylinderGeometry(0.14, 0.17, 0.07, 24), materials.black, [0, 0.07, 0], microphone);
makeMesh(new THREE.SphereGeometry(0.17, 20, 12), materials.black, [0, 0.08, 0], microphone).scale.y = 0.36;
for (const legEnd of [[-0.34, 0.02, 0.22], [0.34, 0.02, 0.22], [0, 0.02, -0.38]]) {
  makeRod([0, 0.08, 0], legEnd, 0.024, materials.black, microphone);
}
makeMesh(new THREE.SphereGeometry(0.08, 16, 12), materials.warm, [0, 1.45, 0], microphone);
makeRod([0, 1.42, 0], [0.42, 1.84, 0], 0.028, materials.steel, microphone);
const micJoint = makeMesh(new THREE.SphereGeometry(0.075, 16, 12), materials.black, [0.42, 1.84, 0], microphone);
const micBody = new THREE.Group();
micBody.position.set(0.42, 1.84, 0);
micBody.rotation.z = -0.52;
microphone.add(micBody);
makeMesh(new THREE.CylinderGeometry(0.105, 0.115, 0.38, 24), materials.black, [0, -0.13, 0], micBody);
makeMesh(new THREE.CylinderGeometry(0.145, 0.12, 0.35, 28), materials.steel, [0, 0.23, 0], micBody);
makeMesh(new THREE.SphereGeometry(0.14, 24, 16), materials.steel, [0, 0.41, 0], micBody).scale.y = 0.55;
for (const ringY of [0.12, 0.19, 0.26, 0.33]) {
  const grilleRing = new THREE.Mesh(new THREE.TorusGeometry(0.137, 0.006, 6, 28), materials.black);
  grilleRing.rotation.x = Math.PI / 2;
  grilleRing.position.y = ringY;
  micBody.add(grilleRing);
}
const shockRing = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 8, 32), materials.warm);
shockRing.rotation.x = Math.PI / 2;
shockRing.position.y = 0.1;
micBody.add(shockRing);
markInteractive(microphone, 'microphone');

const cameraRig = new THREE.Group();
cameraRig.position.set(0.24, 0.54, 0.08);
stageGroup.add(cameraRig);
makeMesh(new THREE.BoxGeometry(0.9, 0.52, 0.48), materials.black, [0, 1.16, 0], cameraRig);
makeMesh(new THREE.BoxGeometry(0.42, 0.12, 0.1), materials.dark, [-0.06, 1.49, -0.02], cameraRig);
makeMesh(new THREE.BoxGeometry(0.2, 0.17, 0.13), materials.warm, [0.27, 1.51, -0.02], cameraRig);
makeMesh(new THREE.BoxGeometry(0.14, 0.12, 0.1), materials.steel, [-0.28, 1.5, -0.02], cameraRig);
makeMesh(new THREE.CylinderGeometry(0.19, 0.22, 0.2, 32), materials.dark, [0, 1.16, 0.3], cameraRig).rotation.x = Math.PI / 2;
makeMesh(new THREE.CylinderGeometry(0.15, 0.17, 0.11, 32), materials.steel, [0, 1.16, 0.43], cameraRig).rotation.x = Math.PI / 2;
makeMesh(new THREE.CylinderGeometry(0.115, 0.14, 0.07, 32), materials.lens, [0, 1.16, 0.51], cameraRig).rotation.x = Math.PI / 2;
makeMesh(new THREE.BoxGeometry(0.16, 0.26, 0.18), materials.black, [-0.51, 1.19, -0.02], cameraRig);
makeMesh(new THREE.BoxGeometry(0.18, 0.14, 0.17), materials.steel, [0.51, 1.19, -0.02], cameraRig);
makeRod([0, 0.94, -0.03], [0, 0.58, -0.03], 0.034, materials.steel, cameraRig);
for (const legEnd of [[-0.32, 0.02, 0.17], [0.32, 0.02, 0.17], [0, 0.02, -0.34]]) {
  makeRod([0, 0.58, -0.03], legEnd, 0.026, materials.black, cameraRig);
}
markInteractive(cameraRig, 'camera');

const lightRig = new THREE.Group();
lightRig.position.set(1.7, 0.52, -0.16);
stageGroup.add(lightRig);
makeRod([0, 0.04, 0], [0, 1.93, 0], 0.035, materials.steel, lightRig);
for (const legEnd of [[-0.39, 0.02, 0.25], [0.39, 0.02, 0.25], [0, 0.02, -0.43]]) {
  makeRod([0, 0.1, 0], legEnd, 0.024, materials.black, lightRig);
}
makeMesh(new THREE.SphereGeometry(0.09, 20, 12), materials.warm, [0, 1.92, 0], lightRig);
const softbox = new THREE.Group();
softbox.position.set(0, 2.25, 0.02);
softbox.rotation.x = -0.12;
lightRig.add(softbox);
makeMesh(new THREE.BoxGeometry(0.88, 0.67, 0.12), materials.black, [0, 0, 0], softbox);
makeMesh(new THREE.BoxGeometry(0.74, 0.53, 0.025), materials.soft, [0, 0, 0.073], softbox);
for (const stripeY of [-0.24, 0.24]) {
  makeMesh(new THREE.BoxGeometry(0.72, 0.012, 0.009), materials.glassEdge, [0, stripeY, 0.09], softbox);
}
makeMesh(new THREE.BoxGeometry(0.08, 0.1, 0.05), materials.dark, [0, -0.39, 0], softbox);
markInteractive(lightRig, 'light');

const displayPane = makeMesh(new THREE.BoxGeometry(0.012, 2.8, 2.4), materials.glass, [2.65, 1.78, -0.7]);
displayPane.rotation.y = -0.22;
const paneEdge = new THREE.EdgesGeometry(displayPane.geometry);
const paneOutline = new THREE.LineSegments(paneEdge, new THREE.LineBasicMaterial({ color: 0x93a394, transparent: true, opacity: 0.5 }));
paneOutline.position.copy(displayPane.position);
paneOutline.rotation.copy(displayPane.rotation);
stageGroup.add(paneOutline);

const focusViews = {
  all: { index: '00 / 03', title: '一座微型演播场', description: '声音 · 影像 · 光线共同构成叙事', target: [0, 1.2, 0], position: [4.4, 3.2, 8.1] },
  microphone: { index: '01 / 03', title: '声音的入口', description: '麦克风 · 让叙事被听见', target: [-1.05, 1.42, 0.08], position: [0.45, 2.35, 4.5] },
  camera: { index: '02 / 03', title: '观看的媒介', description: '摄影机 · 选择如何被看见', target: [0.25, 1.17, 0.2], position: [2.8, 2.05, 4.5] },
  light: { index: '03 / 03', title: '空间的情绪', description: '演播灯 · 为观看塑造现场', target: [1.7, 1.65, 0], position: [4.1, 2.9, 3.8] }
};

let desiredPosition = new THREE.Vector3(...focusViews.microphone.position);
let desiredTarget = new THREE.Vector3(...focusViews.microphone.target);
camera.position.copy(desiredPosition);
controls.target.copy(desiredTarget);
controls.update();

const selectFocus = (key) => {
  const view = focusViews[key] || focusViews.all;
  desiredPosition.set(...view.position);
  desiredTarget.set(...view.target);
  captionIndex.textContent = view.index;
  captionTitle.textContent = view.title;
  captionDescription.textContent = view.description;
  focusButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.focus === key));
  });
  controls.autoRotate = key === 'all' && !reducedMotion.matches;
};

focusButtons.forEach((button) => button.addEventListener('click', () => selectFocus(button.dataset.focus)));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const setPointer = (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};

canvas.addEventListener('pointermove', (event) => {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(stageGroup.children, true).find((intersection) => intersection.object.userData.focusKey);
  canvas.style.cursor = hit ? 'pointer' : 'grab';
});

canvas.addEventListener('click', (event) => {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(stageGroup.children, true).find((intersection) => intersection.object.userData.focusKey);
  if (hit) selectFocus(hit.object.userData.focusKey);
});

controls.addEventListener('start', () => { controls.autoRotate = false; });
reducedMotion.addEventListener('change', () => {
  controls.autoRotate = !reducedMotion.matches && document.querySelector('[data-focus="all"]').getAttribute('aria-pressed') === 'true';
});

const resize = () => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.fov = width < 600 ? 42 : width < 900 ? 38 : 34;
  camera.updateProjectionMatrix();
  if (width < 600 && document.querySelector('[data-focus="all"]').getAttribute('aria-pressed') === 'true') {
    desiredPosition.set(0.3, 4.1, 11.5);
    desiredTarget.set(0, 1.25, 0);
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2));
  renderer.setSize(width, height, false);
};
window.addEventListener('resize', resize, { passive: true });

const clock = new THREE.Clock();
const animate = () => {
  const elapsed = clock.getElapsedTime();
  stageGroup.rotation.y = reducedMotion.matches ? 0 : Math.sin(elapsed * 0.16) * 0.018;
  camera.position.lerp(desiredPosition, 0.045);
  controls.target.lerp(desiredTarget, 0.045);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

status.textContent = '拖动展场，开始探索';
stage.classList.add('is-ready');
animate();