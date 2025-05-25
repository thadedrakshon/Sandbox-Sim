export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    this.terrain = new TerrainGenerator(this.scene);
    this.player = new Player(this.scene, this.terrain);
    this.uiManager = new UIManager();
    this.uiManager.setCamera(this.camera);
    
    this.npcs = [];
    this.spawnNPCs();
    
    this.setupLights();
    this.setupEventListeners();
    this.animate();
  }
  
  spawnNPCs() {
    // Spawn yellow faction NPCs
    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
      );
      const npc = new NPC(this.scene, this.terrain, position, 'yellow', this.uiManager);
      this.npcs.push(npc);
    }
    
    // Spawn green faction NPCs
    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
      );
      const npc = new NPC(this.scene, this.terrain, position, 'green', this.uiManager);
      this.npcs.push(npc);
    }
  }
  
  // ... rest of the existing methods ...
} 