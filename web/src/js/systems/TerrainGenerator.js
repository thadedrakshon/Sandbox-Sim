import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.mapWidth = options.mapWidth || 256;
    this.mapHeight = options.mapHeight || 256;
    this.noiseScale = options.noiseScale || 20;
    this.octaves = options.octaves || 4;
    this.persistence = options.persistence || 0.5;
    this.lacunarity = options.lacunarity || 2;
    this.seed = options.seed || 42;
    this.heightMultiplier = options.heightMultiplier || 0; // Set to 0 for completely flat terrain
    
    this.heightMap = null;
    this.terrain = null;
    
    this.textureLoader = new THREE.TextureLoader();
  }
  
  generateTerrain() {
    this.heightMap = this._generateHeightMap();
    
    const geometry = new THREE.PlaneGeometry(
      this.mapWidth, 
      this.mapHeight, 
      this.mapWidth - 1, 
      this.mapHeight - 1
    );
    
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = Math.floor((i / 3) % this.mapWidth);
      const y = Math.floor((i / 3) / this.mapWidth);
      
      if (x < this.mapWidth && y < this.mapHeight) {
        vertices[i + 2] = this.heightMap[x][y] * this.heightMultiplier;
      }
    }
    
    geometry.computeVertexNormals();
    
    const grassTexture = this.textureLoader.load('./assets/textures/grass.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20); // Repeat texture to make grid pattern visible
    
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Use white color to show texture properly
      map: grassTexture,
      flatShading: false,
      side: THREE.DoubleSide
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2; // Rotate to horizontal
    this.terrain.receiveShadow = true;
    
    this.scene.add(this.terrain);
    
    return this.terrain;
  }
  
  _generateHeightMap() {
    const heightMap = Array(this.mapWidth).fill().map(() => Array(this.mapHeight).fill(0));
    return heightMap;
  }
  
  _perlinNoise(x, y) {
    return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  }
  
  _seededRandom(seed) {
    const mask = 0xffffffff;
    let m_z = (seed || 42) & mask;
    let m_w = (seed + 1 || 43) & mask;
    
    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      let result = ((m_z << 16) + m_w) & mask;
      result /= 4294967296;
      return result + 0.5;
    };
  }
  
  _inverseLerp(a, b, value) {
    return (value - a) / (b - a);
  }
  
  getHeightAt(x, z) {
    if (!this.heightMap) return 0;
    
    const gridX = Math.floor((x + this.mapWidth / 2) % this.mapWidth);
    const gridZ = Math.floor((z + this.mapHeight / 2) % this.mapHeight);
    
    if (gridX >= 0 && gridX < this.mapWidth && gridZ >= 0 && gridZ < this.mapHeight) {
      return this.heightMap[gridX][gridZ] * this.heightMultiplier;
    }
    
    return 0;
  }
}
