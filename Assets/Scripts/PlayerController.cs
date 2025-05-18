using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float rotationSpeed = 10f;
    
    private CharacterController characterController;
    private Transform cameraTransform;
    
    private float horizontalInput;
    private float verticalInput;
    
    private void Awake()
    {
        characterController = GetComponent<CharacterController>();
        cameraTransform = Camera.main.transform;
    }
    
    public void SetMovementInput(float horizontal, float vertical)
    {
        horizontalInput = horizontal;
        verticalInput = vertical;
    }
    
    private void Update()
    {
        HandleMovement();
        HandleRotation();
    }
    
    private void HandleMovement()
    {
        Vector3 movement = new Vector3(horizontalInput, 0f, verticalInput).normalized;
        
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
        Vector3 movement = new Vector3(horizontalInput, 0f, verticalInput).normalized;
        
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
