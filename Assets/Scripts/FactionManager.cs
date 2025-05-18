using System.Collections.Generic;
using UnityEngine;

public class FactionManager : MonoBehaviour
{
    public static FactionManager Instance { get; private set; }
    
    [SerializeField] private List<Faction> availableFactions = new List<Faction>();
    
    private Dictionary<Faction, List<GameObject>> factionMembers = new Dictionary<Faction, List<GameObject>>();
    
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
        
        foreach (Faction faction in availableFactions)
        {
            factionMembers[faction] = new List<GameObject>();
        }
    }
    
    public void RegisterEntityToFaction(GameObject entity, Faction faction)
    {
        if (faction == null || entity == null)
            return;
            
        foreach (var kvp in factionMembers)
        {
            kvp.Value.Remove(entity);
        }
        
        if (!factionMembers.ContainsKey(faction))
        {
            factionMembers[faction] = new List<GameObject>();
        }
        
        factionMembers[faction].Add(entity);
    }
    
    public Faction GetEntityFaction(GameObject entity)
    {
        foreach (var kvp in factionMembers)
        {
            if (kvp.Value.Contains(entity))
            {
                return kvp.Key;
            }
        }
        
        return null;
    }
    
    public List<GameObject> GetFactionMembers(Faction faction)
    {
        if (factionMembers.ContainsKey(faction))
        {
            return factionMembers[faction];
        }
        
        return new List<GameObject>();
    }
    
    public bool AreFactionsHostile(Faction factionA, Faction factionB)
    {
        if (factionA == null || factionB == null)
            return false;
            
        return factionA.GetStanceTowards(factionB) == FactionStance.Hostile;
    }
}
