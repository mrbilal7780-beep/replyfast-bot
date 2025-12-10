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

    // Lighting
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

    // ===================
    // LOGO TEXT "RF" - Simple geometric representation
    // ===================
    const logoGroup = new THREE.Group();

    // Create "R" shape with boxes
    const rMaterial = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.3
    });

    // R - vertical bar
    const rVertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 0.3),
      rMaterial
    );
    rVertical.position.set(-1.5, 0, 0);
    logoGroup.add(rVertical);

    // R - top horizontal
    const rTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 0.3),
      rMaterial
    );
    rTop.position.set(-0.9, 1.1, 0);
    logoGroup.add(rTop);

    // R - middle horizontal
    const rMiddle = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.3, 0.3),
      rMaterial
    );
    rMiddle.position.set(-0.9, 0.1, 0);
    logoGroup.add(rMiddle);

    // R - curved part (simplified with boxes)
    const rCurve = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.3, 0.3),
      rMaterial
    );
    rCurve.position.set(-0.3, 0.6, 0);
    logoGroup.add(rCurve);

    // R - diagonal leg
    const rLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.5, 0.3),
      rMaterial
    );
    rLeg.rotation.z = -0.6;
    rLeg.position.set(-0.5, -0.8, 0);
    logoGroup.add(rLeg);

    // Create "F" shape
    const fMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x6366f1,
      emissiveIntensity: 0.3
    });

    // F - vertical bar
    const fVertical = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 0.3),
      fMaterial
    );
    fVertical.position.set(0.8, 0, 0);
    logoGroup.add(fVertical);

    // F - top horizontal
    const fTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.3, 0.3),
      fMaterial
    );
    fTop.position.set(1.45, 1.1, 0);
    logoGroup.add(fTop);

    // F - middle horizontal
    const fMiddleBar = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.3, 0.3),
      fMaterial
    );
    fMiddleBar.position.set(1.3, 0.1, 0);
    logoGroup.add(fMiddleBar);

    // Position logo to the right side
    logoGroup.position.set(4, 0, -2);
    logoGroup.rotation.y = -0.2;
    scene.add(logoGroup);

    // Glowing rings around logo
    const rings = [];
    const ringConfigs = [
      { radius: 2.5, color: 0x6366f1, speed: 0.005 },
      { radius: 3, color: 0x22d3ee, speed: -0.003 },
      { radius: 3.5, color: 0x8b5cf6, speed: 0.004 }
    ];

    ringConfigs.forEach((config) => {
      const ringGeometry = new THREE.TorusGeometry(config.radius, 0.02, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(4, 0, -2);
      ring.userData = config;
      scene.add(ring);
      rings.push(ring);
    });

    // ===================
    // BOUNCING PARTICLES SYSTEM
    // ===================
    const particlesCount = 3000;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const bounds = { x: 18, y: 14, z: 18 };

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      posArray[i3] = (Math.random() - 0.5) * bounds.x * 2;
      posArray[i3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
      posArray[i3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      velocityArray[i3] = (Math.random() - 0.5) * 0.04;
      velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.04;
      velocityArray[i3 + 2] = (Math.random() - 0.5) * 0.04;

      const colorChoice = Math.random();
      if (colorChoice < 0.35) {
        colorsArray[i3] = 0.13; colorsArray[i3 + 1] = 0.83; colorsArray[i3 + 2] = 0.93;
      } else if (colorChoice < 0.6) {
        colorsArray[i3] = 0.39; colorsArray[i3 + 1] = 0.4; colorsArray[i3 + 2] = 0.95;
      } else if (colorChoice < 0.8) {
        colorsArray[i3] = 0.55; colorsArray[i3 + 1] = 0.36; colorsArray[i3 + 2] = 0.97;
      } else {
        colorsArray[i3] = 1; colorsArray[i3 + 1] = 1; colorsArray[i3 + 2] = 1;
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // ===================
    // FLOATING ORBS
    // ===================
    const orbCount = 60;
    const orbs = [];
    const orbGeometry = new THREE.SphereGeometry(0.1, 16, 16);

    for (let i = 0; i < orbCount; i++) {
      const orbMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x6366f1 : 0x22d3ee,
        transparent: true,
        opacity: 0.7
      });
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      orb.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 24
      );
      orb.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        originalOpacity: 0.5 + Math.random() * 0.4
      };
      scene.add(orb);
      orbs.push(orb);
    }

    // ===================
    // GRID FLOOR
    // ===================
    const gridHelper = new THREE.GridHelper(50, 70, 0x6366f1, 0x1a1a2e);
    gridHelper.position.y = -5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // ===================
    // CONNECTING LINES
    // ===================
    const lineGeometry = new THREE.BufferGeometry();
    const maxConnections = 600;
    const linePositions = new Float32Array(maxConnections * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.12,
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
          if (dist < 4) {
            const force = (4 - dist) / 4 * 0.025;
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

      // Update orbs
      orbs.forEach((orb) => {
        orb.position.add(orb.userData.velocity);
        if (Math.abs(orb.position.x) > 15) orb.userData.velocity.x *= -1;
        if (Math.abs(orb.position.y) > 12) orb.userData.velocity.y *= -1;
        if (Math.abs(orb.position.z) > 12) orb.userData.velocity.z *= -1;
        orb.material.opacity = orb.userData.originalOpacity + Math.sin(time * 2 + orb.position.x) * 0.2;
      });

      // Update lines
      let lineIndex = 0;
      const linePos = lines.geometry.attributes.position.array;
      const connectionDistance = 2.5;

      for (let i = 0; i < Math.min(250, particlesCount) && lineIndex < maxConnections * 6; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < Math.min(250, particlesCount) && lineIndex < maxConnections * 6; j++) {
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

      // Animate logo
      logoGroup.rotation.y = -0.2 + Math.sin(time * 0.3) * 0.1;
      logoGroup.position.y = Math.sin(time * 0.5) * 0.3;

      // Animate rings
      rings.forEach((ring, i) => {
        ring.rotation.x = Math.sin(time * 0.5 + i) * 0.5;
        ring.rotation.y += ring.userData.speed;
        ring.rotation.z = Math.cos(time * 0.3 + i) * 0.3;
      });

      // Camera
      camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Lights
      pointLight1.position.x = 8 + Math.sin(time) * 3;
      pointLight2.position.y = -5 + Math.sin(time * 0.5) * 3;

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
