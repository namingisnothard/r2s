import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { branchColors, type LandscapeNode } from './tree-layout';

export type SceneState = { active: Set<string>; selected: string; path: Set<string>; labels: Map<string, string> };
export type TreeScene = { update: (state: SceneState) => void; reset: () => void; focus: (id: string) => void; zoom: (factor: number) => void; dispose: () => void };

export function createTreeScene(host: HTMLElement, nodes: LandscapeNode[], pick: (id: string) => void, fail: () => void): TreeScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1718');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D research tree');
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.tabIndex = 0;
  host.appendChild(renderer.domElement);
  const overlay = document.createElement('div');
  overlay.className = 'tree-label-layer';
  host.appendChild(overlay);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 600);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .12;
  controls.minDistance = 12;
  controls.maxDistance = 260;
  controls.maxPolarAngle = Math.PI * .88;
  controls.listenToKeyEvents(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(20, 60, 40);
  scene.add(light);
  const floor = new THREE.GridHelper(120, 24, '#29413d', '#172b2b');
  floor.position.y = -20;
  scene.add(floor);
  const sphere = new THREE.SphereGeometry(1, 16, 12);
  const decision = new THREE.OctahedronGeometry(.7);
  const meshes = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>();
  const edges = new Map<string, THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>>();
  const labels = new Map<string, HTMLButtonElement>();
  const positions = new Map(nodes.map(node => [node.id, new THREE.Vector3(...node.position)]));
  let state: SceneState = { active: new Set(nodes.map(n => n.id)), selected: '', path: new Set(), labels: new Map() };
  let hover = '';
  let dirty = true;
  let disposed = false;
  let inView = true;
  let width = 1;
  let height = 1;
  for (const node of nodes) {
    const color = node.depth === 0 ? '#e6f4cf' : branchColors[node.sector];
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .28, roughness: .45, metalness: .15, transparent: true });
    const mesh = new THREE.Mesh(node.data.kind === 'paper' ? sphere : decision, material);
    mesh.position.copy(positions.get(node.id)!);
    mesh.scale.setScalar(node.depth === 0 ? 1.6 : node.data.kind === 'paper' ? .85 : node.depth === 1 ? 1.5 : 1);
    mesh.userData.nodeId = node.id;
    meshes.set(node.id, mesh);
    scene.add(mesh);
    const label = document.createElement('button');
    label.type = 'button';
    label.className = `tree-node-label ${node.data.kind === 'paper' ? 'paper-label' : 'decision-label'}`;
    label.style.setProperty('--node-color', color);
    label.addEventListener('click', () => pick(node.id));
    label.addEventListener('pointerenter', () => { hover = node.id; dirty = true; });
    label.addEventListener('pointerleave', () => { hover = ''; dirty = true; });
    labels.set(node.id, label);
    overlay.appendChild(label);
    if (node.parent) {
      const parent = positions.get(node.parent)!;
      const end = positions.get(node.id)!;
      const curve = new THREE.CubicBezierCurve3(parent, parent.clone().add(new THREE.Vector3(0, (end.y - parent.y) * .6, 0)), new THREE.Vector3(end.x * .88, end.y - 3, end.z * .88), end);
      const tube = new THREE.TubeGeometry(curve, 20, node.depth === 1 ? .23 : .10, 5, false);
      const edge = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5 }));
      edges.set(node.id, edge);
      scene.add(edge);
    }
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.5, .09, 8, 40), new THREE.MeshBasicMaterial({ color: '#f1ffb4' }));
  halo.visible = false;
  scene.add(halo);
  function reset() {
    camera.position.set(78, 66, 92).multiplyScalar(Math.max(1, height / width));
    controls.target.set(0, 8, 0);
    controls.update();
    dirty = true;
  }
  function update(next: SceneState) {
    state = next;
    for (const node of nodes) {
      const active = state.active.has(node.id);
      const selected = state.selected === node.id;
      const onPath = state.path.has(node.id);
      const mesh = meshes.get(node.id)!;
      mesh.material.opacity = active ? 1 : .08;
      mesh.material.emissiveIntensity = selected ? 1.2 : onPath ? .7 : .28;
      const edge = edges.get(node.id);
      if (edge) { edge.material.opacity = onPath ? .95 : active ? .5 : .035; edge.material.color.set(onPath ? '#efffb9' : branchColors[node.sector]); }
      const label = labels.get(node.id)!;
      const labelText = state.labels.get(node.id) ?? node.id;
      if (node.data.kind === 'paper') {
        const split = labelText.lastIndexOf(' · ');
        const date = document.createElement('span');
        date.className = 'tree-label-date';
        date.textContent = labelText.slice(split + 3);
        label.replaceChildren(document.createTextNode(labelText.slice(0, split) + ' · '), date);
      } else label.textContent = labelText;
      label.setAttribute('aria-label', labelText);
      label.setAttribute('aria-pressed', String(selected));
      label.classList.toggle('selected-label', selected);
    }
    halo.visible = Boolean(state.selected && state.active.has(state.selected));
    if (halo.visible) halo.position.copy(positions.get(state.selected)!);
    dirty = true;
  }
  function positionLabels() {
    const occupied: { x: number; y: number; w: number; h: number }[] = [];
    const ordered = [...nodes].sort((a, b) => {
      const priority = (n: LandscapeNode) => n.id === state.selected ? 0 : n.id === hover ? 1 : n.depth <= 1 ? 2 : n.data.kind === 'paper' ? 3 : 4;
      return priority(a) - priority(b) || camera.position.distanceToSquared(positions.get(a.id)!) - camera.position.distanceToSquared(positions.get(b.id)!);
    });
    for (const node of ordered) {
      const el = labels.get(node.id)!;
      const emphasized = node.id === state.selected || node.id === hover;
      if (!state.active.has(node.id) || (node.data.kind === 'decision' && node.depth > 1 && !emphasized)) { el.style.display = 'none'; continue; }
      const point = positions.get(node.id)!.clone().project(camera);
      if (point.z < -1 || point.z > 1) { el.style.display = 'none'; continue; }
      const x = (point.x + 1) / 2 * width;
      const y = (-point.y + 1) / 2 * height + 13;
      el.style.display = 'block';
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const box = { x: x - w / 2, y, w, h };
      if (box.x < 2 || box.x + w > width - 2 || y < 2 || y + h > height - 2 || (!emphasized && occupied.some(b => box.x < b.x + b.w + 5 && box.x + w + 5 > b.x && y < b.y + b.h + 5 && y + h + 5 > b.y))) { el.style.display = 'none'; continue; }
      el.style.transform = `translate(${box.x}px, ${y}px)`;
      occupied.push(box);
    }
  }
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function hit(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.set((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1);
    ray.setFromCamera(mouse, camera);
    return ray.intersectObjects([...meshes.values()].filter(m => state.active.has(m.userData.nodeId)), false)[0]?.object.userData.nodeId as string | undefined;
  }
  let down: { x: number; y: number } | undefined;
  const pointers = new Set<number>();
  let multitouch = false;
  function pointerDown(event: PointerEvent) {
    pointers.add(event.pointerId);
    if (pointers.size > 1) multitouch = true;
    down = { x: event.clientX, y: event.clientY };
  }
  function pointerUp(event: PointerEvent) {
    if (!multitouch && down && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 5) { const id = hit(event); if (id) pick(id); }
    down = undefined;
    pointers.delete(event.pointerId);
    if (!pointers.size) multitouch = false;
  }
  function pointerMove(event: PointerEvent) { if (event.buttons) return; const id = hit(event) ?? ''; if (id !== hover) { hover = id; renderer.domElement.style.cursor = id ? 'pointer' : 'grab'; dirty = true; } }
  function pointerCancel() { pointers.clear(); multitouch = false; down = undefined; }
  function pointerLeave() { hover = ''; down = undefined; dirty = true; }
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerleave', pointerLeave);
  renderer.domElement.addEventListener('pointercancel', pointerCancel);
  function contextLost(event: Event) { event.preventDefault(); renderer.setAnimationLoop(null); fail(); }
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  function changed() { dirty = true; }
  controls.addEventListener('change', changed);
  const resize = new ResizeObserver(() => {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    const nextAspect = width / height;
    const framing = Math.max(1, 1 / nextAspect) / Math.max(1, 1 / camera.aspect);
    camera.position.sub(controls.target).multiplyScalar(framing).add(controls.target);
    camera.aspect = nextAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    dirty = true;
  });
  resize.observe(host);
  width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); reset();
  const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; dirty = true; });
  visibility.observe(host);
  renderer.setAnimationLoop(() => {
    if (disposed || !inView || document.hidden) return;
    controls.update();
    if (!dirty) return;
    halo.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    positionLabels();
    dirty = false;
  });
  return {
    update, reset,
    focus(id) { const point = positions.get(id); if (!point) return; const offset = camera.position.clone().sub(controls.target).normalize().multiplyScalar(48); controls.target.copy(point); camera.position.copy(point).add(offset); controls.update(); dirty = true; },
    zoom(factor) { const offset = camera.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(offset); controls.update(); dirty = true; },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); resize.disconnect(); visibility.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointermove', pointerMove); renderer.domElement.removeEventListener('pointerleave', pointerLeave); renderer.domElement.removeEventListener('pointercancel', pointerCancel); renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      sphere.dispose(); decision.dispose();
      meshes.forEach(m => m.material.dispose()); edges.forEach(e => { e.geometry.dispose(); e.material.dispose(); });
      floor.geometry.dispose(); (Array.isArray(floor.material) ? floor.material : [floor.material]).forEach(m => m.dispose()); halo.geometry.dispose(); halo.material.dispose();
      renderer.dispose(); renderer.domElement.remove(); overlay.remove();
    },
  };
}
