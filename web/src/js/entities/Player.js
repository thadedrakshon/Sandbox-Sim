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
    
    this.targetPosition = null;
    this.targetEnemy = null;
    this.mouseDown = false;
    this.lastMouseX = 0;
    
    // Animation properties
    this.isWalking = false;
    this.walkCycle = 0;
    this.walkSpeed = 10;
    this.legAngle = 0;
    this.armAngle = 0;
    
    this._init();
  }
  
  _init() {
    // Create humanoid model
    this.model = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 1.2;
    this.body.castShadow = true;
    this.model.add(this.body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    this.head = new THREE.Mesh(headGeometry, headMaterial);
    this.head.position.y = 1.8;
    this.head.castShadow = true;
    this.model.add(this.head);
    
    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 4, 8);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x2196F3 });
    
    this.leftArm = new THREE.Mesh(armGeometry, armMaterial);
    this.leftArm.position.set(-0.4, 1.2, 0);
    this.leftArm.castShadow = true;
    this.model.add(this.leftArm);
    
    this.rightArm = new THREE.Mesh(armGeometry, armMaterial);
    this.rightArm.position.set(0.4, 1.2, 0);
    this.rightArm.castShadow = true;
    this.model.add(this.rightArm);
    
    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.12, 0.5, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1565C0 });
    
    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.leftLeg.position.set(-0.2, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.model.add(this.leftLeg);
    
    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    this.rightLeg.position.set(0.2, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.model.add(this.rightLeg);
    
    this.scene.add(this.model);
    
    // Set initial position
    this.model.position.set(0, 0, 0);
    const terrainHeight = this.terrainGenerator.getHeightAt(0, 0);
    this.model.position.y = terrainHeight;
    
    // Create target indicator
    const targetGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
    const targetMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    this.targetIndicator = new THREE.Mesh(targetGeometry, targetMaterial);
    this.targetIndicator.rotation.x = -Math.PI / 2;
    this.targetIndicator.visible = false;
    this.scene.add(this.targetIndicator);
    
    document.addEventListener('mousedown', this._onMouseDown.bind(this));
    document.addEventListener('mouseup', this._onMouseUp.bind(this));
    document.addEventListener('mousemove', this._onMouseMove.bind(this));
    document.addEventListener('wheel', this._onMouseWheel.bind(this));
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    this._updateCameraPosition();
  }
  
  _updateWalkingAnimation(delta) {
    if (this.isWalking) {
      this.walkCycle += delta * this.walkSpeed;
      
      // Leg animation
      this.legAngle = Math.sin(this.walkCycle) * 0.5;
      this.leftLeg.rotation.x = this.legAngle;
      this.rightLeg.rotation.x = -this.legAngle;
      
      // Arm animation (opposite to legs)
      this.armAngle = Math.sin(this.walkCycle) * 0.3;
      this.leftArm.rotation.x = -this.armAngle;
      this.rightArm.rotation.x = this.armAngle;
      
      // Slight body bounce
      this.body.position.y = 1.2 + Math.abs(Math.sin(this.walkCycle)) * 0.1;
      this.head.position.y = 1.8 + Math.abs(Math.sin(this.walkCycle)) * 0.1;
    } else {
      // Reset to idle position
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = 0;
      this.rightArm.rotation.x = 0;
      this.body.position.y = 1.2;
      this.head.position.y = 1.8;
    }
  }
  
  _onMouseDown(event) {
    if (event.button === 0) { // Left click
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children);
      
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        
        // Check if we clicked an enemy
        if (hitObject.userData.isEnemy) {
          this.targetEnemy = hitObject.userData.entity;
          this.targetPosition = new THREE.Vector3(
            hitObject.position.x,
            0,
            hitObject.position.z
          );
          this.targetIndicator.material.color.set(0xff0000); // Red for enemy target
        } else {
          // Regular terrain click
          this.targetEnemy = null;
          const hitPoint = intersects[0].point;
          this.targetPosition = new THREE.Vector3(hitPoint.x, 0, hitPoint.z);
          this.targetIndicator.material.color.set(0x00ff00); // Green for movement target
        }
        
        // Show and position target indicator
        this.targetIndicator.position.copy(this.targetPosition);
        this.targetIndicator.position.y = 0.1; // Slightly above ground
        this.targetIndicator.visible = true;
        
        // Animate target indicator
        this._animateTargetIndicator();
      }
    } else if (event.button === 2) { // Right click
      this.mouseDown = true;
      this.lastMouseX = event.clientX;
    }
  }
  
  _animateTargetIndicator() {
    const duration = 1000; // 1 second
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale and fade animation
      const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
      this.targetIndicator.scale.set(scale, scale, scale);
      this.targetIndicator.material.opacity = 0.5 * (1 - progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.targetIndicator.visible = false;
        this.targetIndicator.scale.set(1, 1, 1);
        this.targetIndicator.material.opacity = 0.5;
      }
    };
    
    animate();
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
    if (this.targetEnemy) {
      // Update target position to follow enemy
      this.targetPosition = new THREE.Vector3(
        this.targetEnemy.model.position.x,
        0,
        this.targetEnemy.model.position.z
      );
      
      // Check if enemy is dead
      if (this.targetEnemy.health <= 0) {
        this.targetEnemy = null;
        this.targetPosition = null;
        this.targetIndicator.visible = false;
        this.isWalking = false;
        return;
      }
    }
    
    if (this.targetPosition) {
      const direction = new THREE.Vector3()
        .subVectors(this.targetPosition, this.model.position)
        .normalize();
      
      const moveVector = direction.multiplyScalar(this.moveSpeed * delta);
      
      // Calculate distance to target
      const distanceToTarget = this.model.position.distanceTo(this.targetPosition);
      
      // If targeting an enemy, stop at attack range
      if (this.targetEnemy && distanceToTarget <= this.attackRange) {
        this.isWalking = false;
        this.attack();
      } else {
        // Only move if we're not at the target position
        if (distanceToTarget > 0.1) {
          this.model.position.add(moveVector);
          this.isWalking = true;
        } else {
          this.isWalking = false;
          if (!this.targetEnemy) {
            this.targetPosition = null;
            this.targetIndicator.visible = false;
          }
        }
      }
      
      // Update rotation to face movement direction
      if (moveVector.length() > 0) {
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        this.model.rotation.y = targetRotation;
      }
      
      if (this.terrainGenerator) {
        const terrainHeight = this.terrainGenerator.getHeightAt(
          this.model.position.x,
          this.model.position.z
        );
        this.model.position.y = terrainHeight;
      }
    }
    
    // Update walking animation
    this._updateWalkingAnimation(delta);
    
    this._updateCameraPosition();
  }
  
  attack() {
    const now = performance.now() / 1000;
    if (now - this.lastAttackTime < this.attackCooldown) return;
    
    this.lastAttackTime = now;
    
    // Attack animation
    const originalArmRotation = this.rightArm.rotation.x;
    this.rightArm.rotation.x = -Math.PI / 2;
    
    setTimeout(() => {
      this.rightArm.rotation.x = originalArmRotation;
    }, 200);
    
    if (this.targetEnemy) {
      this.targetEnemy.takeDamage(this.attackDamage);
    }
  }
  
  toggleBuildingMode() {
    console.log("Building mode toggled");
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    
    // Update health bar
    const healthFill = document.getElementById('health-fill');
    if (healthFill) {
      const healthPercent = (this.health / this.maxHealth) * 100;
      healthFill.style.width = `${healthPercent}%`;
      
      if (healthPercent < 25) {
        healthFill.style.backgroundColor = '#F44336'; // Red
      } else if (healthPercent < 50) {
        healthFill.style.backgroundColor = '#FFC107'; // Yellow
      } else {
        healthFill.style.backgroundColor = '#4CAF50'; // Green
      }
    }
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    console.log("Player died");
    // Add death animation
    this.model.rotation.x = Math.PI / 2; // Fall forward
    this.isWalking = false;
  }
}
