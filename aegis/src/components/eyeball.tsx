"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Animated state for scroll-driven transforms ───
const animState = {
  camX: 0, camY: 0, camZ: 5,
  camRotX: 0, camRotY: 0,
  objRotX: 0, objRotY: 0, objScale: 1,
  keyIntensity: 1.2, fillIntensity: 0.4, rimIntensity: 0.8,
  coreEmissive: 0.4,
  coreColor: { r: 0.85, g: 0.15, b: 0.15 }, // red
};

// ─── Core Mesh (inner pulsing sphere — the "eye") ───
function CoreSphere({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.getElapsedTime();
    const pulse = 0.45 + Math.sin(t * 1.5) * 0.05;
    ref.current.scale.setScalar(pulse);
    if (matRef.current) {
      matRef.current.emissiveIntensity =
        animState.coreEmissive + Math.sin(t * 2) * 0.08;
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.5, 5]} />
      <meshStandardMaterial
        ref={matRef}
        color="#cc2222"
        emissive="#cc2222"
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.5}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ─── Wireframe Shell (outer cage — data structure) ───
function DataCage({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * 0.1;
    ref.current.rotation.z = t * 0.07;
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.3, 1]} />
      <meshStandardMaterial
        color="#1a1a22"
        metalness={0.95}
        roughness={0.15}
        wireframe
      />
    </mesh>
  );
}

// ─── Orbiting Rings (data flow rings) ───
function DataRing({
  radius,
  thickness,
  color,
  tiltX,
  tiltY,
  speed,
  opacity = 1,
  reducedMotion,
}: {
  radius: number;
  thickness: number;
  color: string;
  tiltX: number;
  tiltY: number;
  speed: number;
  opacity?: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });

  return (
    <mesh ref={ref} rotation={[tiltX, tiltY, 0]}>
      <torusGeometry args={[radius, thickness, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// ─── Floating Particles (ambient data points) ───
function DataParticles({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.015;
    ref.current.rotation.x = Math.sin(t * 0.08) * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#cc2222"
        size={0.015}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Main Sculpture Group (assembled + scroll-driven) ───
function Sculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      // Idle float
      g.position.y = Math.sin(t * 0.5) * 0.06;
      // Lerp toward scroll targets
      const idle = t * 0.08;
      g.rotation.x += (animState.objRotX - g.rotation.x) * 0.04;
      g.rotation.y += (animState.objRotY + idle - g.rotation.y) * 0.04;
    }

    // Scale (always lerp)
    const s = g.scale.x + (animState.objScale - g.scale.x) * 0.04;
    g.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef}>
      <CoreSphere reducedMotion={reducedMotion} />
      <DataCage reducedMotion={reducedMotion} />
      <DataRing
        radius={1.8}
        thickness={0.018}
        color="#cc2222"
        tiltX={Math.PI * 0.35}
        tiltY={0}
        speed={0.25}
        reducedMotion={reducedMotion}
      />
      <DataRing
        radius={2.2}
        thickness={0.012}
        color="#555555"
        tiltX={Math.PI * 0.6}
        tiltY={Math.PI * 0.3}
        speed={-0.18}
        opacity={0.5}
        reducedMotion={reducedMotion}
      />
      <DataParticles count={isMobile ? 80 : 250} reducedMotion={reducedMotion} />
    </group>
  );
}

// ─── Camera Controller (lerps toward scroll targets) ───
function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();

  useFrame(() => {
    if (reducedMotion) return;
    camera.position.x += (animState.camX - camera.position.x) * 0.04;
    camera.position.y += (animState.camY - camera.position.y) * 0.04;
    camera.position.z += (animState.camZ - camera.position.z) * 0.04;
    camera.rotation.x += (animState.camRotX - camera.rotation.x) * 0.04;
    camera.rotation.y += (animState.camRotY - camera.rotation.y) * 0.04;
  });

  return null;
}

// ─── Lights (animated intensities) ───
function AnimatedLights({ reducedMotion }: { reducedMotion: boolean }) {
  const keyRef = useRef<THREE.DirectionalLight>(null!);
  const fillRef = useRef<THREE.DirectionalLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    if (reducedMotion) return;
    if (keyRef.current)
      keyRef.current.intensity +=
        (animState.keyIntensity - keyRef.current.intensity) * 0.04;
    if (fillRef.current)
      fillRef.current.intensity +=
        (animState.fillIntensity - fillRef.current.intensity) * 0.04;
    if (rimRef.current)
      rimRef.current.intensity +=
        (animState.rimIntensity - rimRef.current.intensity) * 0.04;
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#1a1a2e" />
      <directionalLight
        ref={keyRef}
        position={[5, 5, 5]}
        intensity={1.2}
        color="#f0ece4"
      />
      <directionalLight
        ref={fillRef}
        position={[-3, 2, -2]}
        intensity={0.4}
        color="#334455"
      />
      <pointLight
        ref={rimRef}
        position={[-4, 3, -3]}
        intensity={0.8}
        color="#cc2222"
        distance={20}
      />
      <hemisphereLight
        color="#111118"
        groundColor="#050505"
        intensity={0.3}
      />
    </>
  );
}

// ─── GSAP ScrollTrigger Setup ───
function ScrollAnimations({ loaded }: { loaded: boolean }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!loaded || initialized.current) return;
    initialized.current = true;

    // Text fade-ups
    const fadeEls = document.querySelectorAll(".fade-up");
    fadeEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(30px)";
      htmlEl.style.transition = "none";
    });

    // Hero text entrance
    gsap.to(".min-h-screen:first-child .fade-up", {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.3,
    });

    // Section text reveals
    ["#section-1", "#section-2", "#section-3"].forEach((sel) => {
      gsap.to(`${sel} .fade-up`, {
        scrollTrigger: {
          trigger: sel,
          start: "top 70%",
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
      });
    });

    // 3D timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 3,
      },
    });

    // Hero → Section 1: push in, shift right
    tl.to(animState, {
      camX: 1.5, camY: 0.5, camZ: 3.5, camRotY: -0.25,
      objRotX: 0.3, objRotY: 1.2, objScale: 1.1,
      keyIntensity: 1.6, fillIntensity: 0.3, rimIntensity: 1.3,
      coreEmissive: 0.6,
      duration: 1, ease: "none",
    });

    // Section 1 → Section 2: orbit left, cooler
    tl.to(animState, {
      camX: -1.5, camY: -0.2, camZ: 3.8, camRotX: 0.08, camRotY: 0.35,
      objRotX: -0.2, objRotY: 2.8, objScale: 1,
      keyIntensity: 0.8, fillIntensity: 0.7, rimIntensity: 0.5,
      coreEmissive: 0.5,
      duration: 1, ease: "none",
    });

    // Section 2 → Section 3: pull back, center, dim
    tl.to(animState, {
      camX: 0, camY: 0.3, camZ: 6.5, camRotX: -0.08, camRotY: 0,
      objRotX: 0, objRotY: 4.2, objScale: 0.55,
      keyIntensity: 0.9, fillIntensity: 0.4, rimIntensity: 0.6,
      coreEmissive: 0.8,
      duration: 1, ease: "none",
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [loaded]);

  return null;
}

// ─── Exported Component ───
export function AegisScene({
  loaded,
  reducedMotion,
}: {
  loaded: boolean;
  reducedMotion: boolean;
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <CameraRig reducedMotion={reducedMotion} />
        <AnimatedLights reducedMotion={reducedMotion} />
        <Sculpture reducedMotion={reducedMotion} />
        <Environment preset="night" />
      </Canvas>
      <ScrollAnimations loaded={loaded} />
    </>
  );
}