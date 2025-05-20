using UnityEngine;
using System.Collections;

public class CombatSystem : MonoBehaviour
{
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackCooldown = 1f;
    [SerializeField] private int attackDamage = 10;
    [SerializeField] private LayerMask enemyLayers;
    [SerializeField] public Animator animator;
    [SerializeField] private Color attackFlashColor = Color.red;
    [SerializeField] private float flashDuration = 0.1f;
    
    private float lastAttackTime;
    private Color? originalColor = null;
    private Renderer cachedRenderer;
    private SkinnedMeshRenderer cachedSkinnedRenderer;
    
    private void Awake()
    {
        if (animator == null)
        {
            animator = GetComponentInChildren<Animator>();
        }
        // Try to cache a Renderer or SkinnedMeshRenderer for color flash
        cachedRenderer = GetComponentInChildren<Renderer>();
        cachedSkinnedRenderer = GetComponentInChildren<SkinnedMeshRenderer>();
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
        
        // Flash color for feedback
        if (cachedSkinnedRenderer != null && cachedSkinnedRenderer.material.HasProperty("_Color"))
        {
            if (!originalColor.HasValue)
                originalColor = cachedSkinnedRenderer.material.color;
            StopAllCoroutines();
            StartCoroutine(FlashColorCoroutine(cachedSkinnedRenderer));
        }
        else if (cachedRenderer != null && cachedRenderer.material.HasProperty("_Color"))
        {
            if (!originalColor.HasValue)
                originalColor = cachedRenderer.material.color;
            StopAllCoroutines();
            StartCoroutine(FlashColorCoroutine(cachedRenderer));
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
    
    private System.Collections.IEnumerator FlashColorCoroutine(Renderer rend)
    {
        rend.material.color = attackFlashColor;
        yield return new WaitForSeconds(flashDuration);
        if (originalColor.HasValue)
            rend.material.color = originalColor.Value;
    }
    
    private System.Collections.IEnumerator FlashColorCoroutine(SkinnedMeshRenderer rend)
    {
        rend.material.color = attackFlashColor;
        yield return new WaitForSeconds(flashDuration);
        if (originalColor.HasValue)
            rend.material.color = originalColor.Value;
    }
    
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }
}
