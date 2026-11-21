"use client";

import { useEffect, useRef, useState } from "react";

/** Procedural geometry only: no models, textures, or external visual assets. */
export function SpatialScene({ layer = 0 }: { layer?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const activeLayer = useRef(layer);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef(false);
  useEffect(() => {
    activeLayer.current = layer;
  }, [layer]);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};
    import("three")
      .then((THREE) => {
        if (disposed) return;
        let renderer: import("three").WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(8, 7, 10);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.AmbientLight(0xb9d5ff, 2.5));
        const key = new THREE.DirectionalLight(0xdceaff, 5);
        key.position.set(3, 8, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0x3478ff, 70);
        rim.position.set(-3, 2, -2);
        scene.add(rim);
        const system = new THREE.Group();
        scene.add(system);
        const panels: import("three").Mesh[] = [];
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: 0x182d50,
          metalness: 0.5,
          roughness: 0.35,
        });
        const blue = new THREE.MeshStandardMaterial({
          color: 0x508eff,
          emissive: 0x1957da,
          emissiveIntensity: 0.7,
          metalness: 0.3,
          roughness: 0.3,
        });
        const pale = new THREE.MeshStandardMaterial({
          color: 0x8eb3e8,
          metalness: 0.2,
          roughness: 0.4,
        });
        function box(
          w: number,
          h: number,
          d: number,
          x: number,
          y: number,
          z: number,
          material = baseMaterial,
        ) {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
          mesh.position.set(x, y, z);
          system.add(mesh);
          return mesh;
        }
        for (let i = 0; i < 3; i++) {
          const y = -1.35 + i * 1.35;
          const panel = box(4.5, 0.13, 3.4, 0, y, 0, baseMaterial.clone());
          panels.push(panel);
          const outline = new THREE.LineSegments(
            new THREE.EdgesGeometry(panel.geometry),
            new THREE.LineBasicMaterial({
              color: i === 2 ? 0x71acff : 0x35577d,
            }),
          );
          panel.add(outline);
          for (let j = 0; j < 3; j++) {
            box(
              0.86,
              0.1,
              0.75,
              -1.43 + j * 1.4,
              y + 0.13,
              -0.7,
              j === i ? blue : pale,
            );
            box(0.85, 0.05, 0.08, -1.43 + j * 1.4, y + 0.12, 0.02, pale);
            box(0.52, 0.05, 0.07, -1.59 + j * 1.4, y + 0.12, 0.21, pale);
          }
          box(3.65, 0.06, 0.12, 0, y + 0.13, 0.95, blue);
          for (let j = 0; j < 8; j++)
            box(0.14, 0.04, 0.12, -1.7 + j * 0.23, y + 0.15, 1.23, pale);
        }
        const railPoints = [
          new THREE.Vector3(2.7, -1.35, 0.8),
          new THREE.Vector3(3.1, -0.7, 0.8),
          new THREE.Vector3(3.1, 0.7, 0.8),
          new THREE.Vector3(2.7, 1.35, 0.8),
        ];
        const curve = new THREE.CatmullRomCurve3(railPoints);
        const rail = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 36, 0.018, 6, false),
          blue,
        );
        system.add(rail);
        const pulse = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 10, 8),
          blue,
        );
        system.add(pulse);
        const grid = new THREE.GridHelper(16, 24, 0x233a58, 0x14243c);
        grid.position.y = -2.1;
        scene.add(grid);
        let visible = true;
        let frame = 0;
        let time = 0;
        let lastFrame = 0;
        let renderedStatic = false;
        const pointer = { x: 0, y: 0 };
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const move = (event: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
          pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
        };
        const reset = () => {
          pointer.x = 0;
          pointer.y = 0;
        };
        const resize = () => {
          renderedStatic = false;
          const { width, height } = container.getBoundingClientRect();
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        const intersection = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });
        intersection.observe(container);
        container.addEventListener("pointermove", move);
        container.addEventListener("pointerleave", reset);
        const onLost = (event: Event) => {
          event.preventDefault();
          setReady(false);
        };
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        const animate = () => {
          frame = requestAnimationFrame(animate);
          if (!visible || document.hidden) {
            lastFrame = 0;
            return;
          }
          const isStatic = reduced.matches || pauseRef.current;
          if (isStatic && renderedStatic) return;
          const now = performance.now();
          const delta = lastFrame
            ? Math.min((now - lastFrame) / 1000, 0.05)
            : 0;
          lastFrame = now;
          if (!isStatic) {
            time += delta * 0.3;
            system.rotation.y += (pointer.x * 0.22 - system.rotation.y) * 0.035;
            system.rotation.z +=
              (-pointer.y * 0.05 - system.rotation.z) * 0.035;
            system.position.y = Math.sin(time) * 0.08;
            pulse.position.copy(curve.getPoint(time % 1));
          }
          panels.forEach((panel, index) => {
            const material =
              panel.material as import("three").MeshStandardMaterial;
            material.emissive.setHex(
              index === activeLayer.current % 3 ? 0x112d5b : 0x000000,
            );
          });
          renderer.render(scene, camera);
          renderedStatic = isStatic;
        };
        resize();
        animate();
        setReady(true);
        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          intersection.disconnect();
          container.removeEventListener("pointermove", move);
          container.removeEventListener("pointerleave", reset);
          renderer.domElement.removeEventListener("webglcontextlost", onLost);
          const materials = new Set<import("three").Material>();
          scene.traverse((object) => {
            const mesh = object as import("three").Mesh;
            mesh.geometry?.dispose();
            if (mesh.material)
              (Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material]
              ).forEach((m) => materials.add(m));
          });
          materials.forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        /* The HTML diagram remains available when WebGL cannot load. */
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="scene-shell">
      <div ref={host} className="scene-canvas" aria-hidden="true" />
      {!ready && (
        <div className="scene-fallback" aria-hidden="true">
          <div>Experience</div>
          <div>Intelligence</div>
          <div>Infrastructure</div>
        </div>
      )}
      <div className="scene-label label-top">
        EXPERIENCE <span>Web · Mobile · Portals</span>
      </div>
      <div className="scene-label label-bottom">
        CONNECTED BY DESIGN <span>One system. Built around you.</span>
      </div>
      {ready && (
        <button
          className="motion-control"
          type="button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? "Resume motion" : "Pause motion"}
        </button>
      )}
    </div>
  );
}
