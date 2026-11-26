import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.research-stage');
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
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf7f2e8, 12, 24);

const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 60);
camera.position.set(4.6, 4.1, 9.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 4.8;
controls.maxDistance = 15;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0, 1.25, 1.2);
controls.update();

scene.add(new THREE.HemisphereLight(0xf7f3e9, 0x6b6157, 1.8));

const keyLight = new THREE.DirectionalLight(0xffe8bd, 2.2);
keyLight.position.set(-4, 7, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -6;
keyLight.shadow.bias = -0.0003;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xdcc9b6, 1.6);
rimLight.position.set(5, 4, -4);
scene.add(rimLight);

const materials = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0xe9ddca, transparent: true, opacity: 0.24, roughness: 0.12, metalness: 0.14, transmission: 0.42, thickness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.12, depthWrite: false }),
  glassEdge: new THREE.MeshStandardMaterial({ color: 0xbfa98f, metalness: 0.66, roughness: 0.22 }),
  suit: new THREE.MeshPhysicalMaterial({ color: 0x6b5a48, roughness: 0.28, metalness: 0.12, clearcoat: 0.55, clearcoatRoughness: 0.2 }),
  jacket: new THREE.MeshPhysicalMaterial({ color: 0xd8c6b0, transparent: true, opacity: 0.76, roughness: 0.25, metalness: 0.12, clearcoat: 0.9 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd9ad8e, roughness: 0.65 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x302d29, roughness: 0.78 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x292d29, metalness: 0.56, roughness: 0.28 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb8ada0, metalness: 0.78, roughness: 0.2 }),
  coral: new THREE.MeshStandardMaterial({ color: 0xd97859, metalness: 0.28, roughness: 0.32 }),
  spotlight: new THREE.MeshBasicMaterial({ color: 0xffedc9, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
  floor: new THREE.MeshStandardMaterial({ color: 0xf3ecdf, roughness: 0.92, metalness: 0.02 }),
  audience: new THREE.MeshPhysicalMaterial({ color: 0xb9a488, transparent: true, opacity: 0.5, roughness: 0.22, metalness: 0.2, clearcoat: 0.7 }),
  audienceWarm: new THREE.MeshPhysicalMaterial({ color: 0xd9b394, transparent: true, opacity: 0.55, roughness: 0.3, metalness: 0.1 })
};

const sceneGroup = new THREE.Group();
scene.add(sceneGroup);

const addMesh = (geometry, material, position, parent = sceneGroup, interactive = '') => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (interactive) mesh.userData.focusKey = interactive;
  parent.add(mesh);
  return mesh;
};

const addRod = (start, end, radius, material, parent, interactive = '') => {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12), material);
  rod.position.copy(from).add(to).multiplyScalar(0.5);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  rod.castShadow = true;
  rod.receiveShadow = true;
  if (interactive) rod.userData.focusKey = interactive;
  parent.add(rod);
  return rod;
};

const floor = addMesh(new THREE.PlaneGeometry(200, 200), materials.floor, [0, -0.08, 0]);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

const stageDeck = new THREE.Group();
stageDeck.position.set(0, 0, -0.72);
sceneGroup.add(stageDeck);
addMesh(new THREE.CylinderGeometry(3.65, 3.82, 0.18, 80), materials.glass, [0, 0.16, 0], stageDeck);
addMesh(new THREE.CylinderGeometry(3.78, 3.86, 0.07, 80), materials.glassEdge, [0, 0.06, 0], stageDeck);
addMesh(new THREE.CylinderGeometry(3.59, 3.62, 0.035, 80), materials.glassEdge, [0, 0.27, 0], stageDeck);
const stageRing = new THREE.Mesh(new THREE.TorusGeometry(3.58, 0.018, 8, 96), materials.glassEdge);
stageRing.rotation.x = Math.PI / 2;
stageRing.position.y = 0.29;
stageDeck.add(stageRing);

const host = new THREE.Group();
host.position.set(-1.15, 0.3, -0.72);
sceneGroup.add(host);
// cute host: same primitive language as the audience, terracotta gown
const mascot = new THREE.Group();
mascot.rotation.y = 0.52;
host.add(mascot);
const mascotTone = {
  dress: new THREE.MeshStandardMaterial({ color: 0xb4653f, roughness: 0.58, metalness: 0.03 }),
  shade: new THREE.MeshStandardMaterial({ color: 0x95502f, roughness: 0.62, metalness: 0.03 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xe8bd9b, roughness: 0.72 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x3b2a22, roughness: 0.8 }),
  blush: new THREE.MeshStandardMaterial({ color: 0xe39a7c, roughness: 0.85 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x2a211c, roughness: 0.5 })
};

const gown = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.45, 0.98, 28), mascotTone.dress);
gown.position.y = 0.53;
mascot.add(gown);
const hem = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.024, 6, 28), mascotTone.shade);
hem.rotation.x = Math.PI / 2;
hem.position.y = 0.05;
mascot.add(hem);

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.3, 4, 16), mascotTone.dress);
torso.position.y = 1.17;
mascot.add(torso);
const collar = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 22), mascotTone.shade);
collar.rotation.x = Math.PI / 2;
collar.position.y = 1.35;
mascot.add(collar);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 18), mascotTone.skin);
head.position.y = 1.56;
mascot.add(head);

const hair = new THREE.Mesh(new THREE.SphereGeometry(0.236, 24, 18), mascotTone.hair);
hair.position.set(0, 1.575, -0.052);
mascot.add(hair);
const bun = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), mascotTone.hair);
bun.position.set(0, 1.63, -0.205);
mascot.add(bun);
const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), mascotTone.hair);
bangs.position.set(0, 1.69, 0.075);
bangs.scale.set(1.15, 0.52, 0.72);
mascot.add(bangs);

[-0.075, 0.075].forEach((x) => {
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.027, 12, 10), mascotTone.ink);
  eye.position.set(x, 1.575, 0.19);
  mascot.add(eye);
});
[-0.128, 0.128].forEach((x) => {
  const blush = new THREE.Mesh(new THREE.CircleGeometry(0.042, 16), mascotTone.blush);
  blush.position.set(x, 1.5, 0.166);
  blush.rotation.y = x * 2.6;
  mascot.add(blush);
});
const smile = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.01, 6, 18, Math.PI), mascotTone.ink);
smile.position.set(0, 1.495, 0.198);
smile.rotation.z = Math.PI;
mascot.add(smile);

const armGeo = new THREE.CapsuleGeometry(0.06, 0.29, 4, 12);
const leftArm = new THREE.Mesh(armGeo, mascotTone.dress);
leftArm.position.set(-0.245, 1.07, 0.02);
leftArm.rotation.z = 0.14;
mascot.add(leftArm);

const waveArm = new THREE.Mesh(armGeo, mascotTone.dress);
waveArm.position.set(0.27, 1.45, 0.02);
waveArm.rotation.z = -0.55;
mascot.add(waveArm);
const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), mascotTone.skin);
hand.position.set(0.36, 1.6, 0.02);
mascot.add(hand);

const handMic = new THREE.Group();
handMic.position.set(-0.31, 0.95, 0.16);
handMic.rotation.z = 0.22;
const micHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.16, 10), mascotTone.ink);
micHandle.position.y = 0.01;
handMic.add(micHandle);
const micTop = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), materials.steel);
micTop.position.y = 0.1;
micTop.scale.y = 0.78;
handMic.add(micTop);
mascot.add(handMic);

mascot.traverse((child) => {
  if (!child.isMesh) return;
  child.castShadow = true;
  child.receiveShadow = true;
  child.userData.focusKey = 'host';
});
const hostShadow = new THREE.Mesh(
  new THREE.CircleGeometry(0.58, 36),
  new THREE.MeshBasicMaterial({ color: 0x7a5a44, transparent: true, opacity: 0.16, depthWrite: false })
);
hostShadow.rotation.x = -Math.PI / 2;
hostShadow.position.set(-1.15, 0.305, -0.72);
sceneGroup.add(hostShadow);

const microphone = new THREE.Group();
microphone.position.set(-0.68, 0.3, -0.2);
sceneGroup.add(microphone);
addMesh(new THREE.CylinderGeometry(0.17, 0.2, 0.06, 28), materials.dark, [0, 0.04, 0], microphone);
addMesh(new THREE.CylinderGeometry(0.025, 0.032, 1.42, 14), materials.steel, [0, 0.77, 0], microphone);
addMesh(new THREE.SphereGeometry(0.075, 16, 12), materials.coral, [0, 1.47, 0], microphone);
addMesh(new THREE.CapsuleGeometry(0.075, 0.16, 4, 12), materials.dark, [0, 1.61, 0], microphone).rotation.z = -0.2;
addMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 12), materials.steel, [0, 1.45, 0], microphone);
const micHead = addMesh(new THREE.SphereGeometry(0.074, 16, 12), materials.steel, [0, 1.74, 0], microphone);
micHead.scale.y = 0.72;
for (let line = 0; line < 3; line += 1) {
  const grille = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.005, 5, 20), materials.dark);
  grille.rotation.x = Math.PI / 2;
  grille.position.y = 1.72 + line * 0.025;
  microphone.add(grille);
}
microphone.traverse((child) => { if (child.isMesh) child.userData.focusKey = 'host'; });
microphone.visible = false;

const audience = new THREE.Group();
sceneGroup.add(audience);
const audienceRows = [
  { z: 1.62, xs: [-3.1, -2.35, -1.6, -0.88, 0.88, 1.6, 2.35, 3.1], scale: 0.5 },
  { z: 2.45, xs: [-3.5, -2.8, -2.1, -1.4, -0.7, 0.7, 1.4, 2.1, 2.8, 3.5], scale: 0.58 },
  { z: 3.18, xs: [-3.85, -3.15, -2.45, -1.75, -1.05, -0.35, 0.35, 1.05, 1.75, 2.45, 3.15, 3.85], scale: 0.66 }
];
audienceRows.forEach((row, rowIndex) => {
  row.xs.forEach((x, personIndex) => {
    const person = new THREE.Group();
    person.position.set(x, 0, row.z);
    person.scale.setScalar(row.scale);
    audience.add(person);
    const bodyMaterial = (rowIndex + personIndex) % 3 === 0 ? materials.audienceWarm : materials.audience;
    addMesh(new THREE.CapsuleGeometry(0.19, 0.36, 3, 8), bodyMaterial, [0, 0.48, 0], person, 'audience');
    addMesh(new THREE.SphereGeometry(0.16, 14, 10), bodyMaterial, [0, 0.93, 0.015], person, 'audience');
    addMesh(new THREE.BoxGeometry(0.48, 0.1, 0.5), materials.glass, [0, 0.15, -0.15], person, 'audience');
    addRod([-0.17, 0.16, -0.22], [-0.17, 0.02, -0.22], 0.014, materials.glassEdge, person, 'audience');
    addRod([0.17, 0.16, -0.22], [0.17, 0.02, -0.22], 0.014, materials.glassEdge, person, 'audience');
  });
});

const spotlightPosition = new THREE.Vector3(0, 5.9, 0.8);
const spotlightTarget = new THREE.Object3D();
spotlightTarget.position.set(0.12, 1.25, -0.72);
sceneGroup.add(spotlightTarget);
const spotlight = new THREE.SpotLight(0xffe8ba, 115, 11, Math.PI / 7, 0.58, 1.25);
spotlight.position.copy(spotlightPosition);
spotlight.target = spotlightTarget;
spotlight.castShadow = true;
spotlight.shadow.mapSize.set(1024, 1024);
spotlight.shadow.bias = -0.0003;
sceneGroup.add(spotlight);
const beam = new THREE.Mesh(new THREE.ConeGeometry(2.25, 5.55, 40, 1, true), materials.spotlight);
beam.position.set(0.05, 3.12, 0.05);
beam.castShadow = false;
sceneGroup.add(beam);

const views = {
  all: { index: '01 / 03', title: '聚光之下', description: '主持人 · 打开现场的情绪', target: [0, 1.3, 1.1], position: [4.6, 4.1, 9.6] },
  host: { index: '02 / 03', title: '与现场对话', description: '主持人 · 一手麦克风，一手向你挥手', target: [-1.15, 1.45, -0.3], position: [1.35, 2.7, 5.2] },
  audience: { index: '03 / 03', title: '回应正在发生', description: '观众席 · 每一次注视都是现场的一部分', target: [0, 0.9, 2.7], position: [0.5, 3.2, 8.4] }
};

let desiredPosition = new THREE.Vector3(...views.all.position);
let desiredTarget = new THREE.Vector3(...views.all.target);
const selectFocus = (key) => {
  const view = views[key] || views.all;
  desiredPosition.set(...view.position);
  desiredTarget.set(...view.target);
  if (stage.clientWidth < 600 && key === 'all') {
    desiredPosition.set(-0.4, 4.55, 12.4);
    desiredTarget.set(-0.65, 1.65, 1.15);
  }
  focusIndex.textContent = view.index;
  focusTitle.textContent = view.title;
  focusDescription.textContent = view.description;
  focusButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.focus === key)));
};

focusButtons.forEach((button) => button.addEventListener('click', () => selectFocus(button.dataset.focus)));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const updatePointer = (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};

canvas.addEventListener('pointermove', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(sceneGroup.children, true).find((item) => item.object.userData.focusKey);
  canvas.style.cursor = hit ? 'pointer' : 'grab';
});
canvas.addEventListener('click', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(sceneGroup.children, true).find((item) => item.object.userData.focusKey);
  if (hit) selectFocus(hit.object.userData.focusKey);
});

const resize = () => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.fov = width < 600 ? 42 : width < 900 ? 39 : 36;
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
  const elapsed = clock.getElapsedTime();
  host.rotation.y = reducedMotion.matches ? 0 : Math.sin(elapsed * 0.4) * 0.025;
  if (!reducedMotion.matches) waveArm.rotation.z = -0.55 + Math.sin(elapsed * 2.2) * 0.13;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

status.textContent = '拖动舞台，遇见现场';
stage.classList.add('is-ready');
animate();
