export class GameManager {
  constructor(options) {
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.player = options.player;
    this.terrainGenerator = options.terrainGenerator;
    this.npcManager = options.npcManager;
    this.factionManager = options.factionManager;
    this.buildingSystem = options.buildingSystem;
    this.uiManager = options.uiManager;
    
    this.lastTime = 0;
    this.isPaused = false;
  }
  
  init() {
    this.npcManager.init();
    
    const playerFaction = this.factionManager.getFactions()[0];
    this.factionManager.registerEntityToFaction(this.player, playerFaction);
    
    this.uiManager.updateFactionInfo(playerFaction.name);
  }
  
  update() {
    if (this.isPaused) return;
    
    const now = performance.now() / 1000;
    const delta = Math.min(now - this.lastTime, 0.1); // Cap delta at 0.1s
    this.lastTime = now;
    
    this.player.update(delta);
    this.npcManager.update(delta);
    this.buildingSystem.update(this.camera);
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
  }
  
  spawnFoodSources(count) {
  }
}
