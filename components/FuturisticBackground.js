import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x22d3ee, 1.5, 50);
    pointLight3.position.set(0, 10, 0);
    scene.add(pointLight3);

    // Create robot/cyborg figure
    const robotGroup = new THREE.Group();

    // Head (chrome sphere)
    const headGeometry = new THREE.SphereGeometry(0.8, 64, 64);
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 1
    });
    const head = new THREE.Mesh(headGeometry, chromeMaterial);
    head.position.y = 2;
    robotGroup.add(head);

    // Face plate
    const faceGeometry = new THREE.PlaneGeometry(0.6, 0.8);
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x6366f1,
      emissiveIntensity: 0.05
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, 2, 0.7);
    robotGroup.add(face);

    // Eyes (glowing)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.9
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.18, 2.1, 0.72);
    robotGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.18, 2.1, 0.72);
    robotGroup.add(rightEye);

    // Eye glow rings
    const glowRingGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });

    const leftGlow = new THREE.Mesh(glowRingGeometry, glowMaterial);
    leftGlow.position.set(-0.18, 2.1, 0.73);
    robotGroup.add(leftGlow);

    const rightGlow = new THREE.Mesh(glowRingGeometry, glowMaterial);
    rightGlow.position.set(0.18, 2.1, 0.73);
    robotGroup.add(rightGlow);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.5, 32);
    const neck = new THREE.Mesh(neckGeometry, chromeMaterial);
    neck.position.y = 1.15;
    robotGroup.add(neck);

    // Shoulders/Upper body
    const shoulderGeometry = new THREE.BoxGeometry(2.2, 0.3, 0.8);
    const shoulders = new THREE.Mesh(shoulderGeometry, chromeMaterial);
    shoulders.position.y = 0.7;
    robotGroup.add(shoulders);

    // Torso
    const torsoGeometry = new THREE.BoxGeometry(1.8, 1.5, 0.7);
    const torso = new THREE.Mesh(torsoGeometry, chromeMaterial);
    torso.position.y = -0.2;
    robotGroup.add(torso);

    // Chest panel with glow
    const chestGeometry = new THREE.PlaneGeometry(1, 0.8);
    const chestMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.3,
      emissive: 0x6366f1,
      emissiveIntensity: 0.2
    });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(0, 0, 0.36);
    robotGroup.add(chest);

    // Core light
    const coreGeometry = new THREE.CircleGeometry(0.2, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 0, 0.37);
    robotGroup.add(core);

    // Position robot
    robotGroup.position.set(2.5, -0.5, 0);
    robotGroup.rotation.y = -0.3;
    scene.add(robotGroup);

    // Floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 20;
      posArray[i + 2] = (Math.random() - 0.5) * 20;

      // Random colors between purple, blue, and cyan
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colorsArray[i] = 0.39; colorsArray[i + 1] = 0.4; colorsArray[i + 2] = 0.95; // Indigo
      } else if (colorChoice < 0.66) {
        colorsArray[i] = 0.55; colorsArray[i + 1] = 0.36; colorsArray[i + 2] = 0.97; // Purple
      } else {
        colorsArray[i] = 0.13; colorsArray[i + 1] = 0.83; colorsArray[i + 2] = 0.93; // Cyan
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Grid floor
    const gridHelper = new THREE.GridHelper(30, 50, 0x6366f1, 0x1a1a2e);
    gridHelper.position.y = -3;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);

    // Floating rings around robot
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.4
    });

    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.position.set(2.5, 0.5, 0);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.position.set(2.5, 0.5, 0);
    ring2.rotation.x = Math.PI / 3;
    ring2.material.color.setHex(0x8b5cf6);
    scene.add(ring2);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate particles slowly
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;

      // Robot subtle animation
      robotGroup.rotation.y = -0.3 + Math.sin(time * 0.5) * 0.05;
      robotGroup.position.y = -0.5 + Math.sin(time * 0.8) * 0.1;

      // Eye pulsing
      const eyePulse = 0.8 + Math.sin(time * 3) * 0.2;
      leftEye.material.opacity = eyePulse;
      rightEye.material.opacity = eyePulse;
      core.material.opacity = eyePulse;

      // Rings rotation
      ring1.rotation.z += 0.005;
      ring2.rotation.z -= 0.003;
      ring1.rotation.y = Math.sin(time) * 0.1;
      ring2.rotation.y = Math.cos(time) * 0.1;

      // Camera follow mouse slightly
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(1, 0, 0);

      // Lights animation
      pointLight1.position.x = 5 + Math.sin(time) * 2;
      pointLight2.position.y = -5 + Math.cos(time * 0.7) * 2;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
