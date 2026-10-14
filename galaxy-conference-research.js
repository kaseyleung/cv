import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.conference-stage');
const canvas = document.querySelector('#research-canvas');
const status = document.querySelector('#research-status');
const focusIndex = document.querySelector('#focus-index');
const focusTitle = document.querySelector('#focus-title');
const focusDescription = document.querySelector('#focus-description');
const focusButtons = [...document.querySelectorAll('[data-focus]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(stage.clientWidth, stage.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8e6df, 14, 30);
const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 70);
camera.position.set(5.2, 4.2, 10.8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 5.5;
controls.maxDistance = 18;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0.6, 1.65, -0.1);
controls.update();

scene.add(new THREE.HemisphereLight(0xf8f5ec, 0x606961, 1.75));
const keyLight = new THREE.DirectionalLight(0xffedcf, 2.4);
keyLight.position.set(-4, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -6;
keyLight.shadow.bias = -0.0003;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xc5d8d1, 1.65);
rimLight.position.set(4, 5, -4);
scene.add(rimLight);
const photoLight = new THREE.SpotLight(0xffe8c5, 52, 12, Math.PI / 6, 0.72, 1.2);
photoLight.position.set(1.1, 7, 1.7);
scene.add(photoLight);

const materials = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdce6df, transparent: true, opacity: 0.25, roughness: 0.12, metalness: 0.14, transmission: 0.4, thickness: 0.2, clearcoat: 0.85, clearcoatRoughness: 0.14, depthWrite: false }),
  edge: new THREE.MeshStandardMaterial({ color: 0xa7b4aa, metalness: 0.7, roughness: 0.23 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x303633, metalness: 0.56, roughness: 0.3 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb6beb7, metalness: 0.76, roughness: 0.2 }),
  accent: new THREE.MeshStandardMaterial({ color: 0x9e7654, metalness: 0.35, roughness: 0.32 }),
  seat: new THREE.MeshPhysicalMaterial({ color: 0x718278, transparent: true, opacity: 0.66, roughness: 0.28, metalness: 0.16, clearcoat: 0.65 }),
  person: new THREE.MeshPhysicalMaterial({ color: 0x83978c, transparent: true, opacity: 0.72, roughness: 0.34, metalness: 0.05, clearcoat: 0.3 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd8b195, roughness: 0.65 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xd8d9cf, roughness: 0.74, metalness: 0.03 }),
  beam: new THREE.MeshBasicMaterial({ color: 0xffedcf, transparent: true, opacity: 0.075, side: THREE.DoubleSide, depthWrite: false })
};

const world = new THREE.Group();
scene.add(world);
const addMesh = (geometry, material, position, parent = world, focusKey = '') => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (focusKey) mesh.userData.focusKey = focusKey;
  parent.add(mesh);
  return mesh;
};
const addRod = (from, to, radius, material, parent = world, focusKey = '') => {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(end, start);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.85, radius, direction.length(), 12), material);
  rod.position.copy(start).add(end).multiplyScalar(0.5);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  rod.castShadow = true;
  rod.receiveShadow = true;
  if (focusKey) rod.userData.focusKey = focusKey;
  parent.add(rod);
  return rod;
};

const floor = addMesh(new THREE.PlaneGeometry(200, 200), materials.floor, [0, -0.08, 0]);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

const stageDeck = new THREE.Group();
stageDeck.position.set(0.45, 0, -0.3);
world.add(stageDeck);
addMesh(new THREE.BoxGeometry(7.2, 0.14, 4.4), materials.glass, [0, 0.06, 0], stageDeck);
addMesh(new THREE.BoxGeometry(7.24, 0.035, 4.44), materials.edge, [0, -0.035, 0], stageDeck);
for (const x of [-3.25, 3.25]) {
  for (const z of [-1.88, 1.88]) addMesh(new THREE.BoxGeometry(0.065, 0.55, 0.065), materials.glass, [x, -0.31, z], stageDeck);
}

const photoFrame = new THREE.Group();
photoFrame.position.set(1.15, 0.18, -0.86);
photoFrame.rotation.y = -0.04;
world.add(photoFrame);
const photoBacking = addMesh(new THREE.BoxGeometry(3.15, 4.72, 0.16), materials.edge, [0, 2.35, 0], photoFrame, 'host');
const photoMount = addMesh(new THREE.BoxGeometry(3.03, 4.6, 0.1), materials.glass, [0, 2.35, 0.1], photoFrame, 'host');
const photoTextureMaterial = new THREE.MeshBasicMaterial({ color: 0xe6e3d9, toneMapped: false, side: THREE.DoubleSide });
const photoPlane = addMesh(new THREE.PlaneGeometry(2.88, 4.32), photoTextureMaterial, [0, 2.35, 0.16], photoFrame, 'host');
photoPlane.userData.photo = true;
for (const x of [-1.54, 1.54]) addMesh(new THREE.BoxGeometry(0.045, 4.78, 0.12), materials.glass, [x, 2.35, 0.14], photoFrame, 'host');
for (const y of [0, 4.7]) addMesh(new THREE.BoxGeometry(3.12, 0.045, 0.12), materials.glass, [0, y + 0.02, 0.14], photoFrame, 'host');

const stageBack = new THREE.Group();
stageBack.position.set(-0.6, 0.18, -0.95);
world.add(stageBack);
addMesh(new THREE.BoxGeometry(0.86, 1.46, 0.72), materials.glass, [-1.9, 0.78, 0.12], stageBack, 'host');
addMesh(new THREE.BoxGeometry(1.2, 0.12, 0.92), materials.edge, [-1.9, 1.56, 0.12], stageBack, 'host');
addMesh(new THREE.CylinderGeometry(0.045, 0.05, 0.34, 14), materials.dark, [-1.92, 1.85, 0.16], stageBack, 'host');
addMesh(new THREE.SphereGeometry(0.08, 16, 10), materials.steel, [-1.92, 2.04, 0.16], stageBack, 'host');
addRod([-1.92, 1.88, 0.16], [-1.84, 2.21, 0.18], 0.016, materials.steel, stageBack, 'host');

const audience = new THREE.Group();
world.add(audience);
const audienceRows = [
  { z: 1.65, xs: [-3.05, -2.2, -1.35, -0.5, 0.4, 1.3, 2.2, 3.05], scale: 0.68 },
  { z: 2.65, xs: [-3.25, -2.45, -1.65, -0.82, 0.82, 1.65, 2.45, 3.25], scale: 0.78 },
  { z: 3.65, xs: [-3.4, -2.7, -2, -1.3, -0.6, 0.6, 1.3, 2, 2.7, 3.4], scale: 0.86 }
];
for (const [rowIndex, row] of audienceRows.entries()) {
  row.xs.forEach((x, personIndex) => {
    const attendee = new THREE.Group();
    attendee.position.set(x, 0, row.z);
    attendee.scale.setScalar(row.scale);
    audience.add(attendee);
    const tone = (rowIndex + personIndex) % 4 === 0 ? materials.skin : materials.person;
    addMesh(new THREE.BoxGeometry(0.48, 0.1, 0.5), materials.glass, [0, 0.28, 0], attendee, 'audience');
    addMesh(new THREE.CapsuleGeometry(0.16, 0.36, 4, 9), materials.seat, [0, 0.67, -0.08], attendee, 'audience');
    addMesh(new THREE.SphereGeometry(0.14, 16, 12), tone, [0, 1.09, -0.04], attendee, 'audience');
    addRod([-0.16, 0.28, -0.18], [-0.16, 0.02, -0.18], 0.015, materials.edge, attendee, 'audience');
    addRod([0.16, 0.28, -0.18], [0.16, 0.02, -0.18], 0.015, materials.edge, attendee, 'audience');
  });
}

for (const x of [-3.4, 3.45]) {
  const spotlight = new THREE.SpotLight(0xffebc8, 34, 10, Math.PI / 7, 0.65, 1.2);
  spotlight.position.set(x, 5.8, 1.7);
  spotlight.target = photoFrame;
  world.add(spotlight);
}
const photoBeam = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4.7, 36, 1, true), materials.beam);
photoBeam.position.set(1, 3.55, 0.3);
photoBeam.castShadow = false;
world.add(photoBeam);

const views = {
  all: { index: '01 / 03', title: '报告会现场', description: '中国银河证券 · 秋季投资策略', target: [0.45, 1.7, 0.45], position: [5.2, 4.2, 10.8] },
  host: { index: '02 / 03', title: '舞台主持', description: '串联专业观点与现场交流', target: [1.1, 2.35, -0.8], position: [4.2, 3.3, 6.8] },
  audience: { index: '03 / 03', title: '参会来宾', description: '聚焦现场参与与交流', target: [0, 1.1, 2.25], position: [0.3, 3.5, 7.6] }
};
let desiredPosition = new THREE.Vector3(...views.all.position);
let desiredTarget = new THREE.Vector3(...views.all.target);
const selectFocus = (key) => {
  const view = views[key] || views.all;
  desiredPosition.set(...view.position);
  desiredTarget.set(...view.target);
  if (stage.clientWidth < 600 && key === 'all') {
    desiredPosition.set(0.45, 5.1, 15.5);
    desiredTarget.set(0.45, 1.8, -0.1);
  }
  focusIndex.textContent = view.index;
  focusTitle.textContent = view.title;
  focusDescription.textContent = view.description;
  focusButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.focus === key)));
};
focusButtons.forEach((button) => button.addEventListener('click', () => selectFocus(button.dataset.focus)));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart = null;
const setPointer = (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};
canvas.addEventListener('pointermove', (event) => {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(world.children, true).find((item) => item.object.userData.focusKey);
  canvas.style.cursor = hit ? 'pointer' : 'grab';
});
canvas.addEventListener('pointerdown', (event) => {
  pointerStart = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener('click', (event) => {
  if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 8) {
    pointerStart = null;
    return;
  }
  pointerStart = null;
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(world.children, true).find((item) => item.object.userData.focusKey);
  if (hit) selectFocus(hit.object.userData.focusKey);
});

const photoTexture = new THREE.TextureLoader().load(
  new URL('./IMG_0335.jpg', import.meta.url).href,
  (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    photoTextureMaterial.map = texture;
    photoTextureMaterial.color.set(0xffffff);
    photoTextureMaterial.needsUpdate = true;
    status.textContent = '拖动舞台，查看报告会现场';
    stage.classList.add('is-ready');
  },
  undefined,
  () => {
    status.textContent = '活动照片无法载入';
    stage.classList.add('is-error');
  }
);

const resize = () => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  photoFrame.position.y = width < 600 ? -0.4 : 0.18;
  photoFrame.scale.setScalar(width < 600 ? 0.82 : 1);
  camera.aspect = width / height;
  camera.fov = width < 600 ? 44 : width < 900 ? 39 : 36;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2));
  renderer.setSize(width, height, false);
  if (focusButtons.find((button) => button.dataset.focus === 'all')?.getAttribute('aria-pressed') === 'true') selectFocus('all');
};
window.addEventListener('resize', resize, { passive: true });
resize();
camera.position.copy(desiredPosition);
controls.target.copy(desiredTarget);
controls.update();

const clock = new THREE.Clock();
const animate = () => {
  if (!reducedMotion.matches) photoBeam.material.opacity = 0.065 + Math.sin(clock.getElapsedTime() * 0.7) * 0.012;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
animate();
