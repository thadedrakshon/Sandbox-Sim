import * as THREE from 'three';

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
    
    this.cameraDistance = 10;
    this.cameraHeight = 5;
    this.cameraRotation = 0;
    this.minDistance = 2;
    this.maxDistance = 20;
    
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    this.mouseDown = false;
    this.lastMouseX = 0;
    
    this._init();
  }
  
  _init() {
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
    this.model = new THREE.Mesh(geometry, material);
    this.model.castShadow = true;
    this.scene.add(this.model);
    
    this.model.position.set(0, 2, 0);
    
    document.addEventListener('keydown', this._onKeyDown.bind(this));
    document.addEventListener('keyup', this._onKeyUp.bind(this));
    document.addEventListener('mousedown', this._onMouseDown.bind(this));
    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('mousemove', this._onMouseMove.bind(this));
    document.addEventListener('wheel', this._onMouseWheel.bind(this));
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    this._updateCameraPosition();
  }
  
  _onKeyDown(event) {
    switch(event.code) {
      case 'KeyW': this.keys.forward = true; break;
      case 'KeyA': this.keys.left = true; break;
      case 'KeyS': this.keys.backward = true; break;
      case 'KeyD': this.keys.right = true; break;
      case 'KeyB': this.toggleBuildingMode(); break;
    }
  }
  
  _onKeyUp(event) {
    switch(event.code) {
      case 'KeyW': this.keys.forward = false; break;
      case 'KeyA': this.keys.left = false; break;
      case 'KeyS': this.keys.backward = false; break;
      case 'KeyD': this.keys.right = false; break;
    }
  }
  
  _onMouseDown(event) {
    if (event.button === 0) { // Left click
      this.attack();
    } else if (event.button === 2) { // Right click
      this.mouseDown = true;
      this.lastMouseX = event.clientX;
    }
  }
  
  _onMouseUp(event) {
    if (event.button === 2) { // Right click
      this.mouseDown = false;
    }
  }
  
  _onMouseMove(event) {
    if (this.mouseDown) {
      const deltaX = event.clientX - this.lastMouseX;
      this.cameraRotation += deltaX * 0.01;
      this.lastMouseX = event.clientX;
    }
  }
  
  _onMouseWheel(event) {
    const delta = Math.sign(event.deltaY);
    this.cameraDistance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.cameraDistance + delta)
    );
  }
  
  _updateCameraPosition() {
    const x = this.model.position.x + this.cameraDistance * Math.sin(this.cameraRotation);
    const y = this.model.position.y + this.cameraHeight;
    const z = this.model.position.z + this.cameraDistance * Math.cos(this.cameraRotation);
    
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.model.position);
  }
  
  update(delta) {
    const moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    const moveZ = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
    
    if (moveX !== 0 || moveZ !== 0) {
      const angle = this.cameraRotation;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      
      const moveVector = new THREE.Vector3(
        moveX * cos - moveZ * sin,
        0,
        moveX * sin + moveZ * cos
      ).normalize().multiplyScalar(this.moveSpeed * delta);
      
      this.model.position.add(moveVector);
      
      if (moveVector.length() > 0) {
        this.model.rotation.y = Math.atan2(moveVector.x, moveVector.z);
      }
      
      if (this.terrainGenerator) {
        const terrainHeight = this.terrainGenerator.getHeightAt(
          this.model.position.x,
          this.model.position.z
        );
        this.model.position.y = terrainHeight + 1; // 1 unit above terrain
      }
    }
    
    this._updateCameraPosition();
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
