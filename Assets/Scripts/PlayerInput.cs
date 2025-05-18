using UnityEngine;

[RequireComponent(typeof(PlayerController))]
[RequireComponent(typeof(CombatSystem))]
public class PlayerInput : MonoBehaviour
{
    private PlayerController playerController;
    private CombatSystem combatSystem;
    
    private void Awake()
    {
        playerController = GetComponent<PlayerController>();
        combatSystem = GetComponent<CombatSystem>();
    }
    
    private void Update()
    {
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        playerController.SetMovementInput(horizontal, vertical);
        
        if (Input.GetMouseButtonDown(0))
        {
            combatSystem.Attack();
        }
        
        if (Input.GetKeyDown(KeyCode.B))
        {
            ToggleBuildingMode();
        }
    }
    
    private void ToggleBuildingMode()
    {
        BuildingSystem buildingSystem = FindObjectOfType<BuildingSystem>();
        if (buildingSystem != null)
        {
        }
    }
}
