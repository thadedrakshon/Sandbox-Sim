# Script Examples

## Player Controller

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float rotationSpeed = 10f;
    
    private CharacterController characterController;
    private Transform cameraTransform;
    
    private void Awake()
    {
        characterController = GetComponent<CharacterController>();
        cameraTransform = Camera.main.transform;
    }
    
    private void Update()
    {
        HandleMovement();
        HandleRotation();
    }
    
    private void HandleMovement()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 movement = new Vector3(horizontal, 0f, vertical).normalized;
        
        // Convert movement from local to world space based on camera orientation
        Vector3 cameraForward = Vector3.ProjectOnPlane(cameraTransform.forward, Vector3.up).normalized;
        Vector3 cameraRight = Vector3.Cross(Vector3.up, cameraForward).normalized;
        
        Vector3 worldSpaceMovement = cameraRight * movement.x + cameraForward * movement.z;
        
        if (worldSpaceMovement.magnitude > 0.1f)
        {
            characterController.Move(worldSpaceMovement * moveSpeed * Time.deltaTime);
        }
    }
    
    private void HandleRotation()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        Vector3 movement = new Vector3(horizontal, 0f, vertical).normalized;
        
        if (movement.magnitude > 0.1f)
        {
            // Convert movement from local to world space based on camera orientation
            Vector3 cameraForward = Vector3.ProjectOnPlane(cameraTransform.forward, Vector3.up).normalized;
            Vector3 cameraRight = Vector3.Cross(Vector3.up, cameraForward).normalized;
            
            Vector3 worldSpaceMovement = cameraRight * movement.x + cameraForward * movement.z;
            
            // Calculate the target rotation
            Quaternion targetRotation = Quaternion.LookRotation(worldSpaceMovement);
            
            // Smoothly rotate towards the target rotation
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        }
    }
}
```

## NPC AI

```csharp
using System.Collections;
using System.Collections.Generic;
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
        // Increase hunger over time
        currentHunger += hungerDecreaseRate * Time.deltaTime / 60f;
        currentHunger = Mathf.Clamp(currentHunger, 0f, maxHunger);
        
        // Check for enemies if not in combat or fleeing
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
        Debug.Log($"{gameObject.name} is idle");
        
        // Wait for a short time
        yield return new WaitForSeconds(Random.Range(1f, 3f));
        
        // Check if hungry
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
        Debug.Log($"{gameObject.name} is roaming");
        
        // Find a random position to move to
        Vector3 randomDirection = Random.insideUnitSphere * roamingRadius;
        randomDirection += transform.position;
        NavMeshHit hit;
        NavMesh.SamplePosition(randomDirection, out hit, roamingRadius, 1);
        Vector3 finalPosition = hit.position;
        
        // Move to the random position
        navMeshAgent.SetDestination(finalPosition);
        
        // Wait until the NPC reaches the destination or gets close enough
        while (navMeshAgent.pathPending || navMeshAgent.remainingDistance > navMeshAgent.stoppingDistance)
        {
            // Check if hungry while roaming
            if (currentHunger >= hungerThreshold)
            {
                currentState = NPCState.Hungry;
                yield break;
            }
            
            yield return null;
        }
        
        // Wait for a random time before moving again
        yield return new WaitForSeconds(Random.Range(minRoamingWaitTime, maxRoamingWaitTime));
        
        // Check if hungry after waiting
        if (currentHunger >= hungerThreshold)
        {
            currentState = NPCState.Hungry;
        }
        else
        {
            // Continue roaming
            currentState = NPCState.Roaming;
        }
    }
    
    private IEnumerator HungryState()
    {
        Debug.Log($"{gameObject.name} is hungry");
        
        // Decide what to do based on hunger level
        if (currentHunger >= criticalHungerThreshold)
        {
            // Critical hunger, must find food immediately
            currentState = NPCState.SearchingFood;
        }
        else
        {
            // Hungry but not critical, decide whether to search for food or continue current activity
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
        Debug.Log($"{gameObject.name} is searching for food");
        
        // Find the nearest food source
        GameObject foodSource = FindNearestFoodSource();
        
        if (foodSource != null)
        {
            // Move to the food source
            navMeshAgent.SetDestination(foodSource.transform.position);
            
            // Wait until the NPC reaches the food source or gets close enough
            while (navMeshAgent.pathPending || navMeshAgent.remainingDistance > navMeshAgent.stoppingDistance)
            {
                yield return null;
            }
            
            // Start eating
            currentState = NPCState.Eating;
        }
        else
        {
            // No food found, continue roaming
            Debug.Log($"{gameObject.name} couldn't find food");
            currentState = NPCState.Roaming;
        }
        
        yield return null;
    }
    
    private IEnumerator EatingState()
    {
        Debug.Log($"{gameObject.name} is eating");
        
        // Simulate eating for a few seconds
        yield return new WaitForSeconds(3f);
        
        // Reduce hunger
        currentHunger = Mathf.Max(0, currentHunger - 50f);
        
        // Return to roaming
        currentState = NPCState.Roaming;
    }
    
    private IEnumerator CombatState()
    {
        Debug.Log($"{gameObject.name} is in combat with {targetEnemy.name}");
        
        while (targetEnemy != null)
        {
            // Move towards the enemy
            navMeshAgent.SetDestination(targetEnemy.position);
            
            // Check if within attack range
            float distanceToEnemy = Vector3.Distance(transform.position, targetEnemy.position);
            
            if (distanceToEnemy <= attackRange)
            {
                // Stop moving
                navMeshAgent.isStopped = true;
                
                // Face the enemy
                Vector3 directionToEnemy = (targetEnemy.position - transform.position).normalized;
                Quaternion lookRotation = Quaternion.LookRotation(new Vector3(directionToEnemy.x, 0, directionToEnemy.z));
                transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * 5f);
                
                // Attack if cooldown has passed
                if (Time.time >= lastAttackTime + attackCooldown)
                {
                    Attack(targetEnemy);
                    lastAttackTime = Time.time;
                }
            }
            else
            {
                // Continue moving
                navMeshAgent.isStopped = false;
            }
            
            // Check if should flee (low health, etc.)
            if (ShouldFlee())
            {
                currentState = NPCState.Fleeing;
                yield break;
            }
            
            yield return null;
        }
        
        // Enemy is gone, return to roaming
        navMeshAgent.isStopped = false;
        currentState = NPCState.Roaming;
    }
    
    private IEnumerator FleeingState()
    {
        Debug.Log($"{gameObject.name} is fleeing");
        
        // Find a direction away from the enemy
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
        
        // Wait until reached the flee position or enough time has passed
        float fleeStartTime = Time.time;
        while (Time.time < fleeStartTime + 5f)
        {
            yield return null;
        }
        
        // Return to roaming
        currentState = NPCState.Roaming;
    }
    
    private void CheckForEnemies()
    {
        // Find potential enemies within detection radius
        Collider[] hitColliders = Physics.OverlapSphere(transform.position, detectionRadius);
        foreach (var hitCollider in hitColliders)
        {
            // Check if it's an enemy (different faction, etc.)
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
        Debug.Log($"{gameObject.name} attacks {enemy.name}");
        
        // Get the health component of the enemy
        Health enemyHealth = enemy.GetComponent<Health>();
        if (enemyHealth != null)
        {
            // Deal damage
            enemyHealth.TakeDamage(attackDamage);
        }
    }
    
    private GameObject FindNearestFoodSource()
    {
        // This would be implemented to find food sources in the game world
        // For now, return null as a placeholder
        return null;
    }
    
    private bool IsEnemy(GameObject other)
    {
        // This would check faction relationships, etc.
        // For now, return false as a placeholder
        return false;
    }
    
    private bool ShouldFlee()
    {
        // This would check health, strength comparison, etc.
        // For now, return false as a placeholder
        return false;
    }
}
```

## Faction System

```csharp
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
        
        // Default neutral relationship
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
```

## Building System

```csharp
using System.Collections.Generic;
using UnityEngine;

public class BuildingSystem : MonoBehaviour
{
    [SerializeField] private LayerMask groundLayer;
    [SerializeField] private float gridSize = 1f;
    [SerializeField] private Material validPlacementMaterial;
    [SerializeField] private Material invalidPlacementMaterial;
    
    private GameObject currentBuilding;
    private bool isPlacingBuilding;
    private bool canPlace;
    
    private void Update()
    {
        if (isPlacingBuilding)
        {
            UpdateBuildingPosition();
            UpdateBuildingMaterial();
            
            if (Input.GetMouseButtonDown(0) && canPlace)
            {
                PlaceBuilding();
            }
            
            if (Input.GetMouseButtonDown(1))
            {
                CancelPlacement();
            }
        }
    }
    
    public void StartPlacingBuilding(GameObject buildingPrefab)
    {
        if (isPlacingBuilding)
        {
            CancelPlacement();
        }
        
        currentBuilding = Instantiate(buildingPrefab);
        
        // Set material to transparent version for placement
        Renderer[] renderers = currentBuilding.GetComponentsInChildren<Renderer>();
        foreach (Renderer renderer in renderers)
        {
            Material[] materials = renderer.materials;
            for (int i = 0; i < materials.Length; i++)
            {
                materials[i] = invalidPlacementMaterial;
            }
            renderer.materials = materials;
        }
        
        isPlacingBuilding = true;
        canPlace = false;
    }
    
    private void UpdateBuildingPosition()
    {
        Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
        RaycastHit hit;
        
        if (Physics.Raycast(ray, out hit, 1000f, groundLayer))
        {
            // Snap to grid
            float x = Mathf.Round(hit.point.x / gridSize) * gridSize;
            float z = Mathf.Round(hit.point.z / gridSize) * gridSize;
            
            currentBuilding.transform.position = new Vector3(x, hit.point.y, z);
            
            // Check if placement is valid
            canPlace = IsPlacementValid();
        }
    }
    
    private void UpdateBuildingMaterial()
    {
        Renderer[] renderers = currentBuilding.GetComponentsInChildren<Renderer>();
        Material materialToUse = canPlace ? validPlacementMaterial : invalidPlacementMaterial;
        
        foreach (Renderer renderer in renderers)
        {
            Material[] materials = renderer.materials;
            for (int i = 0; i < materials.Length; i++)
            {
                materials[i] = materialToUse;
            }
            renderer.materials = materials;
        }
    }
    
    private bool IsPlacementValid()
    {
        // Check for collisions with other buildings or obstacles
        Collider buildingCollider = currentBuilding.GetComponent<Collider>();
        
        // Temporarily disable the collider to avoid self-collision
        buildingCollider.enabled = false;
        
        // Check for overlapping colliders
        Collider[] colliders = Physics.OverlapBox(
            buildingCollider.bounds.center,
            buildingCollider.bounds.extents,
            currentBuilding.transform.rotation
        );
        
        // Re-enable the collider
        buildingCollider.enabled = true;
        
        // If there are any colliders (other than triggers), placement is invalid
        foreach (Collider collider in colliders)
        {
            if (!collider.isTrigger)
            {
                return false;
            }
        }
        
        // Check if on valid terrain
        // Additional checks could be added here (resources, territory, etc.)
        
        return true;
    }
    
    private void PlaceBuilding()
    {
        // Finalize the building placement
        isPlacingBuilding = false;
        
        // Restore original materials
        Renderer[] renderers = currentBuilding.GetComponentsInChildren<Renderer>();
        foreach (Renderer renderer in renderers)
        {
            // This would restore the original materials
            // For now, just using the valid placement material as a placeholder
            Material[] materials = renderer.materials;
            for (int i = 0; i < materials.Length; i++)
            {
                materials[i] = validPlacementMaterial;
            }
            renderer.materials = materials;
        }
        
        // Add any necessary components or initialize the building
        Building building = currentBuilding.GetComponent<Building>();
        if (building != null)
        {
            building.Initialize();
        }
        
        // Reset current building reference
        currentBuilding = null;
    }
    
    private void CancelPlacement()
    {
        if (currentBuilding != null)
        {
            Destroy(currentBuilding);
            currentBuilding = null;
        }
        
        isPlacingBuilding = false;
    }
}

public class Building : MonoBehaviour
{
    [SerializeField] private string buildingName;
    [SerializeField] private int healthPoints = 100;
    [SerializeField] private List<ResourceCost> constructionCosts = new List<ResourceCost>();
    
    private bool isConstructed = false;
    
    public void Initialize()
    {
        // This would be called when the building is first placed
        isConstructed = false;
        
        // Start construction process
        StartConstruction();
    }
    
    private void StartConstruction()
    {
        // This would handle the construction process
        // For now, just instantly complete construction
        CompleteConstruction();
    }
    
    private void CompleteConstruction()
    {
        isConstructed = true;
        
        // Enable building functionality
        // This would vary depending on the building type
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
```
