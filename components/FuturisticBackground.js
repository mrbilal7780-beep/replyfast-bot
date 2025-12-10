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
    camera.position.z = 8;
    camera.position.y = 1;

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

    // ===================
    // ENHANCED LIGHTING
    // ===================
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 60);
    pointLight1.position.set(8, 8, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2.5, 60);
    pointLight2.position.set(-8, -5, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x22d3ee, 2, 60);
    pointLight3.position.set(0, 12, 0);
    scene.add(pointLight3);

    const spotLight = new THREE.SpotLight(0x6366f1, 1.5, 30, Math.PI / 6, 0.5);
    spotLight.position.set(5, 10, 5);
    scene.add(spotLight);

    // ===================
    // IMPROVED ROBOT
    // ===================
    const robotGroup = new THREE.Group();

    // Create environment map for chrome reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    scene.add(cubeCamera);

    // Enhanced chrome material
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 1.0,
      roughness: 0.05,
      envMapIntensity: 2
    });

    // Dark chrome material for contrast
    const darkChromeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a15,
      metalness: 0.95,
      roughness: 0.1
    });

    // Glowing material for accents
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.95
    });

    const purpleGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.9
    });

    // HEAD - More detailed
    const headGeometry = new THREE.SphereGeometry(0.9, 128, 128);
    const head = new THREE.Mesh(headGeometry, chromeMaterial);
    head.position.y = 2.2;
    robotGroup.add(head);

    // Head panel cuts (geometric details)
    const headPanelGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.3);
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Mesh(headPanelGeometry, darkChromeMaterial);
      panel.position.set(0, 2.5 - i * 0.25, 0.85);
      robotGroup.add(panel);
    }

    // Face visor
    const visorGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 64, 1, false, -Math.PI / 3, Math.PI / 1.5);
    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0a20,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x6366f1,
      emissiveIntensity: 0.1
    });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.rotation.x = Math.PI / 2;
    visor.rotation.z = Math.PI;
    visor.position.set(0, 2.1, 0.5);
    robotGroup.add(visor);

    // Eyes - More detailed with multiple layers
    const eyeOuterGeometry = new THREE.RingGeometry(0.12, 0.18, 32);
    const eyeInnerGeometry = new THREE.CircleGeometry(0.1, 32);
    const eyeCoreGeometry = new THREE.CircleGeometry(0.05, 32);

    [-0.22, 0.22].forEach((x) => {
      // Outer ring
      const outerRing = new THREE.Mesh(eyeOuterGeometry, purpleGlowMaterial);
      outerRing.position.set(x, 2.15, 0.88);
      robotGroup.add(outerRing);

      // Inner circle
      const inner = new THREE.Mesh(eyeInnerGeometry, glowMaterial);
      inner.position.set(x, 2.15, 0.885);
      robotGroup.add(inner);

      // Core
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(eyeCoreGeometry, coreMat);
      core.position.set(x, 2.15, 0.89);
      robotGroup.add(core);
    });

    // Neck with segments
    const neckSegments = 4;
    for (let i = 0; i < neckSegments; i++) {
      const neckGeometry = new THREE.CylinderGeometry(
        0.28 - i * 0.02,
        0.32 - i * 0.02,
        0.12,
        32
      );
      const neckPiece = new THREE.Mesh(neckGeometry, i % 2 === 0 ? chromeMaterial : darkChromeMaterial);
      neckPiece.position.y = 1.4 - i * 0.13;
      robotGroup.add(neckPiece);
    }

    // Shoulders - More angular and aggressive
    const shoulderGeometry = new THREE.BoxGeometry(2.6, 0.35, 0.9);
    const shoulders = new THREE.Mesh(shoulderGeometry, chromeMaterial);
    shoulders.position.y = 0.75;
    robotGroup.add(shoulders);

    // Shoulder accents
    [-1.1, 1.1].forEach((x) => {
      const accentGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.95);
      const accent = new THREE.Mesh(accentGeometry, darkChromeMaterial);
      accent.position.set(x, 0.75, 0);
      robotGroup.add(accent);

      // Shoulder lights
      const lightGeometry = new THREE.CircleGeometry(0.1, 32);
      const light = new THREE.Mesh(lightGeometry, glowMaterial);
      light.position.set(x, 0.75, 0.48);
      robotGroup.add(light);
    });

    // Torso with panels
    const torsoGeometry = new THREE.BoxGeometry(2.0, 1.6, 0.85);
    const torso = new THREE.Mesh(torsoGeometry, chromeMaterial);
    torso.position.y = -0.15;
    robotGroup.add(torso);

    // Chest reactor (arc reactor style)
    const reactorRings = [0.35, 0.28, 0.2, 0.12];
    reactorRings.forEach((radius, i) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.02, radius, 64);
      const mat = i % 2 === 0 ? glowMaterial : purpleGlowMaterial;
      const ring = new THREE.Mesh(ringGeo, mat.clone());
      ring.position.set(0, 0.1, 0.43 + i * 0.01);
      robotGroup.add(ring);
    });

    // Reactor core
    const reactorCoreGeo = new THREE.CircleGeometry(0.08, 32);
    const reactorCore = new THREE.Mesh(reactorCoreGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    reactorCore.position.set(0, 0.1, 0.47);
    robotGroup.add(reactorCore);

    // Chest panel lines
    for (let i = 0; i < 4; i++) {
      const lineGeo = new THREE.BoxGeometry(0.02, 0.6, 0.02);
      const line = new THREE.Mesh(lineGeo, purpleGlowMaterial);
      line.position.set(-0.6 + i * 0.4, -0.3, 0.44);
      robotGroup.add(line);
    }

    // Position robot
    robotGroup.position.set(3.5, -0.3, -2);
    robotGroup.rotation.y = -0.4;
    scene.add(robotGroup);

    // ===================
    // BOUNCING PARTICLES SYSTEM
    // ===================
    const particlesCount = 2500;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizesArray = new Float32Array(particlesCount);

    // Boundaries for bouncing
    const bounds = {
      x: 15,
      y: 12,
      z: 15
    };

    // Initialize particles with positions and velocities
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Random position within bounds
      posArray[i3] = (Math.random() - 0.5) * bounds.x * 2;
      posArray[i3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
      posArray[i3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      // Random velocity
      velocityArray[i3] = (Math.random() - 0.5) * 0.03;
      velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.03;
      velocityArray[i3 + 2] = (Math.random() - 0.5) * 0.03;

      // Colors: mix of cyan, purple, indigo, white
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        // Cyan
        colorsArray[i3] = 0.13;
        colorsArray[i3 + 1] = 0.83;
        colorsArray[i3 + 2] = 0.93;
      } else if (colorChoice < 0.5) {
        // Purple
        colorsArray[i3] = 0.55;
        colorsArray[i3 + 1] = 0.36;
        colorsArray[i3 + 2] = 0.97;
      } else if (colorChoice < 0.7) {
        // Indigo
        colorsArray[i3] = 0.39;
        colorsArray[i3 + 1] = 0.4;
        colorsArray[i3 + 2] = 0.95;
      } else if (colorChoice < 0.9) {
        // Pink
        colorsArray[i3] = 0.93;
        colorsArray[i3 + 1] = 0.38;
        colorsArray[i3 + 2] = 0.93;
      } else {
        // White
        colorsArray[i3] = 1;
        colorsArray[i3 + 1] = 1;
        colorsArray[i3 + 2] = 1;
      }

      // Random sizes
      sizesArray[i] = Math.random() * 0.08 + 0.02;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // ===================
    // FLOATING ORB PARTICLES (Larger, slower)
    // ===================
    const orbCount = 50;
    const orbs = [];
    const orbGeometry = new THREE.SphereGeometry(0.08, 16, 16);

    for (let i = 0; i < orbCount; i++) {
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x6366f1 : 0x22d3ee,
        transparent: true,
        opacity: 0.6
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      orb.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalOpacity: 0.4 + Math.random() * 0.4
      };
      scene.add(orb);
      orbs.push(orb);
    }

    // ===================
    // GRID FLOOR
    // ===================
    const gridHelper = new THREE.GridHelper(40, 60, 0x6366f1, 0x1a1a2e);
    gridHelper.position.y = -4;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.25;
    scene.add(gridHelper);

    // ===================
    // FLOATING RINGS AROUND ROBOT
    // ===================
    const rings = [];
    const ringConfigs = [
      { radius: 1.8, color: 0x6366f1, speed: 0.008, axis: 'x' },
      { radius: 2.2, color: 0x8b5cf6, speed: -0.006, axis: 'y' },
      { radius: 1.5, color: 0x22d3ee, speed: 0.01, axis: 'z' }
    ];

    ringConfigs.forEach((config) => {
      const ringGeometry = new THREE.TorusGeometry(config.radius, 0.015, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(3.5, 0.5, -2);
      ring.userData = config;
      scene.add(ring);
      rings.push(ring);
    });

    // ===================
    // CONNECTING LINES (between nearby particles)
    // ===================
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = 500;
    const linePositions = new Float32Array(maxConnections * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
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

      // Calculate world position of mouse
      raycaster.setFromCamera(mouseVec, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster.ray.intersectPlane(planeZ, mouseWorldPos);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ===================
    // ANIMATION LOOP
    // ===================
    let time = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Update bouncing particles
      const positions = particlesGeometry.attributes.position.array;

      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Update position based on velocity
        positions[i3] += velocityArray[i3];
        positions[i3 + 1] += velocityArray[i3 + 1];
        positions[i3 + 2] += velocityArray[i3 + 2];

        // Bounce off boundaries
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

        // Mouse interaction - particles flee from cursor
        if (mouseWorldPos) {
          const dx = positions[i3] - mouseWorldPos.x;
          const dy = positions[i3 + 1] - mouseWorldPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 3) {
            const force = (3 - dist) / 3 * 0.02;
            velocityArray[i3] += (dx / dist) * force;
            velocityArray[i3 + 1] += (dy / dist) * force;
          }
        }

        // Add slight randomness to keep movement interesting
        if (Math.random() < 0.001) {
          velocityArray[i3] += (Math.random() - 0.5) * 0.01;
          velocityArray[i3 + 1] += (Math.random() - 0.5) * 0.01;
          velocityArray[i3 + 2] += (Math.random() - 0.5) * 0.01;
        }

        // Damping to prevent runaway velocities
        velocityArray[i3] *= 0.999;
        velocityArray[i3 + 1] *= 0.999;
        velocityArray[i3 + 2] *= 0.999;
      }

      particlesGeometry.attributes.position.needsUpdate = true;

      // Update floating orbs (bounce)
      orbs.forEach((orb) => {
        orb.position.add(orb.userData.velocity);

        // Bounce
        if (Math.abs(orb.position.x) > 12) orb.userData.velocity.x *= -1;
        if (Math.abs(orb.position.y) > 10) orb.userData.velocity.y *= -1;
        if (Math.abs(orb.position.z) > 10) orb.userData.velocity.z *= -1;

        // Pulse opacity
        orb.material.opacity = orb.userData.originalOpacity + Math.sin(time * 2 + orb.position.x) * 0.2;
      });

      // Update connecting lines between nearby particles
      let lineIndex = 0;
      const linePos = lines.geometry.attributes.position.array;
      const connectionDistance = 2;

      for (let i = 0; i < Math.min(200, particlesCount) && lineIndex < maxConnections * 6; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < Math.min(200, particlesCount) && lineIndex < maxConnections * 6; j++) {
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

      // Robot animation
      robotGroup.rotation.y = -0.4 + Math.sin(time * 0.5) * 0.08;
      robotGroup.position.y = -0.3 + Math.sin(time * 0.8) * 0.15;

      // Rings animation
      rings.forEach((ring) => {
        ring.rotation[ring.userData.axis] += ring.userData.speed;
        ring.rotation.z += ring.userData.speed * 0.5;
      });

      // Camera follow mouse
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.8 + 1 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Lights animation
      pointLight1.position.x = 8 + Math.sin(time) * 3;
      pointLight1.position.y = 8 + Math.cos(time * 0.7) * 2;
      pointLight2.position.y = -5 + Math.sin(time * 0.5) * 3;
      pointLight3.intensity = 2 + Math.sin(time * 2) * 0.5;

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
