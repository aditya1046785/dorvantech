"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
export function GlassScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 8;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x93c5fd, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 4, 5);
    scene.add(light);
    const group = new THREE.Group();
    scene.add(group);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1,
    });
    const geometry = new THREE.TorusGeometry(1.5, 0.12, 12, 70);
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.set(i * 0.8, i * 0.6, 0.4);
      group.add(mesh);
    }
    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cube = new THREE.Mesh(cubeGeo, material);
    group.add(cube);
    const resize = new ResizeObserver(() => {
      const w = host.clientWidth,
        h = host.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    });
    resize.observe(host);
    let visible = true;
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    observer.observe(host);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (!reduced.matches) {
        group.rotation.y += 0.003;
        group.rotation.z += 0.001;
      }
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      geometry.dispose();
      cubeGeo.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="adm-scene" ref={ref} aria-hidden="true">
      <span>◇</span>
    </div>
  );
}
