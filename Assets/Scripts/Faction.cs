using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "New Faction", menuName = "Sandbox Sim/Faction")]
public class Faction : ScriptableObject
{
    [SerializeField] private string factionName;
    [SerializeField] private Color factionColor;
    [SerializeField] private Sprite factionIcon;
    
    [SerializeField] private List<FactionRelationship> relationships = new List<FactionRelationship>();
    
    public string Name => factionName;
    public Color Color => factionColor;
    public Sprite Icon => factionIcon;
    
    public int GetRelationshipValue(Faction otherFaction)
    {
        foreach (var relationship in relationships)
        {
            if (relationship.OtherFaction == otherFaction)
            {
                return relationship.RelationshipValue;
            }
        }
        
        return 0;
    }
    
    public FactionStance GetStanceTowards(Faction otherFaction)
    {
        int relationshipValue = GetRelationshipValue(otherFaction);
        
        if (relationshipValue <= -75)
            return FactionStance.Hostile;
        else if (relationshipValue <= -25)
            return FactionStance.Unfriendly;
        else if (relationshipValue <= 25)
            return FactionStance.Neutral;
        else if (relationshipValue <= 75)
            return FactionStance.Friendly;
        else
            return FactionStance.Allied;
    }
    
    public void ModifyRelationship(Faction otherFaction, int amount)
    {
        bool found = false;
        
        for (int i = 0; i < relationships.Count; i++)
        {
            if (relationships[i].OtherFaction == otherFaction)
            {
                int newValue = Mathf.Clamp(relationships[i].RelationshipValue + amount, -100, 100);
                relationships[i] = new FactionRelationship(otherFaction, newValue);
                found = true;
                break;
            }
        }
        
        if (!found)
        {
            relationships.Add(new FactionRelationship(otherFaction, Mathf.Clamp(amount, -100, 100)));
        }
    }
}

[System.Serializable]
public struct FactionRelationship
{
    [SerializeField] private Faction otherFaction;
    [SerializeField] private int relationshipValue; // -100 to 100
    
    public Faction OtherFaction => otherFaction;
    public int RelationshipValue => relationshipValue;
    
    public FactionRelationship(Faction faction, int value)
    {
        otherFaction = faction;
        relationshipValue = Mathf.Clamp(value, -100, 100);
    }
}

public enum FactionStance
{
    Hostile,
    Unfriendly,
    Neutral,
    Friendly,
    Allied
}
