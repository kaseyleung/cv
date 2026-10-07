import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.commerce-stage');
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
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8e6dc, 13, 26);

const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 70);
camera.position.set(7.1, 5, 11.6);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 5.5;
controls.maxDistance = 21;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0.75, 1.2, 0.45);
controls.update();

scene.add(new THREE.HemisphereLight(0xf6f3e8, 0x73796d, 1.9));

const keyLight = new THREE.DirectionalLight(0xffefd2, 2.5);
keyLight.position.set(-3.5, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -6;
keyLight.shadow.bias = -0.0003;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xc5d9d0, 1.8);
rimLight.position.set(5, 5, -4);
scene.add(rimLight);

const liveGlow = new THREE.PointLight(0xef7895, 24, 7, 2);
liveGlow.position.set(1.2, 2.6, 0.6);
scene.add(liveGlow);

const materials = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdce7e1, transparent: true, opacity: 0.25, roughness: 0.12, metalness: 0.12, transmission: 0.45, thickness: 0.24, clearcoat: 0.9, clearcoatRoughness: 0.12, depthWrite: false }),
  glassEdge: new THREE.MeshStandardMaterial({ color: 0xa9bdb4, metalness: 0.7, roughness: 0.22 }),
  shell: new THREE.MeshPhysicalMaterial({ color: 0xd7ddd8, roughness: 0.23, metalness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.16 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf0f0e9, roughness: 0.28, metalness: 0.08 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x292c2a, roughness: 0.28, metalness: 0.56 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xaeb8b2, roughness: 0.2, metalness: 0.78 }),
  coral: new THREE.MeshStandardMaterial({ color: 0xe16b4a, roughness: 0.32, metalness: 0.2 }),
  cyan: new THREE.MeshStandardMaterial({ color: 0x41d7d1, roughness: 0.28, metalness: 0.14, emissive: 0x123b38, emissiveIntensity: 0.6 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xe55386, roughness: 0.28, metalness: 0.14, emissive: 0x421325, emissiveIntensity: 0.5 }),
  screen: new THREE.MeshPhysicalMaterial({ color: 0x83968d, roughness: 0.12, metalness: 0.24, transmission: 0.28, thickness: 0.1, clearcoat: 1 }),
  carton: new THREE.MeshStandardMaterial({ color: 0xd4c7a9, roughness: 0.82 }),
  tape: new THREE.MeshStandardMaterial({ color: 0xc07c4b, roughness: 0.52 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x343633, roughness: 0.66 }),
  produceGreen: new THREE.MeshStandardMaterial({ color: 0x719465, roughness: 0.72 }),
  produceRed: new THREE.MeshStandardMaterial({ color: 0xc95742, roughness: 0.6 }),
  produceGold: new THREE.MeshStandardMaterial({ color: 0xd9b45e, roughness: 0.62 }),
  spotlight: new THREE.MeshBasicMaterial({ color: 0xffedc9, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }),
  floor: new THREE.MeshStandardMaterial({ color: 0xd8dbd2, roughness: 0.72, metalness: 0.04 })
};

const sceneGroup = new THREE.Group();
sceneGroup.position.x = 0.55;
scene.add(sceneGroup);

const addMesh = (geometry, material, position, parent = sceneGroup, focusKey = '') => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (focusKey) mesh.userData.focusKey = focusKey;
  parent.add(mesh);
  return mesh;
};

const addBox = (size, material, position, parent, focusKey = '') => addMesh(new THREE.BoxGeometry(...size), material, position, parent, focusKey);

const addRod = (start, end, radius, material, parent, focusKey = '') => {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(to, from);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 12), material);
  rod.position.copy(from).add(to).multiplyScalar(0.5);
  rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  rod.castShadow = true;
  rod.receiveShadow = true;
  if (focusKey) rod.userData.focusKey = focusKey;
  parent.add(rod);
  return rod;
};

const makePickable = (group, focusKey) => group.traverse((child) => {
  if (child.isMesh) child.userData.focusKey = focusKey;
});

const floor = addMesh(new THREE.PlaneGeometry(200, 200), materials.floor, [0, -0.08, 0]);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

const platform = new THREE.Group();
platform.position.set(0.2, 0, 0.35);
sceneGroup.add(platform);
addMesh(new THREE.CylinderGeometry(3.4, 3.58, 0.15, 80), materials.glass, [0, 0.15, 0], platform);
addMesh(new THREE.CylinderGeometry(3.55, 3.64, 0.06, 80), materials.glassEdge, [0, 0.06, 0], platform);
addMesh(new THREE.CylinderGeometry(3.3, 3.34, 0.025, 80), materials.glassEdge, [0, 0.235, 0], platform);
const platformRing = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.016, 8, 96), materials.glassEdge);
platformRing.rotation.x = Math.PI / 2;
platformRing.position.y = 0.25;
platform.add(platformRing);

const appliances = new THREE.Group();
sceneGroup.add(appliances);

const refrigerator = new THREE.Group();
refrigerator.position.set(-1.45, 0.25, -0.35);
appliances.add(refrigerator);
addBox([1.04, 2.48, 0.08], materials.shell, [0, 1.31, -0.37], refrigerator, 'appliances');
addBox([0.08, 2.58, 0.82], materials.shell, [-0.52, 1.31, 0], refrigerator, 'appliances');
addBox([0.08, 2.58, 0.82], materials.shell, [0.52, 1.31, 0], refrigerator, 'appliances');
addBox([1.04, 0.08, 0.82], materials.shell, [0, 0.05, 0], refrigerator, 'appliances');
addBox([1.04, 0.08, 0.82], materials.shell, [0, 2.57, 0], refrigerator, 'appliances');
for (const shelfY of [0.92, 1.37, 1.82]) addBox([0.84, 0.024, 0.28], materials.glass, [0, shelfY, 0.12], refrigerator, 'appliances');

const freshFood = new THREE.Group();
refrigerator.add(freshFood);
const addFruit = (x, y, z, material, scale = 1) => {
  const fruit = new THREE.Group();
  fruit.position.set(x, y, z);
  freshFood.add(fruit);
  const body = addMesh(new THREE.SphereGeometry(0.105, 16, 12), material, [0, 0, 0], fruit, 'appliances');
  body.scale.set(0.92 * scale, 1.05 * scale, 0.84 * scale);
  addMesh(new THREE.ConeGeometry(0.022, 0.065, 7), materials.produceGreen, [0, 0.1 * scale, 0], fruit, 'appliances');
};
const produceRows = [
  { height: 1.08, items: [[-0.3, 0.08, materials.produceRed, 1], [0, 0.15, materials.produceGold, 0.92], [0.29, 0.06, materials.produceGreen, 1.05]] },
  { height: 1.53, items: [[-0.3, 0.08, materials.produceGreen, 1.1], [-0.02, 0.16, materials.produceRed, 0.95], [0.28, 0.06, materials.produceGold, 1.05]] },
  { height: 1.98, items: [[-0.3, 0.08, materials.produceGold, 1], [0, 0.16, materials.produceGreen, 0.92], [0.29, 0.06, materials.produceRed, 1.08]] }
];
for (const { height, items } of produceRows) {
  for (const [xPosition, zPosition, material, scale] of items) addFruit(xPosition, height, zPosition, material, scale);
}
const fridgeLamp = new THREE.PointLight(0xffe3b4, 8, 2.6, 2);
fridgeLamp.position.set(0.18, 1.7, 0.12);
fridgeLamp.visible = false;
refrigerator.add(fridgeLamp);

const fridgeDoor = new THREE.Group();
fridgeDoor.position.set(-0.52, 1.31, 0.42);
refrigerator.add(fridgeDoor);
addBox([1.08, 2.48, 0.09], materials.shell, [0.54, 0, 0.025], fridgeDoor, 'appliances');
addBox([0.94, 1.13, 0.025], materials.glass, [0.54, 0.65, 0.078], fridgeDoor, 'appliances');
addBox([0.94, 1.12, 0.025], materials.glass, [0.54, -0.62, 0.078], fridgeDoor, 'appliances');
addBox([0.025, 0.42, 0.035], materials.steel, [0.97, 0.65, 0.105], fridgeDoor, 'appliances');
addBox([0.025, 0.42, 0.035], materials.steel, [0.97, -0.62, 0.105], fridgeDoor, 'appliances');
addBox([0.22, 0.032, 0.02], materials.dark, [0.54, 0.02, 0.088], fridgeDoor, 'appliances');
fridgeDoor.traverse((child) => {
  if (child.isMesh) child.userData.action = 'fridge-door';
});

const airConditioner = new THREE.Group();
airConditioner.position.set(0.15, 2.45, -1.18);
appliances.add(airConditioner);
addBox([2.15, 0.56, 0.64], materials.shell, [0, 0, 0], airConditioner, 'appliances');
addBox([1.88, 0.08, 0.035], materials.glass, [0, -0.19, 0.33], airConditioner, 'appliances');
addBox([1.85, 0.03, 0.025], materials.dark, [0, -0.25, 0.35], airConditioner, 'appliances');
for (let vent = 0; vent < 9; vent += 1) addBox([0.012, 0.11, 0.018], materials.steel, [-0.78 + vent * 0.195, -0.19, 0.36], airConditioner, 'appliances');
addBox([0.045, 0.045, 0.02], materials.cyan, [0.86, 0.12, 0.33], airConditioner, 'appliances');

const washer = new THREE.Group();
washer.position.set(0.16, 0.26, 0.08);
appliances.add(washer);
addBox([1.12, 1.48, 0.86], materials.white, [0, 0.75, 0], washer, 'appliances');
addBox([0.91, 0.12, 0.035], materials.glass, [0, 1.33, 0.45], washer, 'appliances');
addBox([0.08, 0.055, 0.035], materials.coral, [0.38, 1.33, 0.45], washer, 'appliances');
const washerDoor = addMesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 40), materials.steel, [0, 0.68, 0.47], washer, 'appliances');
washerDoor.rotation.x = Math.PI / 2;
const washerGlass = addMesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 40), materials.screen, [0, 0.68, 0.52], washer, 'appliances');
washerGlass.rotation.x = Math.PI / 2;
addMesh(new THREE.TorusGeometry(0.34, 0.025, 8, 40), materials.dark, [0, 0.68, 0.51], washer, 'appliances').rotation.x = Math.PI / 2;

const cart = new THREE.Group();
cart.position.set(2.04, 0.28, 0.08);
sceneGroup.add(cart);
for (const [start, end] of [
  [[-0.48, 0.85, -0.5], [0.48, 0.85, -0.5]], [[-0.48, 0.85, 0.5], [0.48, 0.85, 0.5]],
  [[-0.48, 0.85, -0.5], [-0.48, 0.85, 0.5]], [[0.48, 0.85, -0.5], [0.48, 0.85, 0.5]],
  [[-0.48, 0.85, -0.5], [-0.28, 1.45, -0.5]], [[0.48, 0.85, -0.5], [0.25, 1.45, -0.5]],
  [[-0.28, 1.45, -0.5], [0.25, 1.45, -0.5]], [[-0.48, 0.85, -0.5], [0.38, 0.85, 0.5]]
]) addRod(start, end, 0.022, materials.steel, cart, 'live');
for (let rail = 0; rail < 5; rail += 1) {
  const x = -0.36 + rail * 0.18;
  addRod([x, 0.87, -0.47], [x, 0.87, 0.47], 0.011, materials.glassEdge, cart, 'live');
  const z = -0.32 + rail * 0.16;
  addRod([-0.46, 0.87, z], [0.46, 0.87, z], 0.011, materials.glassEdge, cart, 'live');
}
addRod([0.25, 1.43, -0.5], [0.55, 1.52, -0.62], 0.03, materials.dark, cart, 'live');
for (const wheelX of [-0.38, 0.38]) {
  const wheel = addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24), materials.rubber, [wheelX, 0.15, 0], cart, 'live');
  wheel.rotation.z = Math.PI / 2;
  addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.085, 20), materials.steel, [wheelX, 0.15, 0], cart, 'live').rotation.z = Math.PI / 2;
}
const cartBox = addBox([0.58, 0.48, 0.52], materials.glass, [0, 1.12, 0], cart, 'live');
addBox([0.1, 0.06, 0.02], materials.coral, [0, 1.12, 0.275], cart, 'live');

const logoGroup = new THREE.Group();
logoGroup.position.set(1.28, 2.64, 0.12);
sceneGroup.add(logoGroup);
addMesh(new THREE.CircleGeometry(0.73, 48), materials.glass, [0, 0, -0.08], logoGroup, 'live');
addMesh(new THREE.TorusGeometry(0.73, 0.012, 8, 56), materials.glassEdge, [0, 0, -0.04], logoGroup, 'live');

const makeNote = (material, x, y, z) => {
  const note = new THREE.Group();
  note.position.set(x, y, z);
  const stemShape = new THREE.Shape();
  stemShape.moveTo(-0.06, -0.22);
  stemShape.lineTo(0.08, -0.22);
  stemShape.lineTo(0.08, 0.45);
  stemShape.lineTo(0.42, 0.53);
  stemShape.lineTo(0.42, 0.72);
  stemShape.lineTo(-0.06, 0.61);
  stemShape.closePath();
  note.add(new THREE.Mesh(new THREE.ExtrudeGeometry(stemShape, { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.02 }), material));
  const noteHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 22, 14), material);
  noteHead.position.set(-0.08, -0.25, 0.04);
  noteHead.scale.set(1.22, 0.72, 0.52);
  note.add(noteHead);
  logoGroup.add(note);
};
makeNote(materials.cyan, -0.15, -0.03, 0.01);
makeNote(materials.pink, -0.04, 0.02, 0.045);
makeNote(materials.dark, 0.025, 0.08, 0.085);
addBox([0.52, 0.025, 0.03], materials.dark, [0, -0.48, 0.06], logoGroup, 'live');

const cameraRig = new THREE.Group();
cameraRig.position.set(2.02, 0.28, -0.68);
sceneGroup.add(cameraRig);
addBox([0.56, 0.38, 0.42], materials.dark, [0, 1.42, 0], cameraRig, 'live');
addMesh(new THREE.CylinderGeometry(0.18, 0.21, 0.18, 28), materials.steel, [0, 1.42, 0.27], cameraRig, 'live').rotation.x = Math.PI / 2;
addMesh(new THREE.CylinderGeometry(0.13, 0.15, 0.07, 28), materials.screen, [0, 1.42, 0.38], cameraRig, 'live').rotation.x = Math.PI / 2;
addBox([0.18, 0.13, 0.1], materials.coral, [0, 1.68, 0], cameraRig, 'live');
addRod([0, 1.23, -0.02], [0, 0.72, -0.02], 0.026, materials.steel, cameraRig, 'live');
for (const end of [[-0.31, 0.03, 0.17], [0.31, 0.03, 0.17], [0, 0.03, -0.3]]) addRod([0, 0.72, -0.02], end, 0.02, materials.dark, cameraRig, 'live');

const dataBoard = new THREE.Group();
dataBoard.position.set(2.83, 2.52, -0.86);
dataBoard.rotation.y = 0.16;
sceneGroup.add(dataBoard);
addBox([1.98, 1.32, 0.12], materials.glass, [0, 0, 0], dataBoard, 'live');
addBox([1.9, 1.24, 0.035], materials.glassEdge, [0, 0, -0.065], dataBoard, 'live');
const chartCanvas = document.createElement('canvas');
chartCanvas.width = 760;
chartCanvas.height = 500;
const chartContext = chartCanvas.getContext('2d');
chartContext.fillStyle = 'rgba(243, 241, 233, 0.88)';
chartContext.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
chartContext.strokeStyle = 'rgba(103, 119, 108, 0.34)';
chartContext.lineWidth = 3;
chartContext.strokeRect(2, 2, chartCanvas.width - 4, chartCanvas.height - 4);
chartContext.fillStyle = '#68746b';
chartContext.font = '500 25px "DM Mono", monospace';
chartContext.fillText('LIVE GMV / 2025', 34, 54);
chartContext.fillStyle = '#262626';
chartContext.font = '600 66px Manrope, sans-serif';
chartContext.fillText('HK$500K+', 32, 142);
chartContext.fillStyle = '#df6341';
chartContext.font = '600 25px Manrope, sans-serif';
chartContext.fillText('CONVERSION  +15-20%', 34, 190);
chartContext.strokeStyle = 'rgba(103, 119, 108, 0.24)';
chartContext.lineWidth = 2;
for (const y of [244, 304, 364]) {
  chartContext.beginPath();
  chartContext.moveTo(34, y);
  chartContext.lineTo(726, y);
  chartContext.stroke();
}
const chartBars = [72, 116, 158, 222, 278, 350];
chartBars.forEach((height, index) => {
  chartContext.fillStyle = index === chartBars.length - 1 ? '#df6341' : 'rgba(117, 143, 126, 0.68)';
  chartContext.fillRect(64 + index * 106, 414 - height * 0.48, 42, height * 0.48);
});
chartContext.strokeStyle = '#df6341';
chartContext.lineWidth = 5;
chartContext.beginPath();
chartBars.forEach((height, index) => {
  const x = 85 + index * 106;
  const y = 414 - height * 0.48;
  if (index === 0) chartContext.moveTo(x, y);
  else chartContext.lineTo(x, y);
});
chartContext.stroke();
chartContext.fillStyle = '#68746b';
chartContext.font = '20px "DM Mono", monospace';
chartContext.fillText('AUDIENCE  /  STORY  /  GROWTH', 34, 474);
const chartTexture = new THREE.CanvasTexture(chartCanvas);
chartTexture.colorSpace = THREE.SRGBColorSpace;
const chartScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.17), new THREE.MeshBasicMaterial({ map: chartTexture, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
chartScreen.position.z = 0.071;
dataBoard.add(chartScreen);

const fulfillment = new THREE.Group();
fulfillment.position.set(0.72, 0.28, 2.05);
sceneGroup.add(fulfillment);

const makeParcel = (parent, position, size, accent = false) => {
  const parcel = new THREE.Group();
  parcel.position.set(...position);
  parent.add(parcel);
  const [width, height, depth] = size;
  addBox(size, materials.carton, [0, height / 2, 0], parcel, 'fulfillment');
  addBox([width * 0.12, height + 0.015, depth + 0.02], materials.tape, [0, height / 2, 0], parcel, 'fulfillment');
  addBox([width * 0.34, 0.035, depth * 0.4], accent ? materials.coral : materials.glass, [0, height * 0.66, depth / 2 + 0.014], parcel, 'fulfillment');
  for (const x of [-width * 0.32, width * 0.32]) addBox([0.025, 0.13, 0.018], materials.dark, [x, height * 0.66, depth / 2 + 0.025], parcel, 'fulfillment');
  return parcel;
};
makeParcel(fulfillment, [-0.55, 0, -0.12], [0.78, 0.72, 0.68], true);
makeParcel(fulfillment, [0.36, 0, -0.16], [0.92, 0.98, 0.78]);
makeParcel(fulfillment, [0, 0.98, -0.1], [0.7, 0.68, 0.64], true);

const van = new THREE.Group();
van.position.set(0.92, 0.28, 2.25);
fulfillment.add(van);
addBox([1.7, 0.94, 0.88], materials.glass, [0.32, 0.77, 0], van, 'fulfillment');
addBox([0.76, 0.74, 0.84], materials.shell, [-0.94, 0.65, 0], van, 'fulfillment');
addBox([0.57, 0.4, 0.06], materials.screen, [-0.97, 0.79, 0.45], van, 'fulfillment');
addBox([0.5, 0.12, 0.04], materials.coral, [-0.94, 0.35, 0.46], van, 'fulfillment');
addBox([1.56, 0.035, 0.02], materials.glassEdge, [0.32, 1.26, 0.46], van, 'fulfillment');
addBox([0.48, 0.16, 0.035], materials.cyan, [0.36, 0.78, 0.46], van, 'fulfillment');
addBox([0.22, 0.16, 0.02], materials.dark, [1.01, 0.78, 0.47], van, 'fulfillment');
addBox([0.22, 0.2, 0.07], materials.steel, [-1.34, 0.31, 0], van, 'fulfillment');
for (const wheelX of [-0.92, 0.86]) {
  const wheel = addMesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 28), materials.rubber, [wheelX, 0.24, 0], van, 'fulfillment');
  wheel.rotation.z = Math.PI / 2;
  addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.13, 24), materials.steel, [wheelX, 0.24, 0], van, 'fulfillment').rotation.z = Math.PI / 2;
}

const spotTarget = new THREE.Object3D();
spotTarget.position.set(0.05, 0.7, -0.05);
sceneGroup.add(spotTarget);
const spot = new THREE.SpotLight(0xffefcf, 48, 12, Math.PI / 6, 0.72, 1.25);
spot.position.set(0.2, 5.7, 0.2);
spot.target = spotTarget;
sceneGroup.add(spot);
const beam = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.1, 36, 1, true), materials.spotlight);
beam.position.set(0.2, 3.55, 0.15);
sceneGroup.add(beam);

for (const [from, to] of [
  [[-0.2, 0.03, 1.05], [-0.4, 0.04, 1.38]], [[-0.4, 0.04, 1.38], [-0.42, 0.04, 1.72]],
  [[-0.42, 0.04, 1.72], [0.25, 0.04, 2.0]], [[0.25, 0.04, 2.0], [0.9, 0.04, 2.56]]
]) {
  const fromPoint = new THREE.Vector3(...from);
  const toPoint = new THREE.Vector3(...to);
  const curve = new THREE.QuadraticBezierCurve3(fromPoint, fromPoint.clone().lerp(toPoint, 0.5).add(new THREE.Vector3(0, 0.28, 0)), toPoint);
  const route = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.012, 6, false), materials.coral);
  route.userData.focusKey = 'fulfillment';
  sceneGroup.add(route);
}
for (const [x, z] of [[-0.2, 1.05], [-0.4, 1.38], [-0.42, 1.72], [0.25, 2], [0.9, 2.56]]) addMesh(new THREE.SphereGeometry(0.045, 12, 8), materials.coral, [x, 0.06, z], sceneGroup, 'fulfillment');

makePickable(refrigerator, 'appliances');
makePickable(airConditioner, 'appliances');
makePickable(washer, 'appliances');
makePickable(cart, 'live');
makePickable(logoGroup, 'live');
makePickable(cameraRig, 'live');
makePickable(fulfillment, 'fulfillment');

const views = {
  all: { index: '01 / 04', title: '增长闭环', description: '内容 · 转化 · 履约', target: [0.75, 1.2, 0.45], position: [7.1, 5, 11.6] },
  appliances: { index: '02 / 04', title: '产品力被看见', description: '空调 · 冰箱 · 洗烘套系', target: [-0.35, 1.6, -0.35], position: [3.7, 3.7, 6.6] },
  live: { index: '03 / 04', title: '直播间促成转化', description: '增长看板 · 平台内容 · 商品展示', target: [2.2, 2, -0.25], position: [5.4, 3.8, 6.8] },
  fulfillment: { index: '04 / 04', title: '从下单到送达', description: '打包 · 出库 · 物流配送', target: [1.35, 1, 3.4], position: [5.2, 3.8, 9] }
};

const fridgeToggle = document.querySelector('#fridge-toggle');
let fridgeDoorTarget = 0;
let fridgeOpen = false;
const setFridgeOpen = (open = !fridgeOpen) => {
  fridgeOpen = open;
  fridgeDoorTarget = fridgeOpen ? -Math.PI * 0.48 : 0;
  fridgeLamp.visible = fridgeOpen;
  fridgeToggle.setAttribute('aria-pressed', String(fridgeOpen));
  fridgeToggle.textContent = fridgeOpen ? '关闭冰箱门' : '打开冰箱门';
};
fridgeToggle.addEventListener('click', () => setFridgeOpen());

let desiredPosition = new THREE.Vector3(...views.all.position);
let desiredTarget = new THREE.Vector3(...views.all.target);

const selectFocus = (key) => {
  const view = views[key] || views.all;
  desiredPosition.set(...view.position);
  desiredTarget.set(...view.target);
  if (stage.clientWidth < 600 && key === 'all') {
    desiredPosition.set(0.75, 6.1, 19);
    desiredTarget.set(0.65, 1.2, 0.5);
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
  if (hit?.object.userData.action === 'fridge-door') {
    setFridgeOpen();
    selectFocus('appliances');
  } else if (hit) {
    selectFocus(hit.object.userData.focusKey);
  }
});

const resize = () => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.fov = width < 600 ? 43 : width < 900 ? 39 : 36;
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
  logoGroup.rotation.y = reducedMotion.matches ? 0 : Math.sin(elapsed * 0.45) * 0.08;
  fridgeDoor.rotation.y += (fridgeDoorTarget - fridgeDoor.rotation.y) * 0.12;
  camera.position.lerp(desiredPosition, 0.045);
  controls.target.lerp(desiredTarget, 0.045);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

status.textContent = '拖动场景，浏览增长链路';
stage.classList.add('is-ready');
animate();