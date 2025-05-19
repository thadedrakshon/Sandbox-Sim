using UnityEngine;
using UnityEngine.Events;

public class Health : MonoBehaviour
{
    [SerializeField] private int maxHealth = 100;
    [SerializeField] private int currentHealth;
    
    public UnityEvent<int> OnDamaged;
    public UnityEvent<int> OnHealed;
    public UnityEvent OnDeath;
    public UnityEvent<float> OnHealthChanged;
    
    private void Awake()
    {
        currentHealth = maxHealth;
        OnHealthChanged?.Invoke(currentHealth);
    }
    
    public void TakeDamage(int amount)
    {
        if (amount <= 0)
            return;
            
        currentHealth -= amount;
        OnDamaged?.Invoke(amount);
        OnHealthChanged?.Invoke(currentHealth);
        
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
        OnHealthChanged?.Invoke(currentHealth);
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
    
    public int GetMaxHealth()
    {
        return maxHealth;
    }
    
    public int GetCurrentHealth()
    {
        return currentHealth;
    }
}
