import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Créer des cercles animés (particules)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;

      // Position aléatoire
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // Couleur (bleu/violet/vert)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        // Bleu primary
        colors[i3] = 0.39; // R
        colors[i3 + 1] = 0.40; // G
        colors[i3 + 2] = 0.95; // B
      } else if (colorChoice < 0.66) {
        // Violet secondary
        colors[i3] = 0.55;
        colors[i3 + 1] = 0.36;
        colors[i3 + 2] = 0.96;
      } else {
        // Vert accent
        colors[i3] = 0.06;
        colors[i3 + 1] = 0.73;
        colors[i3 + 2] = 0.51;
      }

      // Taille aléatoire
      sizes[i] = Math.random() * 3 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Matériau des particules
    const particlesMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Cercles concentriques (comme sur l'image)
    const createRing = (radius, color, opacity) => {
      const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      return ring;
    };

    const rings = [
      createRing(15, 0x6366f1, 0.15),
      createRing(20, 0x8b5cf6, 0.1),
      createRing(25, 0x10b981, 0.08),
    ];

    rings.forEach(ring => scene.add(ring));

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 1);
    pointLight.position.set(0, 0, 30);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Rotation des particules
      particles.rotation.y = time * 0.05;
      particles.rotation.x = time * 0.03;

      // Animation des cercles
      rings.forEach((ring, index) => {
        ring.rotation.z = time * (0.1 + index * 0.05);
        ring.scale.x = 1 + Math.sin(time + index) * 0.05;
        ring.scale.y = 1 + Math.sin(time + index) * 0.05;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      rings.forEach(ring => {
        ring.geometry.dispose();
        ring.material.dispose();
      });
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(to bottom right, #0a0e27, #1a1f3a)' }}
    />
  );
}
