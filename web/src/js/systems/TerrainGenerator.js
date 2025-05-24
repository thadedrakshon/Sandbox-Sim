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
    this.heightMultiplier = options.heightMultiplier || 3; // Reduced from 10 to make grass lower
    
    this.heightMap = null;
    this.terrain = null;
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
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x8BC34A,
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
    
    const octaveOffsets = [];
    const prng = this._seededRandom(this.seed);
    for (let i = 0; i < this.octaves; i++) {
      const offsetX = prng() * 100000;
      const offsetY = prng() * 100000;
      octaveOffsets.push({ x: offsetX, y: offsetY });
    }
    
    let minHeight = Number.MAX_VALUE;
    let maxHeight = Number.MIN_VALUE;
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        let amplitude = 1;
        let frequency = 1;
        let noiseHeight = 0;
        
        for (let i = 0; i < this.octaves; i++) {
          const sampleX = (x - this.mapWidth / 2) / this.noiseScale * frequency + octaveOffsets[i].x;
          const sampleY = (y - this.mapHeight / 2) / this.noiseScale * frequency + octaveOffsets[i].y;
          
          const perlinValue = this._perlinNoise(sampleX, sampleY) * 2 - 1;
          noiseHeight += perlinValue * amplitude;
          
          amplitude *= this.persistence;
          frequency *= this.lacunarity;
        }
        
        if (noiseHeight > maxHeight) maxHeight = noiseHeight;
        if (noiseHeight < minHeight) minHeight = noiseHeight;
        
        heightMap[x][y] = noiseHeight;
      }
    }
    
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        heightMap[x][y] = this._inverseLerp(minHeight, maxHeight, heightMap[x][y]);
      }
    }
    
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
