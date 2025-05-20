using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using System.IO;

public class SetupPlayerAnimatorController : EditorWindow
{
    [MenuItem("Tools/Setup Player Animator Controller")]
    public static void SetupAnimator()
    {
        // Paths
        string controllerPath = "Assets/Animations/PlayerController.controller";
        string animFolder = "Assets/Blink/Art/Characters/Stylized/Humans/Animations/";
        string modelFolder = "Assets/Blink/Art/Characters/Stylized/Humans/Prefabs_Humans/";
        string idleClipName = "Idle";
        string walkClipName = "Walk";
        string attackClipName = "Attack";

        // Create Animations folder if it doesn't exist
        if (!AssetDatabase.IsValidFolder("Assets/Animations"))
            AssetDatabase.CreateFolder("Assets", "Animations");

        // Create Animator Controller
        var controller = AnimatorController.CreateAnimatorControllerAtPath(controllerPath);
        controller.AddParameter("Speed", AnimatorControllerParameterType.Float);
        controller.AddParameter("Attack", AnimatorControllerParameterType.Trigger);

        // Find animation clips
        AnimationClip idleClip = FindClip(animFolder, idleClipName);
        AnimationClip walkClip = FindClip(animFolder, walkClipName);
        AnimationClip attackClip = FindClip(animFolder, attackClipName);
        if (idleClip == null || walkClip == null || attackClip == null)
        {
            Debug.LogError("Could not find one or more required animation clips (Idle, Walk, Attack) in: " + animFolder);
            return;
        }

        // Add states
        var rootStateMachine = controller.layers[0].stateMachine;
        var idleState = rootStateMachine.AddState("Idle");
        idleState.motion = idleClip;
        var walkState = rootStateMachine.AddState("Walk");
        walkState.motion = walkClip;
        var attackState = rootStateMachine.AddState("Attack");
        attackState.motion = attackClip;

        // Set Idle as default
        rootStateMachine.defaultState = idleState;

        // Transitions: Idle <-> Walk (Speed)
        var idleToWalk = idleState.AddTransition(walkState);
        idleToWalk.AddCondition(AnimatorConditionMode.Greater, 0.1f, "Speed");
        idleToWalk.hasExitTime = false;
        var walkToIdle = walkState.AddTransition(idleState);
        walkToIdle.AddCondition(AnimatorConditionMode.Less, 0.1f, "Speed");
        walkToIdle.hasExitTime = false;

        // Any State -> Attack (Trigger)
        var anyToAttack = rootStateMachine.AddAnyStateTransition(attackState);
        anyToAttack.AddCondition(AnimatorConditionMode.If, 0, "Attack");
        anyToAttack.hasExitTime = false;
        anyToAttack.canTransitionToSelf = false;

        // Attack -> Idle (after animation)
        var attackToIdle = attackState.AddTransition(idleState);
        attackToIdle.hasExitTime = true;
        attackToIdle.exitTime = 0.95f;
        attackToIdle.hasFixedDuration = true;

        // Assign to player
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player == null)
        {
            Debug.LogWarning("No GameObject with tag 'Player' found. Please assign the controller manually if needed.");
        }
        else
        {
            Animator anim = player.GetComponentInChildren<Animator>();
            if (anim != null)
            {
                anim.runtimeAnimatorController = controller;
                Debug.Log("Assigned new Animator Controller to player.");
            }
            else
            {
                Debug.LogWarning("No Animator found on player or its children.");
            }
        }
        AssetDatabase.SaveAssets();
        Debug.Log("Player Animator Controller setup complete.");
    }

    private static AnimationClip FindClip(string folder, string name)
    {
        string[] guids = AssetDatabase.FindAssets(name + " t:AnimationClip", new[] { folder });
        foreach (string guid in guids)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            if (Path.GetFileNameWithoutExtension(path).ToLower().Contains(name.ToLower()))
                return AssetDatabase.LoadAssetAtPath<AnimationClip>(path);
        }
        return null;
    }
} 