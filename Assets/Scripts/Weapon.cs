using UnityEngine;

[CreateAssetMenu(fileName = "New Weapon", menuName = "Sandbox Sim/Weapon")]
public class Weapon : ScriptableObject
{
    [SerializeField] private string weaponName;
    [SerializeField] private GameObject weaponPrefab;
    [SerializeField] private int damage = 10;
    [SerializeField] private float attackSpeed = 1f; // Attacks per second
    [SerializeField] private float range = 2f;
    
    public string Name => weaponName;
    public GameObject Prefab => weaponPrefab;
    public int Damage => damage;
    public float AttackSpeed => attackSpeed;
    public float Range => range;
}
