import React, { useMemo, Suspense } from "react";
import { useGLTF } from "@react-three/drei";

const ModelViewer = ({ modelName, ...props }) => {
  // Map model names to their corresponding GLB files
  const modelPath = useMemo(() => {
    const modelMap = {
      'tulasi': 'https://raw.githubusercontent.com/mimictroll30/3d-models/main/tulasi.glb',
      'neem': 'https://raw.githubusercontent.com/mimictroll30/3d-models/main/neemmodel.glb',
      'ashwagandha': 'https://raw.githubusercontent.com/mimictroll30/3d-models/main/ashwagandha.glb',
      'marjoram': 'https://raw.githubusercontent.com/mimictroll30/3d-models/main/marjoram.glb',
      'aloevera': 'https://raw.githubusercontent.com/mimictroll30/3d-models/main/model.glb', // aloe vera remote model
      'default': '/models/model.glb'
    };
    
    return modelMap[modelName?.toLowerCase()] || modelMap['default'];
  }, [modelName]);

  // Inner component to handle model loading
  const Model = () => {
    try {
      const { scene } = useGLTF(modelPath);
      if (!scene) {
        throw new Error('Model scene not loaded');
      }
      return <primitive object={scene} {...props} />;
    } catch (error) {
      console.error(`Error loading 3D model for ${modelName}:`, error);
      
      // Fallback to default model if specific model fails
      try {
        const { scene: fallbackScene } = useGLTF('/models/model.glb');
        return <primitive object={fallbackScene} {...props} />;
      } catch (fallbackError) {
        console.error('Error loading fallback model:', fallbackError);
        
        // Return a simple placeholder mesh if all else fails
        return (
          <mesh {...props}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>
        );
      }
    }
  };

  // Loading placeholder component
  const LoadingPlaceholder = () => (
    <mesh {...props}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e0e0e0" transparent opacity={0.5} />
    </mesh>
  );

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <Model />
    </Suspense>
  );
};

export default ModelViewer;

// Preload all available models for better performance
useGLTF.preload('https://raw.githubusercontent.com/mimictroll30/3d-models/main/tulasi.glb');
useGLTF.preload('https://raw.githubusercontent.com/mimictroll30/3d-models/main/neemmodel.glb');
useGLTF.preload('https://raw.githubusercontent.com/mimictroll30/3d-models/main/ashwagandha.glb');
useGLTF.preload('https://raw.githubusercontent.com/mimictroll30/3d-models/main/marjoram.glb');
useGLTF.preload('https://raw.githubusercontent.com/mimictroll30/3d-models/main/model.glb');