import * as THREE from 'three';

export class TerrainGenerator {
  constructor(scene) {
    this.scene = scene;
    console.log('TerrainGenerator: Creating textured terrain...');
    this.generateTerrain();
  }

  generateTerrain() {
    // Create a simple plane geometry
    const geometry = new THREE.PlaneGeometry(100, 100);
    
    // Create a canvas texture for a subtle grid pattern
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Fill with green background
    context.fillStyle = '#4a7c59';
    context.fillRect(0, 0, 256, 256);
    
    // Add subtle grid lines
    context.strokeStyle = '#5a8c69';
    context.lineWidth = 1;
    
    // Draw grid
    for (let i = 0; i <= 16; i++) {
      const pos = (i / 16) * 256;
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, 256);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(256, pos);
      context.stroke();
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10); // Repeat the pattern
    
    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    });

    // Create the mesh
    this.terrain = new THREE.Mesh(geometry, material);
    
    // Rotate it to be horizontal
    this.terrain.rotation.x = -Math.PI / 2;
    
    // Position it at ground level
    this.terrain.position.set(0, 0, 0);
    
    // Add to scene
    this.scene.add(this.terrain);
    
    console.log('TerrainGenerator: Textured terrain added to scene');
    console.log('TerrainGenerator: Scene children count:', this.scene.children.length);
  }

  getHeightAt(x, z) {
    return 0;
  }
} 