import * as THREE from 'three';
import { NPC } from '../entities/NPC.js';

export class NPCManager {
  constructor(scene, terrainGenerator, factionManager) {
    this.scene = scene;
    this.terrainGenerator = terrainGenerator;
    this.factionManager = factionManager;
    
    this.npcs = [];
  }
  
  init() {
    const factions = this.factionManager.getFactions();
    
    for (const faction of factions) {
      this.spawnNPCsForFaction(faction, 5); // 5 NPCs per faction
    }
  }
  
  spawnNPCsForFaction(faction, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const npc = new NPC(this.scene, this.terrainGenerator, {
        position: new THREE.Vector3(x, 0, z),
        faction: faction,
        maxHunger: 100,
        hungerDecreaseRate: 2,
        hungerThreshold: 70,
        attackDamage: 10,
        attackRange: 2,
        detectionRadius: 10
      });
      
      this.factionManager.registerEntityToFaction(npc, faction);
      this.npcs.push(npc);
    }
  }
  
  update(delta) {
    for (const npc of this.npcs) {
      npc.update(delta);
    }
  }
  
  findNearestFoodSource(position) {
    return null;
  }
  
  getNPCsInRadius(position, radius) {
    return this.npcs.filter(npc => {
      const distance = position.distanceTo(npc.position);
      return distance <= radius;
    });
  }
}
