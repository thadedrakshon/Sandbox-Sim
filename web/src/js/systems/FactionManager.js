export const FactionStance = {
  HOSTILE: 'hostile',
  UNFRIENDLY: 'unfriendly',
  NEUTRAL: 'neutral',
  FRIENDLY: 'friendly',
  ALLIED: 'allied'
};

export class Faction {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.relationships = new Map();
  }
  
  setRelationship(faction, stance) {
    this.relationships.set(faction.id, stance);
  }
  
  getStanceTowards(faction) {
    if (!faction) return FactionStance.NEUTRAL;
    
    if (this === faction) return FactionStance.ALLIED;
    
    return this.relationships.get(faction.id) || FactionStance.NEUTRAL;
  }
}

export class FactionManager {
  constructor() {
    this.factions = [];
    this.entityFactions = new Map();
    
    this._initFactions();
  }
  
  _initFactions() {
    const faction1 = new Faction('faction1', 'Grassland Tribe', 0x4CAF50);
    const faction2 = new Faction('faction2', 'Desert Nomads', 0xFFC107);
    
    faction1.setRelationship(faction2, FactionStance.HOSTILE);
    faction2.setRelationship(faction1, FactionStance.HOSTILE);
    
    this.factions.push(faction1, faction2);
  }
  
  getFactions() {
    return this.factions;
  }
  
  registerEntityToFaction(entity, faction) {
    if (!entity || !faction) return;
    
    this.entityFactions.set(entity, faction);
  }
  
  getEntityFaction(entity) {
    return this.entityFactions.get(entity);
  }
  
  areFactionsHostile(factionA, factionB) {
    if (!factionA || !factionB) return false;
    
    return factionA.getStanceTowards(factionB) === FactionStance.HOSTILE;
  }
}
