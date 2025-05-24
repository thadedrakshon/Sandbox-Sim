import * as THREE from 'three';
import { TerrainGenerator } from './systems/TerrainGenerator.js';
import { GameManager } from './systems/GameManager.js';
import { Player } from './entities/Player.js';
import { NPCManager } from './systems/NPCManager.js';
import { FactionManager } from './systems/FactionManager.js';
import { BuildingSystem } from './systems/BuildingSystem.js';
import { UIManager } from './systems/UIManager.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 100, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const terrainGenerator = new TerrainGenerator(scene, {
  mapWidth: 256,
  mapHeight: 256,
  noiseScale: 20,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2,
  seed: 42,
  heightMultiplier: 10
});

const factionManager = new FactionManager();
const buildingSystem = new BuildingSystem(scene, terrainGenerator);
const player = new Player(scene, camera, terrainGenerator);
const npcManager = new NPCManager(scene, terrainGenerator, factionManager);
const uiManager = new UIManager();

const gameManager = new GameManager({
  scene,
  camera,
  renderer,
  player,
  terrainGenerator,
  npcManager,
  factionManager,
  buildingSystem,
  uiManager
});

terrainGenerator.generateTerrain();
gameManager.init();

function animate() {
  requestAnimationFrame(animate);
  gameManager.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
