using UnityEngine;
using UnityEngine.Events;

public class Health : MonoBehaviour
{
    [SerializeField] private int maxHealth = 100;
    [SerializeField] private int currentHealth;
    
    public UnityEvent<int> OnDamaged;
    public UnityEvent<int> OnHealed;
    public UnityEvent OnDeath;
    
    private void Awake()
    {
        currentHealth = maxHealth;
    }
    
    public void TakeDamage(int amount)
    {
        if (amount <= 0)
            return;
            
        currentHealth -= amount;
        OnDamaged?.Invoke(amount);
        
        if (currentHealth <= 0)
        {
            currentHealth = 0;
            Die();
        }
    }
    
    public void Heal(int amount)
    {
        if (amount <= 0)
            return;
            
        int healAmount = Mathf.Min(amount, maxHealth - currentHealth);
        currentHealth += healAmount;
        OnHealed?.Invoke(healAmount);
    }
    
    private void Die()
    {
        OnDeath?.Invoke();
        
        Destroy(gameObject);
    }
    
    public float GetHealthPercentage()
    {
        return (float)currentHealth / maxHealth;
    }
}
