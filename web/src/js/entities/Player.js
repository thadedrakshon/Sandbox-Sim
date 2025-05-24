import * as THREE from 'three';
import { ThirdPersonControls } from '../utils/ThirdPersonControls.js';

export class Player {
  constructor(scene, camera, terrainGenerator) {
    this.scene = scene;
    this.camera = camera;
    this.terrainGenerator = terrainGenerator;
    
    this.moveSpeed = 5.0;
    this.health = 100;
    this.maxHealth = 100;
    this.attackDamage = 10;
    this.attackRange = 2;
    this.attackCooldown = 1;
    this.lastAttackTime = 0;
    
    this._init();
  }
  
  _init() {
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = true;
    this.scene.add(this.model);
    
    this.controls = new ThirdPersonControls(
      this.camera,
      this.model,
      document.getElementById('game-container')
    );
    
    this.model.position.set(0, 2, 0);
    
    document.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Left click
        this.attack();
      }
    });
    
    document.addEventListener('keydown', (event) => {
      if (event.code === 'KeyB') {
        this.toggleBuildingMode();
      }
    });
  }
  
  update(delta) {
    this.controls.update(delta, this.terrainGenerator);
    
  }
  
  attack() {
    const now = performance.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) return;
    
    this.lastAttackTime = now;
    
    const originalColor = this.model.material.color.clone();
    this.model.material.color.set(0xFF0000); // Flash red
    
    const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 1.5);
    const weaponMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    
    weapon.position.copy(this.model.position);
    weapon.position.y += 0.5;
    
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.model.rotation.y);
    weapon.lookAt(this.model.position.clone().add(forward));
    
    this.scene.add(weapon);
    
    const swingAnimation = () => {
      weapon.rotation.x += 0.2;
      if (weapon.rotation.x < Math.PI) {
        requestAnimationFrame(swingAnimation);
      } else {
        this.scene.remove(weapon);
        this.model.material.color.copy(originalColor);
      }
    };
    
    swingAnimation();
    
    const raycaster = new THREE.Raycaster();
    const rayOrigin = this.model.position.clone();
    rayOrigin.y += 1; // Adjust to weapon height
    
    const rayDirection = new THREE.Vector3(0, 0, 1);
    rayDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.model.rotation.y);
    
    raycaster.set(rayOrigin, rayDirection);
    
    const hits = raycaster.intersectObjects(this.scene.children, true);
    
    for (const hit of hits) {
      if (hit.distance <= this.attackRange && hit.object.userData.isEnemy) {
        hit.object.userData.entity.takeDamage(this.attackDamage);
        break;
      }
    }
  }
  
  toggleBuildingMode() {
    console.log("Building mode toggled");
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
      healthFill.style.width = `${(this.health / this.maxHealth) * 100}%`;
    }
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    console.log("Player died");
  }
}
