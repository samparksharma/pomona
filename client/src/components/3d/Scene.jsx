import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Bowl from "./Bowl";

function Scene() {
  return (
    <Canvas camera={{ position: [4, 0,8], fov: 50 ,near:.1 , far:10000}}>

      <ambientLight intensity={2} />

      <directionalLight
        position={[3, 5, 5]}
        intensity={2}
      />

      <Suspense fallback={null}>
        <Bowl />
      </Suspense>

    </Canvas>
  );
}

export default Scene;