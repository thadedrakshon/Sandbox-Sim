using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    [SerializeField] private Transform target;
    [SerializeField] private float smoothSpeed = 0.125f;
    [SerializeField] private Vector3 offset = new Vector3(0, 10, -10);
    [SerializeField] private float rotationSpeed = 100f;
    [SerializeField] private float minZoom = 5f;
    [SerializeField] private float maxZoom = 20f;
    [SerializeField] private float zoomSpeed = 2f;
    [SerializeField] private float initialZoom = 10f;

    private float currentAngle = 0f;
    private float currentZoom;

    private void Awake()
    {
        currentZoom = initialZoom;
    }

    private void LateUpdate()
    {
        if (target == null)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                target = player.transform;
            }
            else
            {
                return;
            }
        }
        
        // Handle rotation input (Q/E)
        float rotateInput = 0f;
        if (Input.GetKey(KeyCode.Q)) rotateInput -= 1f;
        if (Input.GetKey(KeyCode.E)) rotateInput += 1f;
        currentAngle += rotateInput * rotationSpeed * Time.deltaTime;

        // Handle zoom input (mouse wheel)
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        currentZoom -= scroll * zoomSpeed;
        currentZoom = Mathf.Clamp(currentZoom, minZoom, maxZoom);

        // Calculate new offset based on rotation and zoom
        Vector3 direction = new Vector3(0, offset.y, -currentZoom);
        Quaternion rotation = Quaternion.Euler(0, currentAngle, 0);
        Vector3 rotatedOffset = rotation * direction;
        Vector3 desiredPosition = target.position + rotatedOffset;
        Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed);
        transform.position = smoothedPosition;
        
        transform.LookAt(target);
    }
    
    public void SetTarget(Transform newTarget)
    {
        target = newTarget;
    }
}
