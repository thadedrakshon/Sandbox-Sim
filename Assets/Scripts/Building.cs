using System.Collections.Generic;
using UnityEngine;

public class Building : MonoBehaviour
{
    [SerializeField] private string buildingName;
    [SerializeField] private int healthPoints = 100;
    [SerializeField] private List<ResourceCost> constructionCosts = new List<ResourceCost>();
    
    private bool isConstructed = false;
    
    public void Initialize()
    {
        isConstructed = false;
        
        StartConstruction();
    }
    
    private void StartConstruction()
    {
        CompleteConstruction();
    }
    
    private void CompleteConstruction()
    {
        isConstructed = true;
        
    }
    
    public void TakeDamage(int amount)
    {
        healthPoints -= amount;
        
        if (healthPoints <= 0)
        {
            Destroy(gameObject);
        }
    }
}

[System.Serializable]
public struct ResourceCost
{
    public enum ResourceType
    {
        Wood,
        Stone,
        Metal,
        Food
    }
    
    public ResourceType Type;
    public int Amount;
}
