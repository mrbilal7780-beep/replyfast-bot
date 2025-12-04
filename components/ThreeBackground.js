import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef();
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration de la scène
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas: containerRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Créer des gratte-ciels
    const buildings = [];
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterials = [
      new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
      }),
      new THREE.MeshPhongMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
      }),
      new THREE.MeshPhongMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
      }),
    ];

    // Générer gratte-ciels
    for (let i = 0; i < 30; i++) {
      const height = Math.random() * 15 + 5;
      const width = Math.random() * 2 + 0.5;
      const depth = Math.random() * 2 + 0.5;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)]
      );

      building.position.x = (Math.random() - 0.5) * 60;
      building.position.y = height / 2 - 10;
      building.position.z = (Math.random() - 0.5) * 60;

      building.userData = {
        initialHeight: height,
        targetHeight: height,
        currentHeight: 0,
        buildSpeed: Math.random() * 0.05 + 0.01,
      };

      building.scale.y = 0;
      scene.add(building);
      buildings.push(building);
    }

    // Créer le gratte-ciel principal avec le logo "ReplyFast AI"
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(4, 20, 4),
      new THREE.MeshPhongMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.7,
        wireframe: false,
        emissive: 0x6366f1,
        emissiveIntensity: 0.2,
      })
    );
    mainBuilding.position.set(0, 0, -10);
    mainBuilding.userData = {
      initialHeight: 20,
      targetHeight: 20,
      currentHeight: 0,
      buildSpeed: 0.03,
    };
    mainBuilding.scale.y = 0;
    scene.add(mainBuilding);
    buildings.push(mainBuilding);

    // Créer un texte "RF" (ReplyFast) au sommet du building principal
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    context.fillStyle = '#10b981';
    context.font = 'bold 120px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('RF', 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
    });

    // Panneau avec logo au sommet
    const logoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      logoMaterial
    );
    logoPlane.position.set(0, 12, -10);
    scene.add(logoPlane);

    // Particules interactives
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.4,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Ajouter des lueurs sphériques (glows) autour des bâtiments
    const glowGeometry = new THREE.SphereGeometry(10, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.1,
    });
    const glow1 = new THREE.Mesh(glowGeometry, glowMaterial);
    glow1.position.set(0, 5, -10);
    scene.add(glow1);

    const glow2Geometry = new THREE.SphereGeometry(8, 32, 32);
    const glow2Material = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.15,
    });
    const glow2 = new THREE.Mesh(glow2Geometry, glow2Material);
    glow2.position.set(-15, 3, -15);
    scene.add(glow2);

    const glow3 = new THREE.Mesh(glow2Geometry.clone(), glow2Material.clone());
    glow3.position.set(15, 4, -20);
    scene.add(glow3);

    // Lumières améliorées
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 1.5);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 1.5);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x8b5cf6, 1);
    pointLight3.position.set(0, 15, -5);
    scene.add(pointLight3);

    // Gestion du mouvement de la souris
    const handleMouseMove = (event) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Gestion du redimensionnement
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation
    let buildingAnimationPhase = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // Animation des gratte-ciels (construction progressive)
      buildingAnimationPhase += 0.005;
      buildings.forEach((building, index) => {
        if (building.userData.currentHeight < building.userData.targetHeight) {
          building.userData.currentHeight += building.userData.buildSpeed;
          building.scale.y = building.userData.currentHeight / building.userData.initialHeight;
        }

        // Légère rotation
        building.rotation.y += 0.001;

        // Effet de pulsation subtile
        const pulse = Math.sin(buildingAnimationPhase + index) * 0.05;
        building.scale.x = 1 + pulse;
        building.scale.z = 1 + pulse;
      });

      // Animation des particules
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i].x;
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3 + 2] += particleVelocities[i].z;

        // Effet d'attraction vers la souris
        const mouseInfluence = 0.01;
        positions[i * 3] += mousePosition.current.x * mouseInfluence;
        positions[i * 3 + 1] += mousePosition.current.y * mouseInfluence;

        // Rebond aux limites
        if (Math.abs(positions[i * 3]) > 50) particleVelocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 50) particleVelocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 50) particleVelocities[i].z *= -1;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Rotation douce de la caméra basée sur la souris
      camera.position.x += (mousePosition.current.x * 5 - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.current.y * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotation des lumières
      const time = Date.now() * 0.001;
      pointLight1.position.x = Math.sin(time) * 15;
      pointLight1.position.z = Math.cos(time) * 15;
      pointLight2.position.x = Math.cos(time) * 15;
      pointLight2.position.z = Math.sin(time) * 15;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ opacity: 0.7 }}
    />
  );
}
