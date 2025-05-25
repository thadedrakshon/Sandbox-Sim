import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    this.size = 100;
    this.resolution = 128;
    this.heightScale = 0; // Flat terrain
    this.generateTerrain();
  }
  
  generateTerrain() {
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.resolution,
      this.resolution
    );
    
    // Flat terrain: set all heights to 0
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 1] = 0;
    }
    
    geometry.computeVertexNormals();
    
    // Load grass texture
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('./textures/grass.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Use white to show texture
      map: grassTexture,
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
    // Flat terrain
    return 0;
  }
} 