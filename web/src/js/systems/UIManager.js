export class UIManager {
  constructor() {
    this.healthBar = document.getElementById('health-fill');
    this.factionInfo = document.getElementById('faction-info');
    this.controlsPanel = document.getElementById('controls-panel');
    this.npcHealthBars = new Map();
  }
  
  updateHealthBar(currentHealth, maxHealth) {
    if (this.healthBar) {
      const healthPercent = (currentHealth / maxHealth) * 100;
      this.healthBar.style.width = `${healthPercent}%`;
      
      if (healthPercent < 25) {
        this.healthBar.style.backgroundColor = '#F44336'; // Red
      } else if (healthPercent < 50) {
        this.healthBar.style.backgroundColor = '#FFC107'; // Yellow
      } else {
        this.healthBar.style.backgroundColor = '#4CAF50'; // Green
      }
    }
  }
  
  createNPCHealthBar(npc) {
    if (this.npcHealthBars.has(npc)) return;
    
    const healthBarContainer = document.createElement('div');
    healthBarContainer.className = 'npc-health-bar';
    healthBarContainer.style.position = 'absolute';
    healthBarContainer.style.width = '50px';
    healthBarContainer.style.height = '5px';
    healthBarContainer.style.backgroundColor = '#333';
    healthBarContainer.style.border = '1px solid #666';
    healthBarContainer.style.borderRadius = '2px';
    healthBarContainer.style.overflow = 'hidden';
    
    const healthFill = document.createElement('div');
    healthFill.className = 'npc-health-fill';
    healthFill.style.width = '100%';
    healthFill.style.height = '100%';
    healthFill.style.backgroundColor = '#4CAF50';
    healthFill.style.transition = 'width 0.3s ease-in-out, background-color 0.3s ease-in-out';
    
    healthBarContainer.appendChild(healthFill);
    document.body.appendChild(healthBarContainer);
    
    this.npcHealthBars.set(npc, {
      container: healthBarContainer,
      fill: healthFill
    });
  }
  
  updateNPCHealthBar(npc, currentHealth, maxHealth) {
    const healthBar = this.npcHealthBars.get(npc);
    if (!healthBar) return;
    
    const healthPercent = (currentHealth / maxHealth) * 100;
    healthBar.fill.style.width = `${healthPercent}%`;
    
    if (healthPercent < 25) {
      healthBar.fill.style.backgroundColor = '#F44336'; // Red
    } else if (healthPercent < 50) {
      healthBar.fill.style.backgroundColor = '#FFC107'; // Yellow
    } else {
      healthBar.fill.style.backgroundColor = '#4CAF50'; // Green
    }
    
    // Update position to follow NPC
    const screenPosition = this.worldToScreen(npc.model.position);
    healthBar.container.style.left = `${screenPosition.x - 25}px`;
    healthBar.container.style.top = `${screenPosition.y - 30}px`;
  }
  
  removeNPCHealthBar(npc) {
    const healthBar = this.npcHealthBars.get(npc);
    if (healthBar) {
      document.body.removeChild(healthBar.container);
      this.npcHealthBars.delete(npc);
    }
  }
  
  worldToScreen(position) {
    const vector = position.clone();
    vector.project(this.camera);
    
    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
    };
  }
  
  setCamera(camera) {
    this.camera = camera;
  }
  
  updateFactionInfo(factionName) {
    if (this.factionInfo) {
      this.factionInfo.textContent = `Faction: ${factionName}`;
    }
  }
  
  showMessage(message, duration = 3000) {
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(messageElement);
      }, 500);
    }, duration);
  }
}
