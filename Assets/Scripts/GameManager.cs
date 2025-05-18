using System.Collections.Generic;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Faction Settings")]
    [SerializeField] private List<Faction> factions = new List<Faction>();

    [Header("NPC Settings")]
    [SerializeField] private GameObject npcPrefab;
    [SerializeField] private int npcCount = 10;
    [SerializeField] private float spawnRadius = 50f;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        InitializeFactions();

        SpawnNPCs();
    }

    private void InitializeFactions()
    {
        if (factions.Count >= 2)
        {
            factions[0].ModifyRelationship(factions[1], -80);
            factions[1].ModifyRelationship(factions[0], -80);
        }
    }

    private void SpawnNPCs()
    {
        for (int i = 0; i < npcCount; i++)
        {
            Vector3 randomPosition = Random.insideUnitSphere * spawnRadius;
            randomPosition.y = 0; // Keep on ground plane
            
            GameObject npc = Instantiate(npcPrefab, randomPosition, Quaternion.identity);
            
            if (factions.Count > 0)
            {
                NPCController npcController = npc.GetComponent<NPCController>();
                if (npcController != null)
                {
                }
            }
        }
    }

    public FactionStance GetFactionRelationship(Faction factionA, Faction factionB)
    {
        if (factionA == null || factionB == null)
            return FactionStance.Neutral;
            
        return factionA.GetStanceTowards(factionB);
    }
}
