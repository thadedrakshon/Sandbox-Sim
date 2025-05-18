using UnityEngine;

public class MapGenerator : MonoBehaviour
{
    [SerializeField] private int mapWidth = 256;
    [SerializeField] private int mapHeight = 256;
    [SerializeField] private float noiseScale = 20f;
    [SerializeField] private int octaves = 4;
    [SerializeField] private float persistence = 0.5f;
    [SerializeField] private float lacunarity = 2f;
    [SerializeField] private int seed = 42;
    [SerializeField] private Vector2 offset = Vector2.zero;
    
    [SerializeField] private float heightMultiplier = 10f;
    [SerializeField] private AnimationCurve heightCurve;
    
    [SerializeField] private Terrain terrain;
    
    private void Awake()
    {
        GenerateMap();
    }
    
    public void GenerateMap()
    {
        float[,] heightMap = GenerateHeightMap();
        
        ApplyHeightMapToTerrain(heightMap);
    }
    
    private float[,] GenerateHeightMap()
    {
        float[,] heightMap = new float[mapWidth, mapHeight];
        
        System.Random prng = new System.Random(seed);
        Vector2[] octaveOffsets = new Vector2[octaves];
        
        for (int i = 0; i < octaves; i++)
        {
            float offsetX = prng.Next(-100000, 100000) + offset.x;
            float offsetY = prng.Next(-100000, 100000) + offset.y;
            octaveOffsets[i] = new Vector2(offsetX, offsetY);
        }
        
        float maxHeight = float.MinValue;
        float minHeight = float.MaxValue;
        
        for (int y = 0; y < mapHeight; y++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                float amplitude = 1;
                float frequency = 1;
                float noiseHeight = 0;
                
                for (int i = 0; i < octaves; i++)
                {
                    float sampleX = (x - mapWidth / 2f) / noiseScale * frequency + octaveOffsets[i].x;
                    float sampleY = (y - mapHeight / 2f) / noiseScale * frequency + octaveOffsets[i].y;
                    
                    float perlinValue = Mathf.PerlinNoise(sampleX, sampleY) * 2 - 1;
                    noiseHeight += perlinValue * amplitude;
                    
                    amplitude *= persistence;
                    frequency *= lacunarity;
                }
                
                if (noiseHeight > maxHeight)
                {
                    maxHeight = noiseHeight;
                }
                if (noiseHeight < minHeight)
                {
                    minHeight = noiseHeight;
                }
                
                heightMap[x, y] = noiseHeight;
            }
        }
        
        for (int y = 0; y < mapHeight; y++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                heightMap[x, y] = Mathf.InverseLerp(minHeight, maxHeight, heightMap[x, y]);
            }
        }
        
        return heightMap;
    }
    
    private void ApplyHeightMapToTerrain(float[,] heightMap)
    {
        if (terrain == null)
        {
            Debug.LogError("No terrain assigned to MapGenerator");
            return;
        }
        
        TerrainData terrainData = terrain.terrainData;
        terrainData.heightmapResolution = mapWidth + 1;
        terrainData.size = new Vector3(mapWidth, heightMultiplier, mapHeight);
        
        float[,] heights = new float[terrainData.heightmapResolution, terrainData.heightmapResolution];
        
        for (int y = 0; y < terrainData.heightmapResolution; y++)
        {
            for (int x = 0; x < terrainData.heightmapResolution; x++)
            {
                if (x < mapWidth && y < mapHeight)
                {
                    heights[y, x] = heightCurve.Evaluate(heightMap[x, y]);
                }
            }
        }
        
        terrainData.SetHeights(0, 0, heights);
    }
}
