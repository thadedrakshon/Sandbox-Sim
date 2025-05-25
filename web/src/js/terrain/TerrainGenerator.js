import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.size = 100;
    this.resolution = 128;
    this.heightScale = 5;
    
    this.generateTerrain();
  }
  
  generateTerrain() {
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.resolution,
      this.resolution
    );
    
    // Generate height map
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = this.getHeightAt(x, z);
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a7e4f,
      roughness: 0.8,
      metalness: 0.2,
      flatShading: false
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.position.y = -2; // Lower the terrain slightly
    this.terrain.receiveShadow = true;
    this.scene.add(this.terrain);
  }
  
  getHeightAt(x, z) {
    // More interesting terrain generation
    const scale = 0.1;
    const height = (
      Math.sin(x * scale) * Math.cos(z * scale) +
      Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 0.5
    ) * this.heightScale;
    return height;
  }
} 