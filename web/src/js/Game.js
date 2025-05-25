import * as THREE from 'three';
import { Player } from './entities/Player.js';
import { NPC } from './entities/NPC.js';
import { TerrainGenerator } from './terrain/TerrainGenerator.js';
import { UIManager } from './systems/UIManager.js';

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Black background to see terrain
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 20, 20); // Position camera higher and further back
    this.camera.lookAt(0, 0, 0); // Look at the center of the scene
    console.log('Game: Camera positioned at:', this.camera.position);
    console.log('Game: Camera looking at origin (0,0,0)');
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    this.terrain = new TerrainGenerator(this.scene);
    this.player = new Player(this.scene, this.camera, this.terrain);
    this.uiManager = new UIManager();
    this.uiManager.setCamera(this.camera);
    
    this.npcs = [];
    this.spawnNPCs();
    
    this.setupLights();
    this.setupEventListeners();
    this.animate();
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const delta = 1/60; // Fixed time step for now
    
    this.player.update(delta);
    
    for (const npc of this.npcs) {
      npc.update(delta, this.player);
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  spawnNPCs() {
    // Spawn yellow faction NPCs
    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
      );
      const npc = new NPC(this.scene, this.terrain, { position, faction: 'yellow' }, this.uiManager);
      this.npcs.push(npc);
    }
    
    // Spawn green faction NPCs
    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
      );
      const npc = new NPC(this.scene, this.terrain, { position, faction: 'green' }, this.uiManager);
      this.npcs.push(npc);
    }
  }
} 