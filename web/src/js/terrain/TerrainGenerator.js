import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.size = 200; // Make it much larger
    this.resolution = 1; // Flat plane, no subdivisions needed
    console.log('TerrainGenerator: Starting terrain generation...');
    this.generateTerrain();
  }
  
  generateTerrain() {
    console.log('TerrainGenerator: Creating plane geometry with size:', this.size);
    
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.resolution,
      this.resolution
    );
    
    // All heights are 0 for a flat plane
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 1] = 0;
    }
    
    geometry.computeVertexNormals();
    
    // Simple green material for grass - make it brighter
    const material = new THREE.MeshStandardMaterial({
      color: 0x00FF00, // Bright green for visibility
      roughness: 0.8,
      metalness: 0.2,
      flatShading: false,
      side: THREE.DoubleSide // Make sure both sides are visible
    });
    
    console.log('TerrainGenerator: Creating terrain mesh...');
    this.terrain = new THREE.Mesh(geometry, material);
    
    // Rotate to make it horizontal (lying flat)
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.position.set(0, -1, 0); // Position slightly below origin
    this.terrain.receiveShadow = true;
    this.terrain.userData = { isTerrain: true }; // Mark as terrain for raycasting
    
    console.log('TerrainGenerator: Terrain rotation:', this.terrain.rotation);
    console.log('TerrainGenerator: Terrain position:', this.terrain.position);
    console.log('TerrainGenerator: Terrain scale:', this.terrain.scale);
    console.log('TerrainGenerator: Adding terrain to scene...');
    
    this.scene.add(this.terrain);
    
    console.log('TerrainGenerator: Terrain added successfully. Scene children count:', this.scene.children.length);
    console.log('TerrainGenerator: Terrain bounding box:', this.terrain.geometry.boundingBox);
  }
  
  getHeightAt(x, z) {
    // Flat terrain at y = -1
    return -1;
  }
} 