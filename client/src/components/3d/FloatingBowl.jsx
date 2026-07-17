import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "./Scene";

gsap.registerPlugin(ScrollTrigger);

function FloatingBowl() {
  const container = useRef();

 useLayoutEffect(() => {

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".explore",
      start: "top bottom",
      end:"bottom bottomr",
      scrub: 1,
      markers: true,
    },
  });

  tl.to(container.current, {
    x: -1200,
    y:100,
    ease: "none",
    
  });

  tl.to(container.current, {
    x: -1200,
    y:100,
    ease: "none",
    
  });

  tl.to(container.current, {
    x: -1200,
    y:100,
    ease: "none",
    
  });

 


  
 

   

  return () => {
    tl.kill();
  };

}, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        ref={container}
        style={{
          position: "absolute",
          right: "8%",
          top: "12%",
          width: "600px",
          height: "700px",
        }}
      >
        <Scene />
      </div>
    </div>
  );
}

export default FloatingBowl;