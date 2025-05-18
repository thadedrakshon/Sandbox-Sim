using UnityEngine;

public class GameSetup : MonoBehaviour
{
    [Header("Prefabs")]
    [SerializeField] private GameObject playerPrefab;
    [SerializeField] private GameObject npcPrefab;
    [SerializeField] private GameObject foodSourcePrefab;
    
    [Header("Spawn Settings")]
    [SerializeField] private int foodSourceCount = 10;
    [SerializeField] private float foodSourceSpawnRadius = 50f;
    
    [Header("References")]
    [SerializeField] private Transform playerSpawnPoint;
    [SerializeField] private Camera mainCamera;
    
    private void Start()
    {
        if (playerPrefab != null)
        {
            Vector3 spawnPosition = playerSpawnPoint != null ? 
                playerSpawnPoint.position : new Vector3(0, 1, 0);
                
            GameObject player = Instantiate(playerPrefab, spawnPosition, Quaternion.identity);
            
            if (mainCamera != null)
            {
                CameraFollow cameraFollow = mainCamera.GetComponent<CameraFollow>();
                if (cameraFollow != null)
                {
                    cameraFollow.SetTarget(player.transform);
                }
            }
        }
        
        if (foodSourcePrefab != null)
        {
            for (int i = 0; i < foodSourceCount; i++)
            {
                Vector3 randomPosition = Random.insideUnitSphere * foodSourceSpawnRadius;
                randomPosition.y = 0.5f; // Slightly above ground
                
                Instantiate(foodSourcePrefab, randomPosition, Quaternion.identity);
            }
        }
    }
}
