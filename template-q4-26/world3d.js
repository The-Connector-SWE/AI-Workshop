// world3d.js — Three.js scenes for Template Q4-26.
//   World3D.createMap(el, opts)  -> level map: floating film-set islands + a walking director
//   World3D.createSolo(el, opts) -> one director on a podium (quiz reactions, rank up)
// Plain JS, depends on window.THREE (r149). Exports window.World3D.

(function () {
  const T = window.THREE;
  if (!T) return;

  const RED = 0xec1c24, NIGHT = 0x1e1e1e, HAIR = 0x1b1410, JEANS = 0x2b3a55, GREEN = 0x34c77b, GREY = 0x3a3a3a;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mat = (color, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.62, metalness: 0.05 }, extra || {}));

  /* ---------------- renderer + lights ---------------- */

  function stage(el, fov) {
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.fog = new T.Fog(0x0a0a0a, 18, 42);
    const camera = new T.PerspectiveCamera(fov || 35, 1, 0.1, 100);

    scene.add(new T.HemisphereLight(0xffffff, 0x2a0a0c, 0.55));
    const key = new T.DirectionalLight(0xffffff, 1.05);
    key.position.set(6, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -14, right: 14, top: 10, bottom: -10, near: 1, far: 40 });
    scene.add(key);
    const rim = new T.PointLight(RED, 1.4, 30);
    rim.position.set(-6, 4, -6);
    scene.add(rim);

    const size = () => {
      const w = el.clientWidth || 600, h = el.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      return { w, h };
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    return { renderer, scene, camera, size, ro };
  }

  function loop(tick) {
    let raf, last = performance.now(), alive = true;
    const f = (now) => {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tick(dt, now / 1000);
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }

  function dispose(s) {
    s.ro.disconnect();
    s.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    s.renderer.dispose();
    s.renderer.domElement.remove();
  }

  /* ---------------- the director ---------------- */

  function Director(avatar) {
    const a = Object.assign({ skin: "#d9a27c", jacket: "#ec1c24" }, avatar || {});
    const g = new T.Group();
    const skin = mat(a.skin), jacket = mat(a.jacket), jeans = mat(JEANS), dark = mat(0x111111), hair = mat(HAIR, { roughness: 0.8 });
    const shadowy = (m) => { m.castShadow = true; return m; };

    const leg = (x) => {
      const p = new T.Group(); p.position.set(x, 0.62, 0);
      const m = shadowy(new T.Mesh(new T.CapsuleGeometry(0.11, 0.36, 4, 10), jeans)); m.position.y = -0.3; p.add(m);
      const shoe = shadowy(new T.Mesh(new T.BoxGeometry(0.2, 0.1, 0.3), dark)); shoe.position.set(0, -0.56, 0.05); p.add(shoe);
      g.add(p); return p;
    };
    const legL = leg(-0.13), legR = leg(0.13);

    const torso = shadowy(new T.Mesh(new T.CapsuleGeometry(0.26, 0.34, 6, 14), jacket)); torso.position.y = 0.98; g.add(torso);
    const tee = new T.Mesh(new T.PlaneGeometry(0.2, 0.3), mat(0xf2f2f2)); tee.position.set(0, 1.02, 0.262); g.add(tee);

    const arm = (x) => {
      const p = new T.Group(); p.position.set(x, 1.2, 0);
      const m = shadowy(new T.Mesh(new T.CapsuleGeometry(0.085, 0.36, 4, 10), jacket)); m.position.y = -0.24; p.add(m);
      const hand = shadowy(new T.Mesh(new T.SphereGeometry(0.085, 12, 10), skin)); hand.position.y = -0.5; p.add(hand);
      g.add(p); return p;
    };
    const armL = arm(-0.36), armR = arm(0.36);

    // clapperboard in the right hand
    const clap = new T.Group(); clap.position.set(0, -0.56, 0.1); armR.add(clap);
    const board = shadowy(new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.03), dark)); clap.add(board);
    const top = new T.Group(); top.position.set(-0.17, 0.14, 0); clap.add(top);
    const stick = new T.Mesh(new T.BoxGeometry(0.34, 0.06, 0.032), dark); stick.position.x = 0.17; top.add(stick);
    for (let i = 0; i < 4; i++) { const s = new T.Mesh(new T.BoxGeometry(0.05, 0.062, 0.034), mat(0xffffff)); s.position.x = 0.04 + i * 0.09; s.rotation.z = 0.5; top.add(s); }
    const label = new T.Mesh(new T.PlaneGeometry(0.26, 0.04), mat(RED)); label.position.set(0, 0.02, 0.017); clap.add(label);

    const head = new T.Group(); head.position.y = 1.56; g.add(head);
    const neck = new T.Mesh(new T.CylinderGeometry(0.08, 0.09, 0.12, 10), skin); neck.position.y = -0.18; head.add(neck);
    const face = shadowy(new T.Mesh(new T.SphereGeometry(0.24, 20, 16), skin)); head.add(face);
    const hairM = new T.Mesh(new T.SphereGeometry(0.255, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairM.position.set(0, 0.03, -0.03); head.add(hairM);
    const eye = (x) => { const e = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), dark); e.position.set(x, 0.02, 0.22); head.add(e); return e; };
    const eyes = [eye(-0.08), eye(0.08)];
    const smile = new T.Mesh(new T.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), dark); smile.position.set(0, -0.08, 0.215); smile.rotation.z = Math.PI; head.add(smile);
    // director's cap, worn backwards
    const cap = new T.Mesh(new T.SphereGeometry(0.262, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(RED)); cap.position.y = 0.05; head.add(cap);
    const brim = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.025, 20, 1, false, 0, Math.PI), mat(RED)); brim.position.set(0, 0.1, -0.2); brim.rotation.y = Math.PI / 2; head.add(brim);

    const shadow = new T.Mesh(new T.CircleGeometry(0.42, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01;
    const root = new T.Group(); root.add(g); root.add(shadow);

    const st = { mode: "idle", t: 0, walk: 0, react: null, rt: 0 };
    root.userData = {
      setAvatar(b) { if (b.skin) skin.color.set(b.skin); if (b.jacket) jacket.color.set(b.jacket); },
      setWalking(on) { st.mode = on ? "walk" : st.mode === "walk" ? "idle" : st.mode; },
      react(kind) { st.react = kind; st.rt = 0; },
      update(dt, time) {
        st.t += dt;
        const k = reduced ? 0 : 1;
        if (st.mode === "walk") {
          st.walk += dt * 9;
          const s = Math.sin(st.walk) * 0.7 * k;
          legL.rotation.x = s; legR.rotation.x = -s; armL.rotation.x = -s * 0.8; armR.rotation.x = s * 0.5 - 0.3;
          g.position.y = Math.abs(Math.sin(st.walk)) * 0.06 * k;
        } else {
          legL.rotation.x *= 0.8; legR.rotation.x *= 0.8; armL.rotation.x *= 0.85;
          armR.rotation.x += (-0.35 - armR.rotation.x) * 0.15;
          g.position.y = Math.sin(time * 2) * 0.02 * k;
          head.rotation.y = Math.sin(time * 0.7) * 0.15 * k;
        }
        // blink
        const blink = (time % 3.4) < 0.12 ? 0.15 : 1;
        eyes.forEach((e) => { e.scale.y = blink; });
        // clapper snap
        top.rotation.z = -Math.max(0, Math.sin(time * 1.3)) * 0.35 * k;

        if (st.react) {
          st.rt += dt;
          const r = st.rt;
          if (st.react === "cheer" || st.react === "celebrate") {
            const n = st.react === "celebrate" ? 3 : 1, dur = 0.6 * n;
            const ph = (r % 0.6) / 0.6;
            g.position.y = Math.sin(ph * Math.PI) * 0.55 * k;
            armL.rotation.z = -2.6 * Math.sin(Math.min(r / 0.2, 1) * Math.PI / 2);
            armR.rotation.x = -2.8;
            if (st.react === "celebrate") g.rotation.y = r * 6 * k;
            if (r > dur) { st.react = null; armL.rotation.z = 0; g.rotation.y = 0; }
          } else if (st.react === "no") {
            head.rotation.y = Math.sin(r * 18) * 0.45 * (1 - r / 0.9) * k;
            armL.rotation.z = -0.5; armR.rotation.z = 0.5;
            if (r > 0.9) { st.react = null; head.rotation.y = 0; armL.rotation.z = 0; armR.rotation.z = 0; }
          }
        }
      },
    };
    return root;
  }

  /* ---------------- set pieces, one per level ---------------- */

  function prop(i) {
    const p = new T.Group();
    const dark = mat(0x111111), white = mat(0xf2f2f2), red = mat(RED), metal = mat(0x8a8a8a, { metalness: 0.6, roughness: 0.35 });
    const add = (geo, m, x, y, z, rx, ry, rz) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; p.add(o); return o; };
    switch (i % 6) {
      case 0: // brief: paper stack + idea bulb
        for (let k = 0; k < 4; k++) add(new T.BoxGeometry(0.7, 0.04, 0.9), white, 0, 0.04 + k * 0.045, 0, 0, k * 0.12, 0);
        add(new T.SphereGeometry(0.22, 18, 14), mat(0xfff1b8, { emissive: 0xffd76a, emissiveIntensity: 0.9 }), 0, 0.85, 0);
        add(new T.CylinderGeometry(0.1, 0.12, 0.16, 12), metal, 0, 0.58, 0);
        break;
      case 1: // pre-vis: storyboard easel with 4 panels
        add(new T.BoxGeometry(0.05, 1.3, 0.05), dark, -0.4, 0.62, -0.1, 0.12);
        add(new T.BoxGeometry(0.05, 1.3, 0.05), dark, 0.4, 0.62, -0.1, 0.12);
        add(new T.BoxGeometry(1.0, 0.75, 0.04), white, 0, 0.9, 0, -0.12);
        [[-0.23, 1.06], [0.23, 1.06], [-0.23, 0.74], [0.23, 0.74]].forEach(([x, y], k) => add(new T.PlaneGeometry(0.4, 0.27), mat(k === 1 ? RED : 0x2a2a2a), x, y, 0.03, -0.12));
        break;
      case 2: // visual crafting: stacked photo frames
        [0, 1, 2].forEach((k) => {
          add(new T.BoxGeometry(0.5, 0.7, 0.04), white, -0.35 + k * 0.35, 0.45 + k * 0.05, -k * 0.12, 0, -0.3 + k * 0.3, (k - 1) * 0.1);
          add(new T.PlaneGeometry(0.4, 0.58), mat([0x6e5a4a, RED, 0x2e7fc2][k]), -0.35 + k * 0.35, 0.45 + k * 0.05, -k * 0.12 + 0.025, 0, -0.3 + k * 0.3, (k - 1) * 0.1);
        });
        break;
      case 3: // motion: cinema camera on a tripod
        [-1, 0, 1].forEach((k) => add(new T.CylinderGeometry(0.025, 0.025, 1.0, 6), metal, k * 0.22, 0.45, k === 0 ? -0.2 : 0.1, k === 0 ? 0.35 : -0.15, 0, -k * 0.3));
        add(new T.BoxGeometry(0.6, 0.38, 0.32), dark, 0, 1.05, 0);
        add(new T.CylinderGeometry(0.11, 0.14, 0.3, 16), dark, 0, 1.05, 0.3, Math.PI / 2);
        add(new T.CylinderGeometry(0.2, 0.2, 0.06, 20), red, -0.15, 1.38, 0, Math.PI / 2, 0, Math.PI / 2);
        add(new T.CylinderGeometry(0.2, 0.2, 0.06, 20), red, 0.22, 1.38, 0, Math.PI / 2, 0, Math.PI / 2);
        break;
      case 4: // voice: studio microphone
        add(new T.CylinderGeometry(0.28, 0.32, 0.06, 20), dark, 0, 0.03, 0);
        add(new T.CylinderGeometry(0.03, 0.03, 1.0, 8), metal, 0, 0.55, 0);
        add(new T.CapsuleGeometry(0.14, 0.24, 6, 14), mat(0x2a2a2a, { metalness: 0.4 }), 0, 1.2, 0.06);
        add(new T.TorusGeometry(0.2, 0.02, 8, 24), red, 0, 1.15, 0.06);
        break;
      default: // full stack: director's chair
        add(new T.BoxGeometry(0.7, 0.05, 0.55), red, 0, 0.55, 0);
        add(new T.BoxGeometry(0.7, 0.32, 0.04), red, 0, 0.95, -0.27);
        [[-0.33, 0.25], [0.33, 0.25], [-0.33, -0.25], [0.33, -0.25]].forEach(([x, z]) => add(new T.BoxGeometry(0.05, 1.1, 0.05), mat(0x6b4a2f), x, 0.55, z, 0, 0, x > 0 ? 0.08 : -0.08));
        break;
    }
    return p;
  }

  function textSprite(lines, color) {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const x = c.getContext("2d");
    x.textAlign = "center";
    x.fillStyle = color || "#ec1c24";
    x.font = "600 34px ui-monospace, Menlo, monospace";
    x.fillText(lines[0], 256, 44);
    x.fillStyle = "#ffffff";
    x.font = "500 46px Outfit, 'Codec Pro', sans-serif";
    x.fillText(lines[1], 256, 98);
    const tex = new T.CanvasTexture(c);
    tex.encoding = T.sRGBEncoding;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set(3.8, 0.95, 1);
    return s;
  }

  /* ---------------- level map ---------------- */

  function createMap(el, opts) {
    const o = Object.assign({ levels: [], selected: 0, avatar: null, onSelect: () => {} }, opts);
    const S = stage(el, 32);
    const { scene, camera, renderer } = S;
    const n = o.levels.length;
    const spots = o.levels.map((_, i) => new T.Vector3((i - (n - 1) / 2) * 3.4, 0, i % 2 ? -1.3 : 1.1));

    const islands = [], rings = [];
    o.levels.forEach((lv, i) => {
      const g = new T.Group(); g.position.copy(spots[i]);
      const top = new T.Mesh(new T.CylinderGeometry(1.15, 1.15, 0.28, 40), mat(NIGHT));
      top.position.y = -0.14; top.receiveShadow = true; top.userData.index = i; g.add(top);
      const rock = new T.Mesh(new T.ConeGeometry(1.1, 1.3, 7), mat(0x141414, { flatShading: true }));
      rock.position.y = -0.93; rock.rotation.x = Math.PI; rock.userData.index = i; g.add(rock);
      const ring = new T.Mesh(new T.TorusGeometry(1.16, 0.035, 8, 64), new T.MeshStandardMaterial({ color: GREY, emissive: GREY, emissiveIntensity: 0.4 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.0; g.add(ring); rings.push(ring);
      const pr = prop(i); pr.position.set(0.45, 0, -0.35); pr.rotation.y = -0.5; g.add(pr);
      const label = textSprite([lv.code, lv.name]); label.position.set(0, -1.75, 0.6); g.add(label);
      g.userData = { base: spots[i].y, phase: i * 0.9 };
      scene.add(g); islands.push(g);
    });

    // dotted path between islands
    const dots = [];
    for (let i = 0; i < n - 1; i++) {
      const a = spots[i], b = spots[i + 1];
      for (let t = 0.3; t <= 0.71; t += 0.1) {
        const d = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), new T.MeshStandardMaterial({ color: GREY, emissive: GREY, emissiveIntensity: 0.3 }));
        d.position.lerpVectors(a, b, t); d.position.y = -0.05; d.userData.seg = i;
        scene.add(d); dots.push(d);
      }
    }

    const hero = Director(o.avatar);
    hero.position.copy(spots[o.selected] || spots[0]);
    hero.position.x -= 0.3; hero.position.z += 0.25;
    scene.add(hero);

    let current = o.selected, queue = [], statuses = o.levels.map((l) => l.status);
    const standAt = (i) => new T.Vector3(spots[i].x - 0.3, 0, spots[i].z + 0.25);

    const paint = () => {
      rings.forEach((r, i) => {
        const st = statuses[i];
        const c = i === current ? RED : st === "cleared" ? GREEN : GREY;
        r.material.color.setHex(c); r.material.emissive.setHex(c);
        r.material.emissiveIntensity = i === current ? 1.1 : st === "cleared" ? 0.7 : 0.35;
      });
      dots.forEach((d) => {
        const c = statuses[d.userData.seg] === "cleared" ? RED : GREY;
        d.material.color.setHex(c); d.material.emissive.setHex(c);
      });
      islands.forEach((g, i) => g.children.forEach((ch) => { if (ch.material && ch.material.opacity !== undefined && statuses[i] === "locked" && ch.type === "Sprite") ch.material.opacity = 0.55; }));
    };
    paint();

    const goTo = (i) => {
      if (i === current && !queue.length) return;
      const from = queue.length ? queue[queue.length - 1].i : current;
      const step = i > from ? 1 : -1;
      for (let k = from + step; step > 0 ? k <= i : k >= i; k += step) queue.push({ i: k, p: standAt(k) });
      current = i; paint();
    };

    // camera framing: wide enough to show every island
    const look = new T.Vector3();
    const frame = () => {
      const width = (n - 1) * 3.4 + 4;
      const dist = Math.max(11, (width / 2) / Math.tan((camera.fov * Math.PI) / 360) / Math.max(camera.aspect, 0.6) * 1.12);
      return dist;
    };
    let mouseX = 0, mouseY = 0;

    // picking
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    const pickables = islands.flatMap((g) => g.children.filter((c) => c.userData.index !== undefined));
    const pick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      return hit ? hit.object.userData.index : null;
    };
    const onMove = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5); mouseY = ((e.clientY - r.top) / r.height - 0.5);
      renderer.domElement.style.cursor = pick(e) !== null ? "pointer" : "default";
    };
    const onClick = (e) => { const i = pick(e); if (i !== null) { goTo(i); o.onSelect(i); } };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);

    const stop = loop((dt, time) => {
      islands.forEach((g, i) => { g.position.y = reduced ? 0 : Math.sin(time * 0.9 + g.userData.phase) * 0.08; });
      if (queue.length) {
        const tgt = queue[0].p, pos = hero.position;
        const dx = tgt.x - pos.x, dz = tgt.z - pos.z, dist = Math.hypot(dx, dz);
        hero.userData.setWalking(true);
        hero.rotation.y = Math.atan2(dx, dz);
        const sp = reduced ? 100 : 4.2 * dt;
        if (dist <= sp) { pos.x = tgt.x; pos.z = tgt.z; queue.shift(); }
        else { pos.x += (dx / dist) * sp; pos.z += (dz / dist) * sp; }
      } else {
        hero.userData.setWalking(false);
        hero.rotation.y += (0.35 - hero.rotation.y) * 0.08;
      }
      const isl = islands[Math.round((hero.position.x / 3.4) + (n - 1) / 2)] || islands[0];
      hero.position.y = isl.position.y;
      hero.userData.update(dt, time);

      const d = frame();
      look.x += (hero.position.x * 0.12 - look.x) * 0.05;
      camera.position.set(look.x + mouseX * 1.2, d * 0.62 - mouseY * 0.8, d * 0.82);
      camera.lookAt(look.x, -0.4, 0);
      renderer.render(scene, camera);
    });

    return {
      select: goTo,
      setStatuses(list) { statuses = list; paint(); },
      setAvatar(a) { hero.userData.setAvatar(a); },
      celebrate() { hero.userData.react("celebrate"); },
      dispose() {
        stop();
        renderer.domElement.removeEventListener("pointermove", onMove);
        renderer.domElement.removeEventListener("click", onClick);
        dispose(S);
      },
    };
  }

  /* ---------------- solo director (quiz, rank up) ---------------- */

  function createSolo(el, opts) {
    const o = Object.assign({ avatar: null, podium: true, celebrate: false }, opts);
    const S = stage(el, 30);
    const { scene, camera, renderer } = S;
    scene.fog = null;
    if (o.podium) {
      const base = new T.Mesh(new T.CylinderGeometry(0.95, 1.05, 0.3, 40), mat(NIGHT));
      base.position.y = -0.15; base.receiveShadow = true; scene.add(base);
      const ring = new T.Mesh(new T.TorusGeometry(0.97, 0.03, 8, 64), new T.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 1.1 }));
      ring.rotation.x = Math.PI / 2; scene.add(ring);
    }
    const hero = Director(o.avatar);
    hero.rotation.y = 0.35;
    scene.add(hero);
    camera.position.set(0, 1.6, 5.6);
    camera.lookAt(0, 0.85, 0);
    if (o.celebrate) setTimeout(() => hero.userData.react("celebrate"), 500);
    const stop = loop((dt, time) => {
      hero.userData.update(dt, time);
      renderer.render(scene, camera);
    });
    return {
      react: (k) => hero.userData.react(k),
      setAvatar: (a) => hero.userData.setAvatar(a),
      dispose() { stop(); dispose(S); },
    };
  }

  const supported = (() => {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  })();

  window.World3D = { createMap, createSolo, supported };
})();
