import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.size = 100;
    this.resolution = 1; // Flat plane, no subdivisions needed
    this.generateTerrain();
  }
  
  generateTerrain() {
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
    
    // Simple green material for grass
    const material = new THREE.MeshStandardMaterial({
      color: 0x4CAF50, // Nice green color
      roughness: 0.8,
      metalness: 0.2,
      flatShading: false,
      side: THREE.DoubleSide // Make sure both sides are visible
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.position.y = 0; // Position at ground level
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
  }
  
  getHeightAt(x, z) {
    // Flat terrain at ground level
    return 0;
  }
} 