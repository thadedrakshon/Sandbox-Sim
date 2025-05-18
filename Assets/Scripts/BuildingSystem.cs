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
            float x = Mathf.Round(hit.point.x / gridSize) * gridSize;
            float z = Mathf.Round(hit.point.z / gridSize) * gridSize;
            
            currentBuilding.transform.position = new Vector3(x, hit.point.y, z);
            
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
        Collider buildingCollider = currentBuilding.GetComponent<Collider>();
        
        buildingCollider.enabled = false;
        
        Collider[] colliders = Physics.OverlapBox(
            buildingCollider.bounds.center,
            buildingCollider.bounds.extents,
            currentBuilding.transform.rotation
        );
        
        buildingCollider.enabled = true;
        
        foreach (Collider collider in colliders)
        {
            if (!collider.isTrigger)
            {
                return false;
            }
        }
        
        
        return true;
    }
    
    private void PlaceBuilding()
    {
        isPlacingBuilding = false;
        
        Renderer[] renderers = currentBuilding.GetComponentsInChildren<Renderer>();
        foreach (Renderer renderer in renderers)
        {
            Material[] materials = renderer.materials;
            for (int i = 0; i < materials.Length; i++)
            {
                materials[i] = validPlacementMaterial;
            }
            renderer.materials = materials;
        }
        
        Building building = currentBuilding.GetComponent<Building>();
        if (building != null)
        {
            building.Initialize();
        }
        
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
