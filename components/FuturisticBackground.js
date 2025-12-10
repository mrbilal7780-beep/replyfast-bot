import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030308, 1);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Enhanced Lighting - Much brighter
    const ambientLight = new THREE.AmbientLight(0x4444ff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 5, 80);
    pointLight1.position.set(8, 8, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 4, 80);
    pointLight2.position.set(-8, -5, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x22d3ee, 4, 80);
    pointLight3.position.set(0, 12, 0);
    scene.add(pointLight3);

    // Additional bright lights
    const pointLight4 = new THREE.PointLight(0xff6b6b, 3, 60);
    pointLight4.position.set(-10, 5, -5);
    scene.add(pointLight4);

    const pointLight5 = new THREE.PointLight(0x4ecdc4, 3, 60);
    pointLight5.position.set(10, -5, -5);
    scene.add(pointLight5);

    // ===================
    // BRIGHT BOUNCING PARTICLES - More particles, more brightness
    // ===================
    const particlesCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);

    const bounds = { x: 20, y: 16, z: 20 };

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      posArray[i3] = (Math.random() - 0.5) * bounds.x * 2;
      posArray[i3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
      posArray[i3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      velocityArray[i3] = (Math.random() - 0.5) * 0.05;
      velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.05;
      velocityArray[i3 + 2] = (Math.random() - 0.5) * 0.05;

      // Brighter color palette
      const colorChoice = Math.random();
      if (colorChoice < 0.25) {
        // Bright cyan
        colorsArray[i3] = 0.13; colorsArray[i3 + 1] = 0.93; colorsArray[i3 + 2] = 1.0;
      } else if (colorChoice < 0.45) {
        // Electric blue
        colorsArray[i3] = 0.39; colorsArray[i3 + 1] = 0.5; colorsArray[i3 + 2] = 1.0;
      } else if (colorChoice < 0.6) {
        // Bright purple
        colorsArray[i3] = 0.7; colorsArray[i3 + 1] = 0.4; colorsArray[i3 + 2] = 1.0;
      } else if (colorChoice < 0.75) {
        // Pure white (very bright)
        colorsArray[i3] = 1.0; colorsArray[i3 + 1] = 1.0; colorsArray[i3 + 2] = 1.0;
      } else if (colorChoice < 0.85) {
        // Hot pink
        colorsArray[i3] = 1.0; colorsArray[i3 + 1] = 0.4; colorsArray[i3 + 2] = 0.8;
      } else {
        // Bright gold
        colorsArray[i3] = 1.0; colorsArray[i3 + 1] = 0.85; colorsArray[i3 + 2] = 0.3;
      }

      // Variable sizes for depth effect
      sizesArray[i] = Math.random() * 0.08 + 0.04;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // ===================
    // GLOWING ORBS - Brighter and more
    // ===================
    const orbCount = 100;
    const orbs = [];
    const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);

    for (let i = 0; i < orbCount; i++) {
      const colorOptions = [0x6366f1, 0x22d3ee, 0x8b5cf6, 0xff6b6b, 0x4ecdc4, 0xffd93d];
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        transparent: true,
        opacity: 0.9
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 28
      );
      orb.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04
        ),
        originalOpacity: 0.6 + Math.random() * 0.4,
        pulseSpeed: 1 + Math.random() * 2
      };
      scene.add(orb);
      orbs.push(orb);
    }

    // ===================
    // BRIGHT STREAKS / LIGHT TRAILS
    // ===================
    const streakCount = 30;
    const streaks = [];

    for (let i = 0; i < streakCount; i++) {
      const streakGeometry = new THREE.BufferGeometry();
      const streakPoints = [];
      const trailLength = 15;
      const startX = (Math.random() - 0.5) * 30;
      const startY = (Math.random() - 0.5) * 20;
      const startZ = (Math.random() - 0.5) * 20;

      for (let j = 0; j < trailLength; j++) {
        streakPoints.push(startX, startY, startZ - j * 0.3);
      }

      streakGeometry.setAttribute('position', new THREE.Float32BufferAttribute(streakPoints, 3));

      const streakColors = [0x22d3ee, 0x6366f1, 0x8b5cf6, 0xffffff];
      const streakMaterial = new THREE.LineBasicMaterial({
        color: streakColors[Math.floor(Math.random() * streakColors.length)],
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });

      const streak = new THREE.Line(streakGeometry, streakMaterial);
      streak.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.08,
          Math.random() * 0.1 + 0.05
        ),
        trailLength
      };
      scene.add(streak);
      streaks.push(streak);
    }

    // ===================
    // GRID FLOOR - Subtle
    // ===================
    const gridHelper = new THREE.GridHelper(60, 80, 0x6366f1, 0x1a1a2e);
    gridHelper.position.y = -6;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    // ===================
    // CONNECTING LINES - More visible
    // ===================
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = 800;
    const linePositions = new Float32Array(maxConnections * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // ===================
    // MOUSE INTERACTION
    // ===================
    let mouseX = 0;
    let mouseY = 0;
    let mouseWorldPos = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseVec.set(mouseX, mouseY);
      raycaster.setFromCamera(mouseVec, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(planeZ, mouseWorldPos);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ===================
    // ANIMATION
    // ===================
    let time = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Update particles
      const positions = particlesGeometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        positions[i3] += velocityArray[i3];
        positions[i3 + 1] += velocityArray[i3 + 1];
        positions[i3 + 2] += velocityArray[i3 + 2];

        // Bounce
        if (positions[i3] > bounds.x || positions[i3] < -bounds.x) {
          velocityArray[i3] *= -1;
          positions[i3] = Math.max(-bounds.x, Math.min(bounds.x, positions[i3]));
        }
        if (positions[i3 + 1] > bounds.y || positions[i3 + 1] < -bounds.y) {
          velocityArray[i3 + 1] *= -1;
          positions[i3 + 1] = Math.max(-bounds.y, Math.min(bounds.y, positions[i3 + 1]));
        }
        if (positions[i3 + 2] > bounds.z || positions[i3 + 2] < -bounds.z) {
          velocityArray[i3 + 2] *= -1;
          positions[i3 + 2] = Math.max(-bounds.z, Math.min(bounds.z, positions[i3 + 2]));
        }

        // Mouse repel
        if (mouseWorldPos) {
          const dx = positions[i3] - mouseWorldPos.x;
          const dy = positions[i3 + 1] - mouseWorldPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 5) {
            const force = (5 - dist) / 5 * 0.03;
            velocityArray[i3] += (dx / dist) * force;
            velocityArray[i3 + 1] += (dy / dist) * force;
          }
        }

        // Damping
        velocityArray[i3] *= 0.998;
        velocityArray[i3 + 1] *= 0.998;
        velocityArray[i3 + 2] *= 0.998;
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      // Update orbs with pulsing effect
      orbs.forEach((orb) => {
        orb.position.add(orb.userData.velocity);
        if (Math.abs(orb.position.x) > 18) orb.userData.velocity.x *= -1;
        if (Math.abs(orb.position.y) > 14) orb.userData.velocity.y *= -1;
        if (Math.abs(orb.position.z) > 14) orb.userData.velocity.z *= -1;
        // Pulsing glow effect
        orb.material.opacity = orb.userData.originalOpacity + Math.sin(time * orb.userData.pulseSpeed) * 0.3;
        orb.scale.setScalar(1 + Math.sin(time * orb.userData.pulseSpeed * 0.5) * 0.2);
      });

      // Update streaks
      streaks.forEach((streak) => {
        streak.position.add(streak.userData.velocity);
        // Reset position when out of bounds
        if (streak.position.z > 20) {
          streak.position.z = -20;
          streak.position.x = (Math.random() - 0.5) * 30;
          streak.position.y = (Math.random() - 0.5) * 20;
        }
        if (Math.abs(streak.position.x) > 18 || Math.abs(streak.position.y) > 12) {
          streak.position.x = (Math.random() - 0.5) * 30;
          streak.position.y = (Math.random() - 0.5) * 20;
        }
      });

      // Update lines
      let lineIndex = 0;
      const linePos = lines.geometry.attributes.position.array;
      const connectionDistance = 3;

      for (let i = 0; i < Math.min(300, particlesCount) && lineIndex < maxConnections * 6; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < Math.min(300, particlesCount) && lineIndex < maxConnections * 6; j++) {
          const j3 = j * 3;
          const dx = positions[i3] - positions[j3];
          const dy = positions[i3 + 1] - positions[j3 + 1];
          const dz = positions[i3 + 2] - positions[j3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            linePos[lineIndex++] = positions[i3];
            linePos[lineIndex++] = positions[i3 + 1];
            linePos[lineIndex++] = positions[i3 + 2];
            linePos[lineIndex++] = positions[j3];
            linePos[lineIndex++] = positions[j3 + 1];
            linePos[lineIndex++] = positions[j3 + 2];
          }
        }
      }

      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.setDrawRange(0, lineIndex / 3);

      // Camera movement
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 1 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Animate lights for dynamic feel
      pointLight1.position.x = 8 + Math.sin(time) * 4;
      pointLight1.position.y = 8 + Math.cos(time * 0.7) * 3;
      pointLight2.position.y = -5 + Math.sin(time * 0.5) * 4;
      pointLight3.position.x = Math.sin(time * 0.3) * 8;
      pointLight4.position.z = -5 + Math.sin(time * 0.4) * 5;
      pointLight5.position.y = -5 + Math.cos(time * 0.6) * 5;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
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
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
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
