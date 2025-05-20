using UnityEngine;

public class CombatSystem : MonoBehaviour
{
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackCooldown = 1f;
    [SerializeField] private int attackDamage = 10;
    [SerializeField] private LayerMask enemyLayers;
    [SerializeField] public Animator animator;
    
    private float lastAttackTime;
    
    private void Awake()
    {
        if (animator == null)
        {
            animator = GetComponentInChildren<Animator>();
        }
    }
    
    public void Attack()
    {
        if (Time.time < lastAttackTime + attackCooldown)
            return;
            
        lastAttackTime = Time.time;
        
        // Trigger attack animation
        if (animator != null)
        {
            animator.SetTrigger("Attack");
        }
        
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, attackRange, enemyLayers);
        
        Vector3 forward = transform.forward;
        
        foreach (var hitCollider in hitColliders)
        {
            Vector3 directionToEnemy = (hitCollider.transform.position - transform.position).normalized;
            float dotProduct = Vector3.Dot(forward, directionToEnemy);
            
            if (dotProduct > 0.5f)
            {
                Health enemyHealth = hitCollider.GetComponent<Health>();
                if (enemyHealth != null)
                {
                    enemyHealth.TakeDamage(attackDamage);
                }
            }
        }
    }
    
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }
}
