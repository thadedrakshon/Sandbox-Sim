using UnityEngine;

public class FoodSource : MonoBehaviour
{
    [SerializeField] private int foodAmount = 50;
    [SerializeField] private bool isInfinite = false;
    
    public bool Consume(int amount)
    {
        if (isInfinite)
            return true;
            
        if (foodAmount >= amount)
        {
            foodAmount -= amount;
            
            if (foodAmount <= 0)
            {
                Destroy(gameObject);
            }
            
            return true;
        }
        
        return false;
    }
    
    public int GetRemainingFood()
    {
        return foodAmount;
    }
}
