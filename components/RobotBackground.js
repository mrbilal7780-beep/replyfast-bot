import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function RobotBackground() {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration
    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(isMobile ? 0 : 5, 2, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      alpha: true,
      antialias: !isMobile,
      powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 🤖 ROBOT ANDROÏDE - Corps principal
    const robotGroup = new THREE.Group();

    // Matériau chrome noir
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1
    });

    // Matériau néon bleu
    const neonMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x6366f1,
      emissiveIntensity: 2,
      metalness: 0.8,
      roughness: 0.2
    });

    // Tête (ellipsoïde lisse)
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    headGeometry.scale(1, 1.2, 0.8);
    const head = new THREE.Mesh(headGeometry, chromeMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    robotGroup.add(head);

    // Yeux lumineux (néons)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeLeft = new THREE.Mesh(eyeGeometry, neonMaterial);
    eyeLeft.position.set(-0.18, 2.55, 0.45);
    robotGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeometry, neonMaterial);
    eyeRight.position.set(0.18, 2.55, 0.45);
    robotGroup.add(eyeRight);

    // Ligne lumineuse sur la tête
    const lineGeometry = new THREE.TorusGeometry(0.4, 0.02, 8, 32);
    const headLine = new THREE.Mesh(lineGeometry, neonMaterial);
    headLine.position.y = 2.5;
    headLine.rotation.x = Math.PI / 2;
    robotGroup.add(headLine);

    // Cou
    const neckGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
    const neck = new THREE.Mesh(neckGeometry, chromeMaterial);
    neck.position.y = 1.9;
    neck.castShadow = true;
    robotGroup.add(neck);

    // Torse
    const torsoGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.6);
    const torso = new THREE.Mesh(torsoGeometry, chromeMaterial);
    torso.position.y = 0.8;
    torso.castShadow = true;
    robotGroup.add(torso);

    // Ligne néon sur le torse
    const chestLineGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.1);
    const chestLine = new THREE.Mesh(chestLineGeometry, neonMaterial);
    chestLine.position.set(0, 1, 0.31);
    robotGroup.add(chestLine);

    // Cœur lumineux
    const coreGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const core = new THREE.Mesh(coreGeometry, neonMaterial);
    core.position.set(0, 0.9, 0.35);
    robotGroup.add(core);

    // Épaules
    const shoulderGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const shoulderLeft = new THREE.Mesh(shoulderGeometry, chromeMaterial);
    shoulderLeft.position.set(-0.7, 1.4, 0);
    shoulderLeft.castShadow = true;
    robotGroup.add(shoulderLeft);

    const shoulderRight = new THREE.Mesh(shoulderGeometry, chromeMaterial);
    shoulderRight.position.set(0.7, 1.4, 0);
    shoulderRight.castShadow = true;
    robotGroup.add(shoulderRight);

    // Bras
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.1, 1.2, 12);
    const armLeft = new THREE.Mesh(armGeometry, chromeMaterial);
    armLeft.position.set(-0.7, 0.5, 0);
    armLeft.rotation.z = 0.1;
    armLeft.castShadow = true;
    robotGroup.add(armLeft);

    const armRight = new THREE.Mesh(armGeometry, chromeMaterial);
    armRight.position.set(0.7, 0.5, 0);
    armRight.rotation.z = -0.1;
    armRight.castShadow = true;
    robotGroup.add(armRight);

    // Mains
    const handGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const handLeft = new THREE.Mesh(handGeometry, chromeMaterial);
    handLeft.position.set(-0.75, -0.15, 0);
    robotGroup.add(handLeft);

    const handRight = new THREE.Mesh(handGeometry, chromeMaterial);
    handRight.position.set(0.75, -0.15, 0);
    robotGroup.add(handRight);

    // Bassin
    const hipGeometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const hip = new THREE.Mesh(hipGeometry, chromeMaterial);
    hip.position.y = -0.2;
    hip.castShadow = true;
    robotGroup.add(hip);

    // Jambes
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1.5, 12);
    const legLeft = new THREE.Mesh(legGeometry, chromeMaterial);
    legLeft.position.set(-0.3, -1.2, 0);
    legLeft.castShadow = true;
    robotGroup.add(legLeft);

    const legRight = new THREE.Mesh(legGeometry, chromeMaterial);
    legRight.position.set(0.3, -1.2, 0);
    legRight.castShadow = true;
    robotGroup.add(legRight);

    // Pieds
    const footGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.4);
    const footLeft = new THREE.Mesh(footGeometry, chromeMaterial);
    footLeft.position.set(-0.3, -2, 0.1);
    footLeft.castShadow = true;
    robotGroup.add(footLeft);

    const footRight = new THREE.Mesh(footGeometry, chromeMaterial);
    footRight.position.set(0.3, -2, 0.1);
    footRight.castShadow = true;
    robotGroup.add(footRight);

    // Positionner le robot (décalé à droite sur desktop)
    robotGroup.position.set(isMobile ? 0 : 3, 0, 0);
    scene.add(robotGroup);

    // ✨ Particules flottantes
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = isMobile ? 30 : 80;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 15;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      const isBlue = Math.random() > 0.5;
      colors[i3] = isBlue ? 0.39 : 0.55;
      colors[i3 + 1] = isBlue ? 0.40 : 0.36;
      colors[i3 + 2] = isBlue ? 0.95 : 0.96;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 💡 Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Lumière principale (bleu)
    const mainLight = new THREE.PointLight(0x6366f1, 2, 20);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Lumière d'appoint (violet)
    const accentLight = new THREE.PointLight(0x8b5cf6, 1.5, 15);
    accentLight.position.set(-5, 3, 5);
    scene.add(accentLight);

    // Rim light (arrière)
    const rimLight = new THREE.PointLight(0x10b981, 1, 10);
    rimLight.position.set(0, 2, -5);
    scene.add(rimLight);

    // ⚡ Animation
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotation lente du robot
      robotGroup.rotation.y = Math.sin(time * 0.3) * 0.1;

      // Respiration (léger mouvement vertical)
      robotGroup.position.y = Math.sin(time * 2) * 0.05;

      // Pulse des yeux et du cœur
      const pulse = 1 + Math.sin(time * 3) * 0.2;
      eyeLeft.scale.setScalar(pulse);
      eyeRight.scale.setScalar(pulse);
      core.scale.setScalar(pulse);

      // Animation lumières
      mainLight.intensity = 2 + Math.sin(time * 2) * 0.5;
      accentLight.intensity = 1.5 + Math.cos(time * 1.5) * 0.3;

      // Particules flottantes
      particles.rotation.y = time * 0.05;
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i) * 0.001;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Repositionner le robot selon la taille
      if (width < 768) {
        robotGroup.position.x = 0;
        camera.position.set(0, 2, 12);
      } else {
        robotGroup.position.x = 3;
        camera.position.set(5, 2, 12);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #1a1f3a 0%, #0a0e27 50%, #000000 100%)'
      }}
    />
  );
}
