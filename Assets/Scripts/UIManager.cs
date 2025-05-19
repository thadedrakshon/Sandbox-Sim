using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    [Header("Player UI")]
    [SerializeField] private Slider healthSlider;
    [SerializeField] private Text factionText;
    
    [Header("Controls UI")]
    [SerializeField] private GameObject controlsPanel;
    [SerializeField] private Text controlsText;
    
    [Header("Game State")]
    [SerializeField] private Text gameStateText;
    
    private Health playerHealth;
    
    private void Start()
    {
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            playerHealth = player.GetComponent<Health>();
            
            if (playerHealth != null && healthSlider != null)
            {
                healthSlider.maxValue = playerHealth.GetMaxHealth();
                healthSlider.value = playerHealth.GetCurrentHealth();
                
                playerHealth.OnHealthChanged.AddListener(UpdateHealthUI);
            }
        }
        
        UpdateFactionUI();
        
        if (controlsText != null)
        {
            controlsText.text = 
                "Controls:\n\n" +
                "WASD / Arrows - Move\n" +
                "Mouse - Look around\n" +
                "Left Click - Attack\n" +
                "B - Toggle building mode";
        }
    }
    
    private void UpdateHealthUI(float currentHealth)
    {
        if (healthSlider != null)
        {
            healthSlider.value = currentHealth;
        }
    }
    
    private void UpdateFactionUI()
    {
        if (factionText != null)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                Faction playerFaction = FactionManager.Instance.GetEntityFaction(player);
                if (playerFaction != null)
                {
                    factionText.text = "Faction: " + playerFaction.name;
                }
                else
                {
                    factionText.text = "Faction: None";
                }
            }
        }
    }
    
    public void SetGameStateText(string text)
    {
        if (gameStateText != null)
        {
            gameStateText.text = text;
        }
    }
}
