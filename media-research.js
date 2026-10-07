import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.querySelector('.campus-stage');
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
scene.fog = new THREE.Fog(0xe8e8df, 13, 27);

const camera = new THREE.PerspectiveCamera(36, stage.clientWidth / stage.clientHeight, 0.1, 70);
camera.position.set(4.2, 4.2, 10.2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 5.5;
controls.maxDistance = 17;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = Math.PI * 0.48;
controls.target.set(0.65, 1.35, 0.05);
controls.update();

scene.add(new THREE.HemisphereLight(0xf7f4e9, 0x707a70, 1.9));
const sun = new THREE.DirectionalLight(0xfff0d6, 2.2);
sun.position.set(-4, 8, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -6;
sun.shadow.bias = -0.0003;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc7ddd2, 1.4);
fill.position.set(4, 5, -4);
scene.add(fill);
const interviewLight = new THREE.SpotLight(0xffedcf, 42, 9, Math.PI / 5, 0.62, 1.25);
interviewLight.position.set(-1.3, 5.6, 2.2);
scene.add(interviewLight);

const materials = {
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdce7df, transparent: true, opacity: 0.24, roughness: 0.12, metalness: 0.12, transmission: 0.42, thickness: 0.22, clearcoat: 0.85, clearcoatRoughness: 0.14, depthWrite: false }),
  edge: new THREE.MeshStandardMaterial({ color: 0xaab9ad, metalness: 0.64, roughness: 0.22 }),
  building: new THREE.MeshPhysicalMaterial({ color: 0xd9e2dc, transparent: true, opacity: 0.46, roughness: 0.24, metalness: 0.12, clearcoat: 0.72 }),
  window: new THREE.MeshPhysicalMaterial({ color: 0x91aaa0, transparent: true, opacity: 0.4, roughness: 0.12, metalness: 0.2, transmission: 0.28 }),
  reporter: new THREE.MeshPhysicalMaterial({ color: 0x71877b, roughness: 0.28, metalness: 0.08, clearcoat: 0.6 }),
  visitor: new THREE.MeshPhysicalMaterial({ color: 0xc18468, roughness: 0.36, metalness: 0.06, clearcoat: 0.35 }),
  photographer: new THREE.MeshPhysicalMaterial({ color: 0x404742, roughness: 0.32, metalness: 0.22, clearcoat: 0.45 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd7aa8c, roughness: 0.62 }),
  hair: new THREE.MeshStandardMaterial({ color: 0x302d29, roughness: 0.78 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x292d2a, roughness: 0.3, metalness: 0.5 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb4bcb4, roughness: 0.22, metalness: 0.74 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xdf6341, roughness: 0.34, metalness: 0.14 }),
  leaf: new THREE.MeshPhysicalMaterial({ color: 0x849a83, transparent: true, opacity: 0.63, roughness: 0.44, metalness: 0.02, clearcoat: 0.25 }),
  paper: new THREE.MeshStandardMaterial({ color: 0xf2f0e7, roughness: 0.83 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xd9dbd1, roughness: 0.76, metalness: 0.035 })
};

const campus = new THREE.Group();
scene.add(campus);
const addMesh = (geometry, material, position, parent = campus, focusKey = '') => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (focusKey) mesh.userData.focusKey = focusKey;
  parent.add(mesh);
  return mesh;
};
const addBox = (size, material, position, parent = campus, focusKey = '') => addMesh(new THREE.BoxGeometry(...size), material, position, parent, focusKey);
const addRod = (start, end, radius, material, parent = campus, focusKey = '') => {
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

const ground = addMesh(new THREE.PlaneGeometry(200, 200), materials.floor, [0, -0.08, 0]);
ground.rotation.x = -Math.PI / 2;
ground.castShadow = false;

const platform = new THREE.Group();
platform.position.set(0, 0, 0.15);
campus.add(platform);
addBox([8.2, 0.15, 4.6], materials.glass, [0, 0.1, 0], platform);
addBox([8.2, 0.035, 4.6], materials.edge, [0, 0.015, 0], platform);
for (const x of [-3.85, 3.85]) {
  for (const z of [-2.05, 2.05]) addBox([0.07, 0.58, 0.07], materials.glass, [x, -0.23, z], platform);
}

const school = new THREE.Group();
campus.add(school);
addBox([8.8, 3.4, 0.22], materials.building, [0, 1.83, -3.05], school);
addBox([9, 0.16, 0.34], materials.edge, [0, 3.6, -3.02], school);
addBox([9, 0.12, 0.36], materials.edge, [0, 0.16, -3.02], school);
for (const x of [-3.7, -2.2, -0.7, 0.8, 2.3, 3.8]) {
  addBox([0.075, 3.2, 0.18], materials.edge, [x, 1.82, -2.88], school);
  addBox([1.24, 0.045, 0.08], materials.edge, [x + 0.68, 1.78, -2.82], school);
  addBox([1.24, 0.045, 0.08], materials.edge, [x + 0.68, 2.9, -2.82], school);
}
for (const x of [-2.9, -0.5, 1.9]) addBox([0.36, 0.62, 0.055], materials.edge, [x, 0.62, -2.82], school);

const treePositions = [[-4, -1.4], [-3.7, 1.5], [4, -1.3], [4, -2.7]];
for (const [x, z] of treePositions) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  campus.add(tree);
  addMesh(new THREE.CylinderGeometry(0.09, 0.14, 1.3, 12), materials.edge, [0, 0.65, 0], tree);
  for (const [y, radius] of [[1.45, 0.65], [1.95, 0.52], [2.36, 0.36]]) {
    addMesh(new THREE.IcosahedronGeometry(radius, 1), materials.leaf, [0, y, 0], tree);
  }
}

const createPerson = ({ position, facing = 0, clothes, focusKey }) => {
  const person = new THREE.Group();
  person.position.set(...position);
  person.rotation.y = facing;
  campus.add(person);
  const part = (geometry, material, point) => addMesh(geometry, material, point, person, focusKey);
  const limb = (from, to, radius, material) => addRod(from, to, radius, material, person, focusKey);
  part(new THREE.CapsuleGeometry(0.18, 0.56, 5, 12), clothes, [0, 1.16, 0]);
  part(new THREE.SphereGeometry(0.17, 18, 12), materials.skin, [0, 1.86, 0]);
  part(new THREE.SphereGeometry(0.18, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), materials.hair, [0, 1.94, -0.02]);
  part(new THREE.CapsuleGeometry(0.105, 0.48, 4, 10), clothes, [-0.12, 0.47, 0]);
  part(new THREE.CapsuleGeometry(0.105, 0.48, 4, 10), clothes, [0.12, 0.47, 0]);
  part(new THREE.BoxGeometry(0.2, 0.1, 0.36), materials.dark, [-0.12, 0.09, 0.05]);
  part(new THREE.BoxGeometry(0.2, 0.1, 0.36), materials.dark, [0.12, 0.09, 0.05]);
  part(new THREE.CapsuleGeometry(0.075, 0.26, 4, 10), clothes, [-0.28, 1.45, 0]);
  part(new THREE.CapsuleGeometry(0.075, 0.26, 4, 10), clothes, [0.28, 1.45, 0]);
  part(new THREE.SphereGeometry(0.07, 12, 10), materials.skin, [-0.28, 1.27, 0.03]);
  part(new THREE.SphereGeometry(0.07, 12, 10), materials.skin, [0.28, 1.27, 0.03]);
  return person;
};

const reporter = createPerson({ position: [-1.55, 0.18, 0.25], facing: Math.PI / 2, clothes: materials.reporter, focusKey: 'interview' });
addBox([0.12, 0.28, 0.06], materials.paper, [0, 1.37, 0.1], reporter, 'interview');
const reporterMic = new THREE.Group();
reporterMic.position.set(0, 1.5, 0.72);
reporter.add(reporterMic);
addMesh(new THREE.CylinderGeometry(0.035, 0.04, 0.26, 14), materials.dark, [0, 0, 0], reporterMic, 'interview');
addMesh(new THREE.SphereGeometry(0.075, 14, 10), materials.steel, [0, 0.17, 0], reporterMic, 'interview');
addMesh(new THREE.TorusGeometry(0.075, 0.008, 6, 18), materials.dark, [0, 0.17, 0], reporterMic, 'interview');
addRod([0.28, 1.27, 0.03], [0.16, 1.34, 0.38], 0.065, materials.reporter, reporter, 'interview');
addRod([0.16, 1.34, 0.38], [0.02, 1.48, 0.66], 0.05, materials.reporter, reporter, 'interview');

const interviewee = createPerson({ position: [-0.03, 0.18, 0.25], facing: -Math.PI / 2, clothes: materials.visitor, focusKey: 'interview' });
const intervieweeEyes = new THREE.Group();
intervieweeEyes.position.set(0, 1.86, 0.16);
interviewee.add(intervieweeEyes);
for (const eyeX of [-0.055, 0.055]) addMesh(new THREE.SphereGeometry(0.014, 8, 6), materials.dark, [eyeX, 0, 0], intervieweeEyes, 'interview');

const photographer = createPerson({ position: [2, 0.18, -1.2], facing: -Math.PI / 2, clothes: materials.photographer, focusKey: 'shooting' });
const cameraBody = addBox([0.42, 0.28, 0.22], materials.dark, [0, 1.5, 0.44], photographer, 'shooting');
const lens = addMesh(new THREE.CylinderGeometry(0.11, 0.13, 0.2, 22), materials.steel, [0, 1.5, 0.62], photographer, 'shooting');
lens.rotation.x = Math.PI / 2;
const lensGlass = addMesh(new THREE.CylinderGeometry(0.085, 0.095, 0.06, 22), materials.window, [0, 1.5, 0.75], photographer, 'shooting');
lensGlass.rotation.x = Math.PI / 2;
addBox([0.11, 0.08, 0.08], materials.accent, [0.07, 1.68, 0.44], photographer, 'shooting');
addRod([-0.28, 1.3, 0.02], [-0.17, 1.39, 0.35], 0.06, materials.photographer, photographer, 'shooting');
addRod([-0.17, 1.39, 0.35], [-0.1, 1.48, 0.5], 0.045, materials.photographer, photographer, 'shooting');
addRod([0.28, 1.3, 0.02], [0.19, 1.38, 0.32], 0.06, materials.photographer, photographer, 'shooting');
addRod([0.19, 1.38, 0.32], [0.1, 1.49, 0.5], 0.045, materials.photographer, photographer, 'shooting');

const newspaperCanvas = document.createElement('canvas');
newspaperCanvas.width = 520;
newspaperCanvas.height = 720;
const newspaperContext = newspaperCanvas.getContext('2d');
newspaperContext.fillStyle = '#f4f1e7';
newspaperContext.fillRect(0, 0, 520, 720);
newspaperContext.fillStyle = '#29332e';
newspaperContext.fillRect(22, 22, 476, 5);
newspaperContext.font = '600 48px "Noto Serif SC", serif';
newspaperContext.fillText('华媒青年报', 28, 96);
newspaperContext.font = '18px "DM Mono", monospace';
newspaperContext.fillStyle = '#68746b';
newspaperContext.fillText('HUAMEI CAMPUS DAILY  /  2024', 30, 132);
newspaperContext.fillStyle = '#df6341';
newspaperContext.fillRect(30, 154, 460, 3);
newspaperContext.fillStyle = '#262626';
newspaperContext.font = '600 30px "Noto Serif SC", serif';
newspaperContext.fillText('把校园现场变成第一现场', 30, 208);
newspaperContext.fillStyle = '#8ea79b';
newspaperContext.fillRect(30, 230, 286, 185);
newspaperContext.fillStyle = 'rgba(243,241,233,.72)';
newspaperContext.beginPath();
newspaperContext.arc(185, 315, 48, 0, Math.PI * 2);
newspaperContext.fill();
newspaperContext.fillStyle = '#536d5e';
newspaperContext.fillRect(35, 355, 278, 60);
newspaperContext.fillStyle = '#b8c8bc';
newspaperContext.fillRect(330, 230, 160, 12);
newspaperContext.fillRect(330, 257, 145, 9);
newspaperContext.fillRect(330, 280, 154, 9);
for (let row = 0; row < 8; row += 1) {
  newspaperContext.fillStyle = row % 2 ? '#9b9d91' : '#c2c1b5';
  newspaperContext.fillRect(30, 450 + row * 26, row % 3 ? 218 : 270, 7);
  newspaperContext.fillRect(330, 450 + row * 26, row % 2 ? 156 : 174, 7);
}
const newspaperTexture = new THREE.CanvasTexture(newspaperCanvas);
newspaperTexture.colorSpace = THREE.SRGBColorSpace;
const newspaper = new THREE.Group();
newspaper.position.set(3.02, 1.45, 0.35);
campus.add(newspaper);
addBox([1.24, 1.62, 0.065], materials.edge, [0, 0, 0], newspaper, 'shooting');
addMesh(new THREE.PlaneGeometry(1.14, 1.52), new THREE.MeshBasicMaterial({ map: newspaperTexture, toneMapped: false, side: THREE.DoubleSide }), [0, 0, 0.04], newspaper, 'shooting');
addRod([-0.42, -0.82, -0.015], [-0.55, -1.55, -0.42], 0.028, materials.edge, newspaper, 'shooting');
addRod([0.42, -0.82, -0.015], [0.55, -1.55, -0.42], 0.028, materials.edge, newspaper, 'shooting');
addRod([-0.55, -1.54, -0.42], [0.55, -1.54, -0.42], 0.025, materials.edge, newspaper, 'shooting');

for (const [from, to] of [
  [[-1.2, 0.16, 0.72], [-0.8, 0.17, 0.7]], [[-0.8, 0.17, 0.7], [-0.35, 0.17, 0.63]],
  [[-0.35, 0.17, 0.63], [0.25, 0.17, 0.4]], [[0.25, 0.17, 0.4], [1.15, 0.17, 0.22]]
]) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const curve = new THREE.QuadraticBezierCurve3(start, start.clone().lerp(end, 0.5).add(new THREE.Vector3(0, 0.22, 0)), end);
  const route = new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.01, 6, false), materials.accent);
  route.userData.focusKey = 'interview';
  campus.add(route);
}

const mobileEdition = [
  { category: '人物 / CAMPUS VOICE', title: ['把校园现场', '变成第一现场'], summary: ['学生记者走进课堂、社团与活动现场，', '让真实的校园声音成为新闻的起点。'], image: '#a8b9ad', accent: '#df6341' },
  { category: '社团 / STUDENT LIFE', title: ['用镜头讲述', '社团新故事'], summary: ['青年影像小组记录排练、创作与协作，', '短片让校园生活被更多人看见。'], image: '#c8d4c9', accent: '#71877b' },
  { category: '文化 / CAMPUS CULTURE', title: ['旧书漂流角', '让阅读继续'], summary: ['毕业季留下的书籍在校园里再次流动，', '一场交换连接起不同年级的阅读记忆。'], image: '#d7c8b5', accent: '#bd7656' }
];
const phoneCanvas = document.createElement('canvas');
phoneCanvas.width = 420;
phoneCanvas.height = 760;
const phoneContext = phoneCanvas.getContext('2d');
const drawEditionPage = (pageIndex) => {
  const page = mobileEdition[pageIndex];
  phoneContext.fillStyle = '#f3f1e9';
  phoneContext.fillRect(0, 0, phoneCanvas.width, phoneCanvas.height);
  phoneContext.fillStyle = '#303a33';
  phoneContext.fillRect(24, 24, 372, 4);
  phoneContext.fillStyle = '#df6341';
  phoneContext.beginPath();
  phoneContext.arc(34, 62, 6, 0, Math.PI * 2);
  phoneContext.fill();
  phoneContext.fillStyle = '#303a33';
  phoneContext.font = '600 25px "Noto Serif SC", serif';
  phoneContext.fillText('华媒青年报', 52, 70);
  phoneContext.fillStyle = '#6e786f';
  phoneContext.font = '13px "DM Mono", monospace';
  phoneContext.fillText('HUAMEI DIGITAL EDITION', 26, 98);
  phoneContext.fillStyle = page.accent;
  phoneContext.fillRect(26, 116, 368, 3);
  phoneContext.fillStyle = '#727d73';
  phoneContext.font = '12px "DM Mono", monospace';
  phoneContext.fillText(page.category, 28, 145);
  phoneContext.fillStyle = '#272b27';
  phoneContext.font = '600 34px "Noto Serif SC", serif';
  phoneContext.fillText(page.title[0], 26, 193);
  phoneContext.fillText(page.title[1], 26, 235);
  phoneContext.fillStyle = page.image;
  phoneContext.fillRect(26, 260, 368, 220);
  phoneContext.fillStyle = 'rgba(243,241,233,.62)';
  phoneContext.fillRect(43, 277, 334, 186);
  phoneContext.fillStyle = '#73897a';
  phoneContext.fillRect(43, 397, 334, 66);
  phoneContext.fillStyle = '#d7aa8c';
  phoneContext.beginPath();
  phoneContext.arc(161, 336, 34, 0, Math.PI * 2);
  phoneContext.arc(260, 336, 34, 0, Math.PI * 2);
  phoneContext.fill();
  phoneContext.fillStyle = '#71877b';
  phoneContext.fillRect(126, 367, 70, 76);
  phoneContext.fillStyle = '#c18468';
  phoneContext.fillRect(225, 367, 70, 76);
  phoneContext.fillStyle = '#303a33';
  phoneContext.fillRect(178, 347, 9, 47);
  phoneContext.fillStyle = '#df6341';
  phoneContext.beginPath();
  phoneContext.arc(183, 340, 9, 0, Math.PI * 2);
  phoneContext.fill();
  phoneContext.fillStyle = '#343a34';
  phoneContext.font = '16px "Noto Serif SC", serif';
  phoneContext.fillText(page.summary[0], 28, 522);
  phoneContext.fillText(page.summary[1], 28, 550);
  phoneContext.strokeStyle = 'rgba(65,78,67,.22)';
  phoneContext.lineWidth = 1;
  for (let row = 0; row < 4; row += 1) {
    phoneContext.beginPath();
    phoneContext.moveTo(28, 588 + row * 24);
    phoneContext.lineTo(row === 3 ? 270 : 390, 588 + row * 24);
    phoneContext.stroke();
  }
  phoneContext.fillStyle = '#788178';
  phoneContext.font = '12px "DM Mono", monospace';
  phoneContext.fillText(`CAMPUS DAILY  /  2024.04     ${String(pageIndex + 1).padStart(2, '0')} / 03`, 28, 708);
};
let mobileEditionIndex = 0;
drawEditionPage(mobileEditionIndex);
const editionTexture = new THREE.CanvasTexture(phoneCanvas);
editionTexture.colorSpace = THREE.SRGBColorSpace;
const editionCount = document.querySelector('#news-page-count');
const editionTitle = document.querySelector('#news-page-title');
const phoneZoomButton = document.querySelector('#phone-zoom-toggle');
const setEditionPage = (nextIndex) => {
  mobileEditionIndex = (nextIndex + mobileEdition.length) % mobileEdition.length;
  drawEditionPage(mobileEditionIndex);
  editionTexture.needsUpdate = true;
  editionCount.textContent = `${String(mobileEditionIndex + 1).padStart(2, '0')} / ${String(mobileEdition.length).padStart(2, '0')}`;
  editionTitle.textContent = mobileEdition[mobileEditionIndex].title.join(' · ');
};
document.querySelector('#news-prev').addEventListener('click', () => setEditionPage(mobileEditionIndex - 1));
document.querySelector('#news-next').addEventListener('click', () => setEditionPage(mobileEditionIndex + 1));
const phone = new THREE.Group();
phone.position.set(2.55, 0.2, 1.4);
phone.rotation.y = -0.12;
campus.add(phone);
addBox([0.88, 1.7, 0.1], materials.edge, [0, 1.18, 0], phone, 'shooting');
addBox([0.82, 1.62, 0.1], materials.dark, [0, 1.18, 0.01], phone, 'shooting');
const phoneScreen = addMesh(new THREE.PlaneGeometry(0.75, 1.36), new THREE.MeshBasicMaterial({ map: editionTexture, toneMapped: false }), [0, 1.18, 0.063], phone, 'shooting');
phoneScreen.userData.action = 'phone-screen';
addBox([0.16, 0.018, 0.008], materials.steel, [0, 1.9, 0.066], phone, 'shooting');
addMesh(new THREE.CircleGeometry(0.025, 16), materials.steel, [0, 0.43, 0.066], phone, 'shooting');
const phoneStand = new THREE.Group();
phoneStand.position.set(0, 0.2, 0);
phone.add(phoneStand);
addRod([-0.13, 0.45, -0.02], [0, 0.04, -0.3], 0.025, materials.edge, phoneStand, 'shooting');
addRod([0.13, 0.45, -0.02], [0, 0.04, -0.3], 0.025, materials.edge, phoneStand, 'shooting');
addBox([0.5, 0.035, 0.35], materials.glass, [0, 0.02, -0.19], phoneStand, 'shooting');

const views = {
  all: { index: '01 / 03', title: '校园新闻现场', description: '采访 · 记录 · 传播', target: [0.55, 1.35, 0.05], position: [4.2, 4.2, 10.2] },
  interview: { index: '02 / 03', title: '走进现场', description: '记者提问 · 同学分享', target: [-0.8, 1.35, 0.22], position: [2.7, 2.9, 6.1] },
  shooting: { index: '03 / 03', title: '记录校园声音', description: '摄像机 · 华媒青年报', target: [2.2, 1.45, 0.25], position: [4.1, 3.1, 6.4] }
};
let desiredPosition = new THREE.Vector3(...views.all.position);
let desiredTarget = new THREE.Vector3(...views.all.target);
let currentFocusKey = 'all';
let focusBeforePhoneZoom = 'all';
let phoneZoomed = false;
const selectFocus = (key) => {
  const view = views[key] || views.all;
  currentFocusKey = key;
  desiredPosition.set(...view.position);
  desiredTarget.set(...view.target);
  if (stage.clientWidth < 600 && key === 'all') {
    desiredPosition.set(0.4, 5.7, 14.5);
    desiredTarget.set(0.45, 1.3, 0.08);
  }
  focusIndex.textContent = view.index;
  focusTitle.textContent = view.title;
  focusDescription.textContent = view.description;
  focusButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.focus === key)));
};
const setPhoneZoom = (open) => {
  if (phoneZoomed === open) return;
  if (open) {
    focusBeforePhoneZoom = currentFocusKey;
    phoneZoomed = true;
    const screenCenter = phone.localToWorld(new THREE.Vector3(0, 1.18, 0));
    const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.quaternion).normalize();
    desiredTarget.copy(screenCenter);
    desiredPosition.copy(screenCenter).addScaledVector(screenNormal, stage.clientWidth < 600 ? 3 : 3.5);
    controls.minDistance = 1.2;
    controls.maxDistance = 7;
    camera.fov = stage.clientWidth < 600 ? 38 : 30;
    focusIndex.textContent = `READ / ${String(mobileEditionIndex + 1).padStart(2, '0')}`;
    focusTitle.textContent = '手机电子报';
    focusDescription.textContent = '点击手机或按 Esc 还原 · 左右滑动翻页';
    focusButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
  } else {
    phoneZoomed = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 17;
    camera.fov = stage.clientWidth < 600 ? 42 : stage.clientWidth < 900 ? 39 : 36;
    selectFocus(focusBeforePhoneZoom);
  }
  camera.updateProjectionMatrix();
  phoneZoomButton.setAttribute('aria-pressed', String(phoneZoomed));
  phoneZoomButton.textContent = phoneZoomed ? '还原场景' : '放大内容';
};
phoneZoomButton.addEventListener('click', () => setPhoneZoom(!phoneZoomed));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && phoneZoomed) setPhoneZoom(false);
});
focusButtons.forEach((button) => button.addEventListener('click', () => {
  if (phoneZoomed) setPhoneZoom(false);
  selectFocus(button.dataset.focus);
}));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let phoneGesture = null;
let suppressPhoneClick = false;
const updatePointer = (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};
canvas.addEventListener('pointerdown', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hitPhone = raycaster.intersectObject(phoneScreen, true).length > 0;
  if (!hitPhone) return;
  phoneGesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  controls.enabled = false;
  canvas.setPointerCapture(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}, true);
const finishPhoneGesture = (event) => {
  if (!phoneGesture || phoneGesture.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - phoneGesture.x;
  const deltaY = event.clientY - phoneGesture.y;
  phoneGesture = null;
  controls.enabled = true;
  if (Math.abs(deltaX) > 34 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
    setEditionPage(mobileEditionIndex + (deltaX < 0 ? 1 : -1));
    suppressPhoneClick = true;
    window.setTimeout(() => { suppressPhoneClick = false; }, 350);
  }
};
canvas.addEventListener('pointerup', finishPhoneGesture, true);
canvas.addEventListener('pointercancel', finishPhoneGesture, true);
canvas.addEventListener('pointermove', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(campus.children, true).find((intersection) => intersection.object.userData.focusKey);
  canvas.style.cursor = hit ? 'pointer' : 'grab';
});
canvas.addEventListener('click', (event) => {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(campus.children, true).find((intersection) => intersection.object.userData.focusKey);
  if (hit?.object.userData.action === 'phone-screen') {
    if (suppressPhoneClick) {
      suppressPhoneClick = false;
      return;
    }
    setPhoneZoom(!phoneZoomed);
  } else if (hit) {
    if (phoneZoomed) setPhoneZoom(false);
    selectFocus(hit.object.userData.focusKey);
  }
});

const resize = () => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  phone.position.set(width < 600 ? -0.9 : 2.55, 0.2, width < 600 ? 1.45 : 1.4);
  camera.aspect = width / height;
  camera.fov = phoneZoomed ? width < 600 ? 38 : 30 : width < 600 ? 64 : width < 900 ? 39 : 36;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2));
  renderer.setSize(width, height, false);
  if (phoneZoomed) {
    const screenCenter = phone.localToWorld(new THREE.Vector3(0, 1.18, 0));
    const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(phone.quaternion).normalize();
    desiredTarget.copy(screenCenter);
    desiredPosition.copy(screenCenter).addScaledVector(screenNormal, width < 600 ? 3 : 3.5);
    camera.position.copy(desiredPosition);
    controls.target.copy(desiredTarget);
  }
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
  if (!reducedMotion.matches) reporter.rotation.y = Math.PI / 2 + Math.sin(elapsed * 0.35) * 0.018;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

status.textContent = '拖动校园现场，开始探索';
stage.classList.add('is-ready');
animate();
