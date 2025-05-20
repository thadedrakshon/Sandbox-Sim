using UnityEngine;
using UnityEditor;

public class CombatSystemAnimatorAutoAssigner : EditorWindow
{
    [MenuItem("Tools/Auto-Assign CombatSystem Animators")]
    public static void AssignAnimators()
    {
        int assignedCount = 0;
        CombatSystem[] combatSystems = GameObject.FindObjectsOfType<CombatSystem>(true);
        foreach (var cs in combatSystems)
        {
            if (cs.animator == null)
            {
                Animator foundAnimator = cs.GetComponent<Animator>();
                if (foundAnimator != null)
                {
                    Undo.RecordObject(cs, "Assign Animator to CombatSystem");
                    cs.animator = foundAnimator;
                    EditorUtility.SetDirty(cs);
                    assignedCount++;
                }
            }
        }
        Debug.Log($"CombatSystemAnimatorAutoAssigner: Assigned {assignedCount} Animator(s) to CombatSystem(s).");
    }
} 