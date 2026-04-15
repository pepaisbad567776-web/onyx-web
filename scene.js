/* ================================================================
   ONYX — Interactive 3D companion (Three.js)
   Desktop only. Falls back to phone-chat-only on mobile.
   ================================================================ */

import * as THREE from 'three';

(function () {
  'use strict';

  var container = document.getElementById('onyx-3d');
  if (!container) return;

  // Skip 3D on mobile / small screens
  if (window.innerWidth < 960) { container.style.display = 'none'; return; }

  // === Renderer ===
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  // === Scene & Camera ===
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.2);

  // === Materials ===
  var bodyMat = new THREE.MeshStandardMaterial({
    color: 0x131313,
    metalness: 0.45,
    roughness: 0.58,
  });

  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    emissive: 0xc9a84c,
    emissiveIntensity: 0.35,
    metalness: 0.65,
    roughness: 0.3,
  });

  var eyeMatL = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    emissive: 0xc9a84c,
    emissiveIntensity: 0.9,
    metalness: 0.3,
    roughness: 0.35,
  });

  var eyeMatR = eyeMatL.clone();

  var visorMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.15,
    roughness: 0.9,
  });

  var coreMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    emissive: 0xc9a84c,
    emissiveIntensity: 1.0,
    metalness: 0.2,
    roughness: 0.5,
  });

  // === Build Onyx ===
  var onyx = new THREE.Group();

  // Body — capsule
  var body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.62, 1.5, 20, 32),
    bodyMat
  );
  onyx.add(body);

  // Gold accent ring — thin belt
  var ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.635, 0.01, 8, 56),
    goldMat
  );
  ring.position.y = -0.05;
  ring.rotation.x = Math.PI / 2;
  onyx.add(ring);

  // Second ring (subtle, upper)
  var ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.006, 8, 56),
    goldMat.clone()
  );
  ring2.material.emissiveIntensity = 0.15;
  ring2.position.y = 0.35;
  ring2.rotation.x = Math.PI / 2;
  onyx.add(ring2);

  // Visor — flattened sphere inset on face
  var visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 28, 18),
    visorMat
  );
  visor.position.set(0, 0.42, 0.28);
  visor.scale.set(0.92, 0.6, 0.22);
  onyx.add(visor);

  // Eyes
  var eyeBase = {
    lx: -0.2, ly: 0.5, lz: 0.58,
    rx: 0.2,  ry: 0.48, rz: 0.58,
  };

  var leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 18), eyeMatL);
  leftEye.position.set(eyeBase.lx, eyeBase.ly, eyeBase.lz);

  var rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 18), eyeMatR);
  rightEye.position.set(eyeBase.rx, eyeBase.ry, eyeBase.rz);

  onyx.add(leftEye, rightEye);

  // Core heartbeat
  var core = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), coreMat);
  core.position.set(0, -0.2, 0.6);
  onyx.add(core);

  // Status dot — top
  var statusMat = coreMat.clone();
  statusMat.emissiveIntensity = 0.4;
  var statusDot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), statusMat);
  statusDot.position.set(0, 1.37, 0);
  onyx.add(statusDot);

  // Ground glow disc
  var glowMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.035 });
  var groundGlow = new THREE.Mesh(new THREE.CircleGeometry(1.0, 32), glowMat);
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = -1.38;
  onyx.add(groundGlow);

  scene.add(onyx);

  // === Lighting ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.14));

  var keyLight = new THREE.PointLight(0xffffff, 0.7, 18);
  keyLight.position.set(2.5, 3, 4);
  scene.add(keyLight);

  var fillLight = new THREE.PointLight(0x7788aa, 0.22, 14);
  fillLight.position.set(-3, 0.5, 3);
  scene.add(fillLight);

  var underGlow = new THREE.PointLight(0xc9a84c, 0.4, 7);
  underGlow.position.set(0, -2.2, 1.5);
  scene.add(underGlow);

  var rimLight = new THREE.PointLight(0xc9a84c, 0.12, 10);
  rimLight.position.set(-2, 1, -2);
  scene.add(rimLight);

  // === Mouse tracking state ===
  var mouseX = 0, mouseY = 0;
  var targetX = 0, targetY = 0;

  document.addEventListener('mousemove', function (e) {
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // === Blink system (setTimeout, not frame-based) ===
  var isBlinking = false;

  function scheduleBlink() {
    var delay = (3 + Math.random() * 4) * 1000; // 3-7 sec
    setTimeout(function () {
      if (isBlinking) { scheduleBlink(); return; }
      isBlinking = true;
      leftEye.scale.y = 0.08;
      rightEye.scale.y = 0.08;
      setTimeout(function () {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
        isBlinking = false;
        scheduleBlink();
      }, 110);
    }, delay);
  }
  scheduleBlink();

  // === Resize ===
  function resize() {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  // === Animation loop ===
  var clock = new THREE.Clock();

  function animate() {
    var t = clock.getElapsedTime();

    // Smooth mouse lerp
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;

    // Breathing — subtle scale pulse
    var breathScale = 1 + Math.sin(t * 2.1) * 0.01;
    body.scale.y = breathScale;
    body.scale.x = 1 + Math.sin(t * 2.1 + Math.PI) * 0.004;
    body.scale.z = body.scale.x;

    // Subtle living sway
    onyx.rotation.z = Math.sin(t * 0.65) * 0.008;
    onyx.rotation.x = Math.sin(t * 0.45) * 0.004;

    // Eye tracking — follow cursor across entire page
    if (!isBlinking) {
      var tx = mouseX * 0.06;
      var ty = mouseY * 0.04;
      leftEye.position.x = eyeBase.lx + tx;
      leftEye.position.y = eyeBase.ly + ty;
      rightEye.position.x = eyeBase.rx + tx;
      rightEye.position.y = eyeBase.ry + ty;
    }

    // Camera parallax
    camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.018;
    camera.position.y += (0.15 + mouseY * 0.12 - camera.position.y) * 0.018;
    camera.lookAt(0, 0, 0);

    // Core heartbeat — double-pulse
    var hb1 = Math.max(0, Math.sin(t * 3.8));
    var hb2 = Math.max(0, Math.sin(t * 3.8 + 0.7)) * 0.6;
    var heartbeat = Math.max(hb1, hb2);
    coreMat.emissiveIntensity = 0.5 + heartbeat * 0.8;
    core.scale.setScalar(0.85 + heartbeat * 0.2);

    // Ground glow pulses with heartbeat
    glowMat.opacity = 0.025 + heartbeat * 0.015;

    // Status dot fade
    statusMat.emissiveIntensity = 0.2 + Math.sin(t * 1.3) * 0.25;

    // Eye emissive subtle pulse
    var eyePulse = 0.8 + Math.sin(t * 1.8) * 0.1;
    eyeMatL.emissiveIntensity = eyePulse;
    eyeMatR.emissiveIntensity = eyePulse;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
})();
