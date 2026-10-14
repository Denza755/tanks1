import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterCustomizationState } from '../types/uma';
import { RotateCw, Eye, Sun, Maximize2, RefreshCw, Layers } from 'lucide-react';

interface Viewport3DProps {
  customization: CharacterCustomizationState;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({ customization }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterRootRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Body parts & nodes references
  const nodesRef = useRef<{
    head?: THREE.Mesh;
    eyes?: THREE.Mesh;
    hair?: THREE.Group;
    beard?: THREE.Mesh;
    torso?: THREE.Mesh;
    waist?: THREE.Mesh;
    hips?: THREE.Mesh;
    leftArm?: THREE.Group;
    rightArm?: THREE.Group;
    leftLeg?: THREE.Group;
    rightLeg?: THREE.Group;
    armorChest?: THREE.Mesh;
    armorShoulders?: THREE.Group;
    armorLegs?: THREE.Mesh;
    armorBoots?: THREE.Group;
    armorGloves?: THREE.Group;
    armorHelm?: THREE.Mesh;
    weapon?: THREE.Group;
  }>({});

  // Interaction controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [animState, setAnimState] = useState<'idle' | 'combat' | 'cast' | 'walk'>('idle');
  const [lightPreset, setLightPreset] = useState<'tavern' | 'daylight' | 'dungeon' | 'studio'>('tavern');
  const [cameraView, setCameraView] = useState<'full' | 'face' | 'upper'>('full');

  // Mouse orbit
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const orbitRef = useRef({ theta: 0, phi: 0.1, distance: 3.2, targetY: 1.0 });

  // Lighting reference
  const lightsRef = useRef<{
    ambient?: THREE.AmbientLight;
    main?: THREE.DirectionalLight;
    fill?: THREE.PointLight;
    rim?: THREE.DirectionalLight;
  }>({});

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f141c);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 3.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment & Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const main = new THREE.DirectionalLight(0xffecd2, 1.4);
    main.position.set(2, 4, 3);
    main.castShadow = true;
    main.shadow.mapSize.width = 1024;
    main.shadow.mapSize.height = 1024;
    main.shadow.bias = -0.0005;
    scene.add(main);

    const fill = new THREE.PointLight(0xaad4ff, 0.8, 10);
    fill.position.set(-2, 2, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffa550, 0.9);
    rim.position.set(0, 2, -3);
    scene.add(rim);

    lightsRef.current = { ambient, main, fill, rim };

    // Pedestal Platform
    const pedestalGroup = new THREE.Group();
    const diskGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.12, 48);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      roughness: 0.7,
      metalness: 0.3
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.y = -0.06;
    disk.receiveShadow = true;
    pedestalGroup.add(disk);

    // Glowing Rune Ring
    const ringGeo = new THREE.RingGeometry(1.25, 1.35, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    pedestalGroup.add(ring);

    // Soft Grid pattern
    const grid = new THREE.GridHelper(4, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.01;
    pedestalGroup.add(grid);

    scene.add(pedestalGroup);

    // Build Character Rig
    const charRoot = new THREE.Group();
    scene.add(charRoot);
    characterRootRef.current = charRoot;

    buildCharacterRig(charRoot);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate) {
        orbitRef.current.theta += 0.008;
      }

      // Update camera from orbit coordinates
      const { theta, phi, distance, targetY } = orbitRef.current;
      const cx = distance * Math.cos(phi) * Math.sin(theta);
      const cy = targetY + distance * Math.sin(phi);
      const cz = distance * Math.cos(phi) * Math.cos(theta);
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, targetY, 0);

      // Procedural Idle / Stance animation
      animateCharacter(elapsedTime);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Lighting Preset
  useEffect(() => {
    const { ambient, main, fill, rim } = lightsRef.current;
    if (!ambient || !main || !fill || !rim) return;

    if (lightPreset === 'tavern') {
      ambient.color.setHex(0x3a2416);
      ambient.intensity = 0.8;
      main.color.setHex(0xffaa5e);
      main.intensity = 1.6;
      fill.color.setHex(0x5a3e7a);
      rim.color.setHex(0xffd580);
    } else if (lightPreset === 'daylight') {
      ambient.color.setHex(0xc0d8f0);
      ambient.intensity = 0.9;
      main.color.setHex(0xffffff);
      main.intensity = 1.5;
      fill.color.setHex(0x90b0d0);
      rim.color.setHex(0xa0d0ff);
    } else if (lightPreset === 'dungeon') {
      ambient.color.setHex(0x0a101a);
      ambient.intensity = 0.4;
      main.color.setHex(0xff6020);
      main.intensity = 1.8;
      fill.color.setHex(0x203050);
      rim.color.setHex(0x00d4ff);
    } else {
      ambient.color.setHex(0x404040);
      ambient.intensity = 0.8;
      main.color.setHex(0xf8fafc);
      main.intensity = 1.4;
      fill.color.setHex(0xdbeafe);
      rim.color.setHex(0x94a3b8);
    }
  }, [lightPreset]);

  // Update Camera View Preset
  useEffect(() => {
    if (cameraView === 'full') {
      orbitRef.current.distance = 3.2;
      orbitRef.current.targetY = 1.0;
      orbitRef.current.phi = 0.1;
    } else if (cameraView === 'face') {
      orbitRef.current.distance = 1.1;
      orbitRef.current.targetY = 1.62;
      orbitRef.current.phi = 0.05;
    } else if (cameraView === 'upper') {
      orbitRef.current.distance = 1.8;
      orbitRef.current.targetY = 1.35;
      orbitRef.current.phi = 0.08;
    }
  }, [cameraView]);

  // Build Procedural Humanoid Rig
  const buildCharacterRig = (root: THREE.Group) => {
    // Shared Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd6a382,
      roughness: 0.55,
      metalness: 0.05
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x2e86c1,
      roughness: 0.1,
      metalness: 0.1
    });

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x34495e,
      roughness: 0.35,
      metalness: 0.8
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd4ac0d,
      roughness: 0.4,
      metalness: 0.85
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x5c3822,
      roughness: 0.8,
      metalness: 0.1
    });

    // 1. Torso & Midsection
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.45, 16);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    torso.receiveShadow = true;
    root.add(torso);
    nodesRef.current.torso = torso;

    // Waist / Abdomen
    const waistGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.22, 16);
    const waist = new THREE.Mesh(waistGeo, skinMat);
    waist.position.y = 0.98;
    waist.castShadow = true;
    root.add(waist);
    nodesRef.current.waist = waist;

    // Pelvis / Hips
    const hipsGeo = new THREE.CylinderGeometry(0.19, 0.22, 0.2, 16);
    const hips = new THREE.Mesh(hipsGeo, skinMat);
    hips.position.y = 0.82;
    hips.castShadow = true;
    root.add(hips);
    nodesRef.current.hips = hips;

    // 2. Head & Neck
    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.15, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.5;
    root.add(neck);

    const headGeo = new THREE.SphereGeometry(0.17, 24, 24);
    headGeo.scale(1, 1.2, 1.05);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.68;
    head.castShadow = true;
    root.add(head);
    nodesRef.current.head = head;

    // Eyes
    const eyesGroup = new THREE.Group();
    const eyeGeo = new THREE.SphereGeometry(0.026, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.055, 1.7, 0.135);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.055, 1.7, 0.135);
    eyesGroup.add(leftEye, rightEye);
    root.add(eyesGroup);

    // 3. Hair Group
    const hairGroup = new THREE.Group();
    const hairGeo = new THREE.ConeGeometry(0.2, 0.35, 16);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.rotation.x = 0.2;
    hairMesh.position.set(0, 1.82, -0.04);
    hairGroup.add(hairMesh);
    root.add(hairGroup);
    nodesRef.current.hair = hairGroup;

    // 4. Arms
    const createArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      const sign = isLeft ? 1 : -1;
      armGroup.position.set(sign * 0.28, 1.4, 0);

      // Shoulder joint
      const shoulderGeo = new THREE.SphereGeometry(0.075, 12, 12);
      const shoulder = new THREE.Mesh(shoulderGeo, skinMat);
      armGroup.add(shoulder);

      // Upper arm
      const upperArmGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.28, 12);
      const upperArm = new THREE.Mesh(upperArmGeo, skinMat);
      upperArm.position.set(0, -0.15, 0);
      armGroup.add(upperArm);

      // Forearm & Hand
      const forearmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.26, 12);
      const forearm = new THREE.Mesh(forearmGeo, skinMat);
      forearm.position.set(0, -0.38, 0);
      armGroup.add(forearm);

      const handGeo = new THREE.BoxGeometry(0.06, 0.09, 0.04);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.set(0, -0.52, 0);
      armGroup.add(hand);

      return armGroup;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    root.add(leftArm, rightArm);
    nodesRef.current.leftArm = leftArm;
    nodesRef.current.rightArm = rightArm;

    // 5. Legs
    const createLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      const sign = isLeft ? 1 : -1;
      legGroup.position.set(sign * 0.12, 0.78, 0);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.095, 0.075, 0.38, 14);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.set(0, -0.2, 0);
      legGroup.add(thigh);

      // Calf
      const calfGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.38, 14);
      const calf = new THREE.Mesh(calfGeo, skinMat);
      calf.position.set(0, -0.55, 0);
      legGroup.add(calf);

      // Foot
      const footGeo = new THREE.BoxGeometry(0.09, 0.07, 0.2);
      const foot = new THREE.Mesh(footGeo, skinMat);
      foot.position.set(0, -0.74, 0.04);
      legGroup.add(foot);

      return legGroup;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    root.add(leftLeg, rightLeg);
    nodesRef.current.leftLeg = leftLeg;
    nodesRef.current.rightLeg = rightLeg;

    // 6. Armor / Wardrobe Meshes
    // Chest Armor
    const chestArmorGeo = new THREE.CylinderGeometry(0.26, 0.21, 0.48, 16);
    const armorChest = new THREE.Mesh(chestArmorGeo, armorMat);
    armorChest.position.y = 1.25;
    armorChest.castShadow = true;
    root.add(armorChest);
    nodesRef.current.armorChest = armorChest;

    // Pauldrons / Shoulders
    const shouldersGroup = new THREE.Group();
    const pauldronGeo = new THREE.SphereGeometry(0.12, 12, 12);
    pauldronGeo.scale(1.2, 0.8, 1.1);
    const leftPauldron = new THREE.Mesh(pauldronGeo, trimMat);
    leftPauldron.position.set(0.33, 1.45, 0);
    const rightPauldron = new THREE.Mesh(pauldronGeo, trimMat);
    rightPauldron.position.set(-0.33, 1.45, 0);
    shouldersGroup.add(leftPauldron, rightPauldron);
    root.add(shouldersGroup);
    nodesRef.current.armorShoulders = shouldersGroup;

    // Legs Armor (Greaves)
    const legsArmorGeo = new THREE.CylinderGeometry(0.21, 0.17, 0.5, 16);
    const armorLegs = new THREE.Mesh(legsArmorGeo, leatherMat);
    armorLegs.position.y = 0.65;
    root.add(armorLegs);
    nodesRef.current.armorLegs = armorLegs;

    // Helmet
    const helmGeo = new THREE.SphereGeometry(0.2, 20, 20);
    const armorHelm = new THREE.Mesh(helmGeo, armorMat);
    armorHelm.position.y = 1.7;
    root.add(armorHelm);
    nodesRef.current.armorHelm = armorHelm;

    // Weapons
    const weaponGroup = new THREE.Group();
    // Greatsword
    const bladeGeo = new THREE.BoxGeometry(0.06, 1.3, 0.015);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.2 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.55;

    const crossguardGeo = new THREE.BoxGeometry(0.28, 0.04, 0.04);
    const crossguard = new THREE.Mesh(crossguardGeo, trimMat);
    crossguard.position.y = -0.08;

    const hiltGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const hilt = new THREE.Mesh(hiltGeo, leatherMat);
    hilt.position.y = -0.22;

    weaponGroup.add(blade, crossguard, hilt);
    weaponGroup.position.set(0.48, 1.0, 0.2);
    weaponGroup.rotation.z = -0.2;
    root.add(weaponGroup);
    nodesRef.current.weapon = weaponGroup;
  };

  // Update Character appearance when state changes
  useEffect(() => {
    if (!characterRootRef.current) return;
    const { dna, wardrobe, colors, race } = customization;
    const nodes = nodesRef.current;

    // 1. DNA Scaling
    const height = dna.height ?? 0.5;
    const headSize = dna.headSize ?? 0.5;
    const upperMuscle = dna.upperMuscle ?? 0.5;
    const waistWidth = dna.waist ?? 0.5;
    const legsSize = dna.legsSize ?? 0.5;
    const armLength = dna.armLength ?? 0.5;

    // Height & Stature
    const heightFactor = 0.85 + height * 0.3; // 0.85 to 1.15
    characterRootRef.current.scale.set(1, heightFactor, 1);

    // Head
    if (nodes.head) {
      const headScale = 0.85 + headSize * 0.3;
      nodes.head.scale.set(headScale, headScale * 1.2, headScale * 1.05);
    }

    // Upper Torso / Muscle
    if (nodes.torso && nodes.armorChest) {
      const muscleScaleX = 0.85 + upperMuscle * 0.35;
      const muscleScaleZ = 0.85 + upperMuscle * 0.25;
      nodes.torso.scale.set(muscleScaleX, 1, muscleScaleZ);
      nodes.armorChest.scale.set(muscleScaleX * 1.05, 1, muscleScaleZ * 1.05);
    }

    // Waist
    if (nodes.waist) {
      const waistScale = 0.8 + waistWidth * 0.4;
      nodes.waist.scale.set(waistScale, 1, waistScale);
    }

    // Arms
    if (nodes.leftArm && nodes.rightArm) {
      const armScaleY = 0.85 + armLength * 0.3;
      nodes.leftArm.scale.set(1, armScaleY, 1);
      nodes.rightArm.scale.set(1, armScaleY, 1);
    }

    // Legs
    if (nodes.leftLeg && nodes.rightLeg) {
      const legScale = 0.85 + legsSize * 0.3;
      nodes.leftLeg.scale.set(1, legScale, 1);
      nodes.rightLeg.scale.set(1, legScale, 1);
    }

    // 2. Colors Application
    const skinHex = colors.Skin || '#d6a382';
    const hairHex = colors.Hair || '#3d2314';
    const gearPriHex = colors.GearPrimary || '#34495e';
    const gearSecHex = colors.GearSecondary || '#d4ac0d';

    if (nodes.head) (nodes.head.material as THREE.MeshStandardMaterial).color.set(skinHex);
    if (nodes.torso) (nodes.torso.material as THREE.MeshStandardMaterial).color.set(skinHex);
    if (nodes.waist) (nodes.waist.material as THREE.MeshStandardMaterial).color.set(skinHex);

    if (nodes.armorChest) (nodes.armorChest.material as THREE.MeshStandardMaterial).color.set(gearPriHex);
    if (nodes.armorHelm) (nodes.armorHelm.material as THREE.MeshStandardMaterial).color.set(gearPriHex);

    if (nodes.armorShoulders) {
      nodes.armorShoulders.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(gearSecHex);
        }
      });
    }

    if (nodes.hair) {
      nodes.hair.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(hairHex);
        }
      });
    }

    // 3. Wardrobe Toggles
    const helmEquipped = Boolean(wardrobe.Helmet && wardrobe.Helmet !== 'helm_none');
    if (nodes.armorHelm) nodes.armorHelm.visible = helmEquipped;
    if (nodes.hair) nodes.hair.visible = !helmEquipped; // hair hidden under closed helmet

    const shouldersEquipped = Boolean(wardrobe.Shoulders && wardrobe.Shoulders !== 'shoulders_none');
    if (nodes.armorShoulders) nodes.armorShoulders.visible = shouldersEquipped;

    // Wireframe mode
    if (sceneRef.current) {
      sceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.wireframe = wireframe;
        }
      });
    }
  }, [customization, wireframe]);

  // Procedural Animation
  const animateCharacter = (t: number) => {
    const nodes = nodesRef.current;
    if (!nodes.leftArm || !nodes.rightArm || !nodes.torso) return;

    if (animState === 'idle') {
      // Gentle breathing & arm sway
      const breath = Math.sin(t * 2) * 0.02;
      nodes.torso.scale.y = 1 + breath;
      nodes.leftArm.rotation.x = Math.sin(t * 1.5) * 0.05;
      nodes.rightArm.rotation.x = -Math.sin(t * 1.5) * 0.05;
      nodes.leftArm.rotation.z = 0.05 + breath * 0.5;
      nodes.rightArm.rotation.z = -0.05 - breath * 0.5;
      if (nodes.weapon) {
        nodes.weapon.position.y = 1.0 + breath;
        nodes.weapon.rotation.x = 0;
      }
    } else if (animState === 'combat') {
      // Battle ready stance
      nodes.leftArm.rotation.x = 0.4 + Math.sin(t * 3) * 0.03;
      nodes.leftArm.rotation.z = 0.2;
      nodes.rightArm.rotation.x = 0.6 + Math.sin(t * 3) * 0.03;
      nodes.rightArm.rotation.z = -0.3;
      if (nodes.weapon) {
        nodes.weapon.rotation.x = 0.5;
        nodes.weapon.rotation.z = -0.4;
      }
    } else if (animState === 'cast') {
      // Spellcasting raise hands
      const wave = Math.sin(t * 4) * 0.08;
      nodes.leftArm.rotation.x = -1.2 + wave;
      nodes.leftArm.rotation.z = 0.3;
      nodes.rightArm.rotation.x = -1.2 - wave;
      nodes.rightArm.rotation.z = -0.3;
    } else if (animState === 'walk') {
      // Walking swing
      const legStride = Math.sin(t * 4) * 0.35;
      if (nodes.leftLeg) nodes.leftLeg.rotation.x = legStride;
      if (nodes.rightLeg) nodes.rightLeg.rotation.x = -legStride;
      nodes.leftArm.rotation.x = -legStride * 0.6;
      nodes.rightArm.rotation.x = legStride * 0.6;
    }
  };

  // Mouse orbit handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    orbitRef.current.theta -= deltaX * 0.008;
    orbitRef.current.phi = Math.max(-0.2, Math.min(0.6, orbitRef.current.phi + deltaY * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    orbitRef.current.distance = Math.max(0.8, Math.min(5.0, orbitRef.current.distance + e.deltaY * 0.002));
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* 3D Viewport Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Viewport Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Camera Views */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 pointer-events-auto shadow-lg">
          <button
            onClick={() => setCameraView('full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'full' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Body
          </button>
          <button
            onClick={() => setCameraView('upper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'upper' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Torso
          </button>
          <button
            onClick={() => setCameraView('face')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              cameraView === 'face' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Face DNA
          </button>
        </div>

        {/* Viewport Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lighting Presets */}
          <div className="flex items-center bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800/80 shadow-lg text-xs">
            <Sun className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1" />
            <select
              value={lightPreset}
              onChange={(e) => setLightPreset(e.target.value as any)}
              className="bg-transparent text-slate-300 font-medium text-xs px-2 py-1 outline-none cursor-pointer"
            >
              <option value="tavern" className="bg-slate-900 text-slate-200">Fantasy Tavern</option>
              <option value="daylight" className="bg-slate-900 text-slate-200">Daylight Meadow</option>
              <option value="dungeon" className="bg-slate-900 text-slate-200">Dungeon Torch</option>
              <option value="studio" className="bg-slate-900 text-slate-200">Studio Neutral</option>
            </select>
          </div>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe"
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              wireframe ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Auto rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto Rotate Turntable"
            className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
              autoRotate ? 'bg-sky-500/20 border-sky-500/50 text-sky-400' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Stance & Animation Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 pointer-events-auto shadow-xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2">Pose</span>
          {(['idle', 'combat', 'cast', 'walk'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnimState(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                animState === mode
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Live Race Badge */}
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800/80 text-xs font-semibold text-slate-300 flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>UMA 3 DCA: <strong className="text-white">{customization.race}</strong></span>
        </div>
      </div>
    </div>
  );
};
