using UnityEngine;
using UnityEditor;

public class ReplacePlayerMeshWithHuman : EditorWindow
{
    // Update this path if the prefab name or folder is different after import
    private static string humanPrefabPath = "Assets/Blink/Art/Characters/Stylized/Humans/Prefabs_Humans/HumanMale_Character_Free.prefab";

    [MenuItem("Tools/Replace Player Mesh With Human Model")]
    public static void ReplacePlayerMesh()
    {
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player == null)
        {
            Debug.LogError("No GameObject with tag 'Player' found in the scene.");
            return;
        }

        // Remove all MeshRenderer/SkinnedMeshRenderer children (the 'pill')
        foreach (Transform child in player.transform)
        {
            if (child.GetComponent<MeshRenderer>() || child.GetComponent<SkinnedMeshRenderer>())
            {
                Undo.DestroyObjectImmediate(child.gameObject);
            }
        }

        // Load the new human prefab
        GameObject humanPrefab = AssetDatabase.LoadAssetAtPath<GameObject>(humanPrefabPath);
        if (humanPrefab == null)
        {
            Debug.LogError($"Could not find human prefab at path: {humanPrefabPath}. Please update the path in ReplacePlayerMeshWithHuman.cs");
            return;
        }

        // Instantiate as child of player
        GameObject newHuman = (GameObject)PrefabUtility.InstantiatePrefab(humanPrefab, player.transform);
        newHuman.transform.localPosition = Vector3.zero;
        newHuman.transform.localRotation = Quaternion.identity;
        newHuman.transform.localScale = Vector3.one;

        Debug.Log("Player mesh replaced with human male model. Adjust position/scale as needed.");
    }
} 