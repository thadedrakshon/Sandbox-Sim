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
            Vector3 cameraForward = Vector3.ProjectOnPlane(cameraTransform.forward, Vector3.up).normalized;
            Vector3 cameraRight = Vector3.Cross(Vector3.up, cameraForward).normalized;
            
            Vector3 worldSpaceMovement = cameraRight * movement.x + cameraForward * movement.z;
            
            Quaternion targetRotation = Quaternion.LookRotation(worldSpaceMovement);
            
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        }
    }
}
