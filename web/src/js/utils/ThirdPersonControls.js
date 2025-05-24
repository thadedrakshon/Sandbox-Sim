import * as THREE from 'three';

export class ThirdPersonControls {
  constructor(camera, target, domElement) {
    this.camera = camera;
    this.target = target; // The object to follow (player model)
    this.domElement = domElement;
    
    this.distance = 10; // Distance from target
    this.minDistance = 2;
    this.maxDistance = 20;
    this.height = 5; // Height above target
    this.minHeight = 1;
    this.maxHeight = 15;
    
    this.rotationSpeed = 0.002;
    this.autoRotate = false;
    this.autoRotateSpeed = 0.5;
    
    this.phi = Math.PI; // Horizontal angle - start behind player
    this.theta = Math.PI / 4; // Vertical angle
    this.minTheta = 0.1;
    this.maxTheta = Math.PI / 2 - 0.1;
    
    this._updateCameraPosition();
    
    this.moveSpeed = 5.0;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    
    this._initListeners();
  }
  
  _initListeners() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('wheel', this._onMouseWheel);
    document.addEventListener('contextmenu', this._onContextMenu);
    
    this.domElement.addEventListener('mousedown', (event) => {
      if (event.button === 2) { // Right mouse button
        this.domElement.requestPointerLock();
      }
    });
  }
  
  _updateCameraPosition() {
    const x = this.distance * Math.sin(this.theta) * Math.sin(this.phi);
    const y = this.distance * Math.cos(this.theta);
    const z = this.distance * Math.sin(this.theta) * Math.cos(this.phi);
    
    console.log('ThirdPersonControls: Updating camera position', {
      targetPosition: this.target.position,
      cameraOffset: { x, y, z },
      newCameraPosition: {
        x: this.target.position.x + x,
        y: this.target.position.y + y,
        z: this.target.position.z + z
      }
    });
    
    this.camera.position.set(
      this.target.position.x + x,
      this.target.position.y + y,
      this.target.position.z + z
    );
    
    this.camera.lookAt(this.target.position);
  }
  
  _onKeyDown(event) {
    switch(event.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyD': this.moveRight = true; break;
    }
  }
  
  _onKeyUp(event) {
    switch(event.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyD': this.moveRight = false; break;
    }
  }
  
  _onMouseMove(event) {
    if (document.pointerLockElement === this.domElement) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      this.phi -= movementX * this.rotationSpeed;
      this.theta = Math.max(this.minTheta, Math.min(this.maxTheta, this.theta + movementY * this.rotationSpeed));
    }
  }
  
  _onMouseWheel(event) {
    const delta = -Math.sign(event.deltaY);
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance - delta));
  }
  
  _onContextMenu(event) {
    event.preventDefault();
  }
  
  update(delta = 0.016, terrainGenerator = null) {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;
    
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();
    
    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * this.moveSpeed * delta;
    }
    
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * this.moveSpeed * delta;
    }
    
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3(1, 0, 0);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
    right.y = 0;
    right.normalize();
    
    forward.multiplyScalar(this.velocity.z * delta);
    right.multiplyScalar(this.velocity.x * delta);
    
    this.target.position.add(forward);
    this.target.position.add(right);
    
    if (terrainGenerator) {
      const terrainHeight = terrainGenerator.getHeightAt(this.target.position.x, this.target.position.z);
      this.target.position.y = terrainHeight + 1; // 1 unit above terrain
    }
    
    if (this.velocity.x !== 0 || this.velocity.z !== 0) {
      const angle = Math.atan2(-this.velocity.x, -this.velocity.z);
      this.target.rotation.y = angle;
    }
    
    if (terrainGenerator) {
      const targetTerrainHeight = terrainGenerator.getHeightAt(
        this.target.position.x, 
        this.target.position.z
      );
      
      if (this.camera.position.y < targetTerrainHeight + 1) {
        this.camera.position.y = targetTerrainHeight + 1;
      }
    }
    
    this._updateCameraPosition();
  }
  
  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('wheel', this._onMouseWheel);
    document.removeEventListener('contextmenu', this._onContextMenu);
  }
}
