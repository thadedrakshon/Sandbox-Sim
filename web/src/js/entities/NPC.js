import * as THREE from 'three';

const NPCState = {
  IDLE: 'idle',
  ROAMING: 'roaming',
  HUNGRY: 'hungry',
  SEARCHING_FOOD: 'searchingFood',
  EATING: 'eating',
  COMBAT: 'combat',
  FLEEING: 'fleeing'
};

export class NPC {
  constructor(scene, terrainGenerator, options = {}, uiManager) {
    this.scene = scene;
    this.terrainGenerator = terrainGenerator;
    
    this.position = options.position || new THREE.Vector3(0, 0, 0);
    this.faction = options.faction;
    
    this.roamingRadius = options.roamingRadius || 10;
    this.moveSpeed = options.moveSpeed || 2;
    
    this.maxHunger = options.maxHunger || 100;
    this.hungerDecreaseRate = options.hungerDecreaseRate || 2;
    this.hungerThreshold = options.hungerThreshold || 70;
    this.criticalHungerThreshold = options.criticalHungerThreshold || 90;
    this.currentHunger = 0;
    
    this.health = options.health || 100;
    this.maxHealth = options.maxHealth || 100;
    this.attackDamage = options.attackDamage || 10;
    this.attackRange = options.attackRange || 2;
    this.attackCooldown = options.attackCooldown || 1000; // 1 second
    this.lastAttackTime = 0;
    this.detectionRadius = options.detectionRadius || 10;
    
    this.currentState = NPCState.IDLE;
    this.targetEnemy = null;
    this.targetPosition = null;
    this.targetFood = null;
    this.stateTime = 0;
    
    this.uiManager = uiManager;
    
    this._init();
  }
  
  _init() {
    // Create humanoid model
    this.model = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: this.faction === 'yellow' ? 0xffff00 : 0x00ff00 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    this.model.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: this.faction === 'yellow' ? 0xffff00 : 0x00ff00 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    this.model.add(head);
    
    // Arms
    const armGeometry = new THREE.CapsuleGeometry(0.2, 0.8, 4, 8);
    const armMaterial = new THREE.MeshPhongMaterial({ 
      color: this.faction === 'yellow' ? 0xffff00 : 0x00ff00 
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 1.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    this.model.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 1.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    this.model.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ 
      color: this.faction === 'yellow' ? 0xffff00 : 0x00ff00 
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0.4, 0);
    this.model.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0.4, 0);
    this.model.add(rightLeg);
    
    this.model.userData = { entity: this, isEnemy: true };
    this.scene.add(this.model);
    
    this.model.position.copy(this.position);
    this.model.position.y = this.terrainGenerator.getHeightAt(this.position.x, this.position.z) + 1;
    
    // Create health bar
    this.uiManager.createNPCHealthBar(this);
  }
  
  update(delta) {
    this.currentHunger += this.hungerDecreaseRate * delta / 60;
    this.currentHunger = Math.min(this.currentHunger, this.maxHunger);
    
    this.stateTime += delta;
    
    if (this.currentState !== NPCState.COMBAT && this.currentState !== NPCState.FLEEING) {
      this.checkForEnemies();
    }
    
    switch (this.currentState) {
      case NPCState.IDLE:
        this.updateIdleState();
        break;
      case NPCState.ROAMING:
        this.updateRoamingState(delta);
        break;
      case NPCState.HUNGRY:
        this.updateHungryState();
        break;
      case NPCState.SEARCHING_FOOD:
        this.updateSearchingFoodState(delta);
        break;
      case NPCState.EATING:
        this.updateEatingState();
        break;
      case NPCState.COMBAT:
        this.updateCombatState(delta);
        break;
      case NPCState.FLEEING:
        this.updateFleeingState(delta);
        break;
    }
    
    const terrainHeight = this.terrainGenerator.getHeightAt(this.position.x, this.position.z);
    this.model.position.copy(this.position);
    this.model.position.y = terrainHeight + 1;
    
    // Update health bar
    this.uiManager.updateNPCHealthBar(this, this.health, this.maxHealth);
  }
  
  updateIdleState() {
    if (this.stateTime >= 2) {
      if (this.currentHunger >= this.hungerThreshold) {
        this.changeState(NPCState.HUNGRY);
      } else {
        this.changeState(NPCState.ROAMING);
      }
    }
  }
  
  updateRoamingState(delta) {
    if (!this.targetPosition) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.roamingRadius;
      const targetX = this.position.x + Math.cos(angle) * radius;
      const targetZ = this.position.z + Math.sin(angle) * radius;
      this.targetPosition = new THREE.Vector3(targetX, 0, targetZ);
    }
    
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, this.position)
      .normalize();
    
    direction.y = 0;
    
    if (direction.length() > 0.1) {
      this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
      
      this.model.lookAt(this.model.position.clone().add(direction));
    }
    
    const distanceToTarget = this.position.distanceTo(this.targetPosition);
    if (distanceToTarget < 1) {
      this.targetPosition = null;
      this.stateTime = 0;
      
      if (Math.random() < 0.5) {
        this.changeState(NPCState.IDLE);
      }
    }
    
    if (this.currentHunger >= this.hungerThreshold) {
      this.changeState(NPCState.HUNGRY);
    }
  }
  
  updateHungryState() {
    if (this.currentHunger >= this.criticalHungerThreshold) {
      this.changeState(NPCState.SEARCHING_FOOD);
    } else {
      const hungerPriority = (this.currentHunger - this.hungerThreshold) / 
        (this.criticalHungerThreshold - this.hungerThreshold);
      
      if (Math.random() < hungerPriority) {
        this.changeState(NPCState.SEARCHING_FOOD);
      } else {
        this.changeState(NPCState.ROAMING);
      }
    }
  }
  
  updateSearchingFoodState(delta) {
    if (!this.targetFood) {
      this.changeState(NPCState.ROAMING);
      return;
    }
    
    const direction = new THREE.Vector3()
      .subVectors(this.targetFood.position, this.position)
      .normalize();
    
    this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    
    const distanceToFood = this.position.distanceTo(this.targetFood.position);
    if (distanceToFood < 1) {
      this.changeState(NPCState.EATING);
    }
  }
  
  updateEatingState() {
    if (this.stateTime >= 3) {
      this.currentHunger = Math.max(0, this.currentHunger - 50);
      
      
      this.changeState(NPCState.ROAMING);
    }
  }
  
  updateCombatState(delta) {
    if (!this.targetEnemy) {
      this.changeState(NPCState.ROAMING);
      return;
    }
    
    const direction = new THREE.Vector3()
      .subVectors(this.targetEnemy.position, this.position)
      .normalize();
    
    const distanceToEnemy = this.position.distanceTo(this.targetEnemy.position);
    
    if (distanceToEnemy > this.attackRange) {
      this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    } else {
      const now = performance.now() / 1000;
      if (now - this.lastAttackTime >= this.attackCooldown) {
        this.attack(this.targetEnemy);
        this.lastAttackTime = now;
      }
    }
    
    this.model.lookAt(this.targetEnemy.position);
    
    if (this.shouldFlee()) {
      this.changeState(NPCState.FLEEING);
    }
  }
  
  updateFleeingState(delta) {
    if (!this.targetEnemy) {
      this.changeState(NPCState.ROAMING);
      return;
    }
    
    const direction = new THREE.Vector3()
      .subVectors(this.position, this.targetEnemy.position)
      .normalize();
    
    this.position.add(direction.multiplyScalar(this.moveSpeed * 1.5 * delta));
    
    if (this.stateTime >= 5) {
      this.changeState(NPCState.ROAMING);
    }
  }
  
  changeState(newState) {
    this.currentState = newState;
    this.stateTime = 0;
    
    if (newState === NPCState.ROAMING) {
      this.targetPosition = null;
    } else if (newState === NPCState.SEARCHING_FOOD) {
      this.targetFood = null;
    }
  }
  
  checkForEnemies() {
  }
  
  attack(target) {
    if (target && target.takeDamage) {
      target.takeDamage(this.attackDamage);
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.scene.remove(this.model);
    this.uiManager.removeNPCHealthBar(this);
  }
  
  shouldFlee() {
    return this.health < this.maxHealth * 0.2; // Flee at 20% health
  }
}
