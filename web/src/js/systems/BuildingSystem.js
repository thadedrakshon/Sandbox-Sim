import * as THREE from 'three';

export class BuildingSystem {
  constructor(scene, terrainGenerator) {
    this.scene = scene;
    this.terrainGenerator = terrainGenerator;
    
    this.gridSize = 1;
    this.isActive = false;
    this.currentBuilding = null;
    this.buildingPreview = null;
    
    this._init();
  }
  
  _init() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      transparent: true,
      opacity: 0.5
    });
    
    this.buildingPreview = new THREE.Mesh(geometry, material);
    this.buildingPreview.visible = false;
    this.scene.add(this.buildingPreview);
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    document.addEventListener('mousemove', (event) => {
      if (!this.isActive) return;
      
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    document.addEventListener('click', (event) => {
      if (!this.isActive || event.button !== 0) return;
      
      this.placeBuilding();
    });
  }
  
  update(camera) {
    if (!this.isActive || !this.buildingPreview) return;
    
    this.raycaster.setFromCamera(this.mouse, camera);
    
    const intersects = this.raycaster.intersectObject(this.terrainGenerator.terrain);
    
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      
      const snappedX = Math.floor(intersectionPoint.x / this.gridSize) * this.gridSize;
      const snappedZ = Math.floor(intersectionPoint.z / this.gridSize) * this.gridSize;
      
      const terrainHeight = this.terrainGenerator.getHeightAt(snappedX, snappedZ);
      
      this.buildingPreview.position.set(snappedX, terrainHeight + 1, snappedZ);
      
      const isValid = this.isPlacementValid(snappedX, terrainHeight, snappedZ);
      
      this.buildingPreview.material.color.set(isValid ? 0x4CAF50 : 0xFF5252);
    }
  }
  
  toggleBuildingMode() {
    this.isActive = !this.isActive;
    this.buildingPreview.visible = this.isActive;
  }
  
  selectBuildingType(type) {
    this.currentBuilding = type;
    
  }
  
  placeBuilding() {
    if (!this.isActive || !this.buildingPreview) return;
    
    const position = this.buildingPreview.position.clone();
    
    if (!this.isPlacementValid(position.x, position.y, position.z)) {
      return;
    }
    
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const building = new THREE.Mesh(geometry, material);
    
    building.position.copy(position);
    building.castShadow = true;
    building.receiveShadow = true;
    
    building.userData = {
      type: this.currentBuilding || 'outpost',
      health: 100,
      isBuilding: true
    };
    
    this.scene.add(building);
  }
  
  isPlacementValid(x, y, z) {
    
    const collisionBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(2, 2, 2)
    );
    
    for (const object of this.scene.children) {
      if (object.userData && object.userData.isBuilding) {
        const objectBox = new THREE.Box3().setFromObject(object);
        
        if (collisionBox.intersectsBox(objectBox)) {
          return false;
        }
      }
    }
    
    return true;
  }
}
