export class UIManager {
  constructor() {
    this.healthBar = document.getElementById('health-fill');
    this.factionInfo = document.getElementById('faction-info');
    this.controlsPanel = document.getElementById('controls-panel');
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
