import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import bowlModel from "../../assets/models/fruit_bowl.glb";

function Bowl() {
  const { scene } = useGLTF(bowlModel);

  const bowlRef = useRef();

  useFrame((state) => {

    const t = state.clock.elapsedTime;

    // Intro animation (first 1.5 seconds)
    const intro = Math.min(t / 1.5, 1);

    const ease = 1 - Math.pow(1 - intro, 3);

    bowlRef.current.position.x = 2.3;

    bowlRef.current.position.y =
      THREE.MathUtils.lerp(-2.6, -1.8, ease) +
      Math.sin(t * 0.8) * 0.06;

    bowlRef.current.scale.setScalar(
      THREE.MathUtils.lerp(5.8, 6.5, ease)
    );

    bowlRef.current.rotation.y =
      Math.sin(t * 0.5) * 0.08;

    bowlRef.current.rotation.x =
      Math.sin(t * 0.8) * 0.02;

  });

  return (
    <primitive
      ref={bowlRef}
      object={scene}
      scale={7.5}
      position={[2.3, -1.8, 0]}
    />
  );
}

useGLTF.preload(bowlModel);

export default Bowl;