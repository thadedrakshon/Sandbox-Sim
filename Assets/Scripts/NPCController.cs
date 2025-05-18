using System.Collections;
using UnityEngine;
using UnityEngine.AI;

public enum NPCState
{
    Idle,
    Roaming,
    Hungry,
    SearchingFood,
    Eating,
    Combat,
    Fleeing
}

public class NPCController : MonoBehaviour
{
    [Header("Basic Settings")]
    [SerializeField] private float roamingRadius = 10f;
    [SerializeField] private float minRoamingWaitTime = 2f;
    [SerializeField] private float maxRoamingWaitTime = 5f;
    
    [Header("Needs Settings")]
    [SerializeField] private float maxHunger = 100f;
    [SerializeField] private float hungerDecreaseRate = 2f; // per minute
    [SerializeField] private float hungerThreshold = 70f;
    [SerializeField] private float criticalHungerThreshold = 90f;
    
    [Header("Combat Settings")]
    [SerializeField] private float detectionRadius = 10f;
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackCooldown = 1.5f;
    [SerializeField] private int attackDamage = 10;
    
    private NavMeshAgent navMeshAgent;
    private NPCState currentState;
    private float currentHunger;
    private float lastAttackTime;
    private Transform targetEnemy;
    
    private void Awake()
    {
        navMeshAgent = GetComponent<NavMeshAgent>();
        currentHunger = 0f;
        currentState = NPCState.Idle;
    }
    
    private void Start()
    {
        StartCoroutine(StateMachine());
    }
    
    private void Update()
    {
        currentHunger += hungerDecreaseRate * Time.deltaTime / 60f;
        currentHunger = Mathf.Clamp(currentHunger, 0f, maxHunger);
        
        if (currentState != NPCState.Combat && currentState != NPCState.Fleeing)
        {
            CheckForEnemies();
        }
    }
    
    private IEnumerator StateMachine()
    {
        while (true)
        {
            yield return StartCoroutine(currentState switch
            {
                NPCState.Idle => IdleState(),
                NPCState.Roaming => RoamingState(),
                NPCState.Hungry => HungryState(),
                NPCState.SearchingFood => SearchingFoodState(),
                NPCState.Eating => EatingState(),
                NPCState.Combat => CombatState(),
                NPCState.Fleeing => FleeingState(),
                _ => IdleState()
            });
        }
    }
    
    private IEnumerator IdleState()
    {
        yield return new WaitForSeconds(Random.Range(1f, 3f));
        
        if (currentHunger >= hungerThreshold)
        {
            currentState = NPCState.Hungry;
        }
        else
        {
            currentState = NPCState.Roaming;
        }
    }
    
    private IEnumerator RoamingState()
    {
        Vector3 randomDirection = Random.insideUnitSphere * roamingRadius;
        randomDirection += transform.position;
        NavMeshHit hit;
        NavMesh.SamplePosition(randomDirection, out hit, roamingRadius, 1);
        Vector3 finalPosition = hit.position;
        
        navMeshAgent.SetDestination(finalPosition);
        
        while (navMeshAgent.pathPending || navMeshAgent.remainingDistance > navMeshAgent.stoppingDistance)
        {
            if (currentHunger >= hungerThreshold)
            {
                currentState = NPCState.Hungry;
                yield break;
            }
            
            yield return null;
        }
        
        yield return new WaitForSeconds(Random.Range(minRoamingWaitTime, maxRoamingWaitTime));
        
        if (currentHunger >= hungerThreshold)
        {
            currentState = NPCState.Hungry;
        }
        else
        {
            currentState = NPCState.Roaming;
        }
    }
    
    private IEnumerator HungryState()
    {
        if (currentHunger >= criticalHungerThreshold)
        {
            currentState = NPCState.SearchingFood;
        }
        else
        {
            float hungerPriority = (currentHunger - hungerThreshold) / (criticalHungerThreshold - hungerThreshold);
            if (Random.value < hungerPriority)
            {
                currentState = NPCState.SearchingFood;
            }
            else
            {
                currentState = NPCState.Roaming;
            }
        }
        
        yield return null;
    }
    
    private IEnumerator SearchingFoodState()
    {
        GameObject foodSource = FindNearestFoodSource();
        
        if (foodSource != null)
        {
            navMeshAgent.SetDestination(foodSource.transform.position);
            
            while (navMeshAgent.pathPending || navMeshAgent.remainingDistance > navMeshAgent.stoppingDistance)
            {
                yield return null;
            }
            
            currentState = NPCState.Eating;
        }
        else
        {
            currentState = NPCState.Roaming;
        }
        
        yield return null;
    }
    
    private IEnumerator EatingState()
    {
        yield return new WaitForSeconds(3f);
        
        currentHunger = Mathf.Max(0, currentHunger - 50f);
        
        currentState = NPCState.Roaming;
    }
    
    private IEnumerator CombatState()
    {
        while (targetEnemy != null)
        {
            navMeshAgent.SetDestination(targetEnemy.position);
            
            float distanceToEnemy = Vector3.Distance(transform.position, targetEnemy.position);
            
            if (distanceToEnemy <= attackRange)
            {
                navMeshAgent.isStopped = true;
                
                Vector3 directionToEnemy = (targetEnemy.position - transform.position).normalized;
                Quaternion lookRotation = Quaternion.LookRotation(new Vector3(directionToEnemy.x, 0, directionToEnemy.z));
                transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * 5f);
                
                if (Time.time >= lastAttackTime + attackCooldown)
                {
                    Attack(targetEnemy);
                    lastAttackTime = Time.time;
                }
            }
            else
            {
                navMeshAgent.isStopped = false;
            }
            
            if (ShouldFlee())
            {
                currentState = NPCState.Fleeing;
                yield break;
            }
            
            yield return null;
        }
        
        navMeshAgent.isStopped = false;
        currentState = NPCState.Roaming;
    }
    
    private IEnumerator FleeingState()
    {
        if (targetEnemy != null)
        {
            Vector3 fleeDirection = transform.position - targetEnemy.position;
            Vector3 fleePosition = transform.position + fleeDirection.normalized * 15f;
            
            NavMeshHit hit;
            if (NavMesh.SamplePosition(fleePosition, out hit, 15f, 1))
            {
                navMeshAgent.SetDestination(hit.position);
            }
        }
        
        float fleeStartTime = Time.time;
        while (Time.time < fleeStartTime + 5f)
        {
            yield return null;
        }
        
        currentState = NPCState.Roaming;
    }
    
    private void CheckForEnemies()
    {
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, detectionRadius);
        foreach (var hitCollider in hitColliders)
        {
            if (IsEnemy(hitCollider.gameObject))
            {
                targetEnemy = hitCollider.transform;
                currentState = NPCState.Combat;
                break;
            }
        }
    }
    
    private void Attack(Transform enemy)
    {
        Health enemyHealth = enemy.GetComponent<Health>();
        if (enemyHealth != null)
        {
            enemyHealth.TakeDamage(attackDamage);
        }
    }
    
    private GameObject FindNearestFoodSource()
    {
        FoodSource[] foodSources = FindObjectsOfType<FoodSource>();
        
        float closestDistance = float.MaxValue;
        GameObject closestFood = null;
        
        foreach (FoodSource food in foodSources)
        {
            float distance = Vector3.Distance(transform.position, food.transform.position);
            if (distance < closestDistance)
            {
                closestDistance = distance;
                closestFood = food.gameObject;
            }
        }
        
        return closestFood;
    }
    
    private bool IsEnemy(GameObject other)
    {
        Faction myFaction = FactionManager.Instance.GetEntityFaction(gameObject);
        Faction otherFaction = FactionManager.Instance.GetEntityFaction(other);
        
        return FactionManager.Instance.AreFactionsHostile(myFaction, otherFaction);
    }
    
    private bool ShouldFlee()
    {
        return false;
    }
}
