// world3d.js — Three.js scenes for Template Q4-26.
//   World3D.createMap(el, opts)       level map: floating film-set islands + a walking, named director
//   World3D.createSolo(el, opts)      one director on a podium (hero, guide, quiz, rank up, creator)
//   World3D.createCameraSet(el, opts) a small film set whose virtual camera performs a named move
//   World3D.createProp(el, opts)      one set piece on a turntable (toolkit)
// Plain JS, depends on window.THREE (r149). Exports window.World3D.

(function () {
  const T = window.THREE;
  if (!T) return;

  const RED = 0xec1c24, NIGHT = 0x1e1e1e, HAIR = 0x1b1410, JEANS = 0x2b3a55, GREEN = 0x34c77b, GREY = 0x3a3a3a;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mat = (color, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.62, metalness: 0.05 }, extra || {}));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

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
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    return { renderer, scene, camera, ro };
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

  function freeTree(root) {
    root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
  }
  function dispose(s) {
    s.ro.disconnect();
    freeTree(s.scene);
    s.renderer.dispose();
    s.renderer.domElement.remove();
  }

  /* ---------------- the director ---------------- */

  // avatar: { skin, jacket, body: "male" | "female" }   opts: { clapper, can }
  function Director(avatar, opts) {
    const a = Object.assign({ skin: "#d9a27c", jacket: "#ec1c24", body: "male" }, avatar || {});
    const o = Object.assign({ clapper: true, can: false }, opts || {});
    const female = a.body === "female";
    const g = new T.Group();
    const skin = mat(a.skin), jacket = mat(a.jacket), jeans = mat(JEANS), dark = mat(0x111111), hair = mat(HAIR, { roughness: 0.8 });
    const cast = (m) => { m.castShadow = true; return m; };

    const leg = (x) => {
      const p = new T.Group(); p.position.set(x, 0.62, 0);
      const m = cast(new T.Mesh(new T.CapsuleGeometry(female ? 0.1 : 0.11, 0.36, 4, 10), jeans)); m.position.y = -0.3; p.add(m);
      const shoe = cast(new T.Mesh(new T.BoxGeometry(0.2, 0.1, 0.3), female ? mat(0xf2f2f2) : dark)); shoe.position.set(0, -0.56, 0.05); p.add(shoe);
      g.add(p); return p;
    };
    const legL = leg(female ? -0.11 : -0.13), legR = leg(female ? 0.11 : 0.13);

    const torso = cast(new T.Mesh(new T.CapsuleGeometry(female ? 0.22 : 0.26, 0.34, 6, 14), jacket));
    torso.position.y = 0.98; g.add(torso);
    if (female) torso.scale.set(1, 1, 0.9);
    const tee = new T.Mesh(new T.PlaneGeometry(female ? 0.16 : 0.2, 0.3), mat(0xf2f2f2)); tee.position.set(0, 1.02, female ? 0.2 : 0.262); g.add(tee);

    const arm = (x) => {
      const p = new T.Group(); p.position.set(x, 1.2, 0);
      const m = cast(new T.Mesh(new T.CapsuleGeometry(female ? 0.075 : 0.085, 0.36, 4, 10), jacket)); m.position.y = -0.24; p.add(m);
      const hand = cast(new T.Mesh(new T.SphereGeometry(0.085, 12, 10), skin)); hand.position.y = -0.5; p.add(hand);
      g.add(p); return p;
    };
    const armL = arm(female ? -0.31 : -0.36), armR = arm(female ? 0.31 : 0.36);

    let top = null;
    if (o.clapper) {
      const clap = new T.Group(); clap.position.set(0, -0.56, 0.1); armR.add(clap);
      clap.add(cast(new T.Mesh(new T.BoxGeometry(0.34, 0.24, 0.03), dark)));
      top = new T.Group(); top.position.set(-0.17, 0.14, 0); clap.add(top);
      const stick = new T.Mesh(new T.BoxGeometry(0.34, 0.06, 0.032), dark); stick.position.x = 0.17; top.add(stick);
      for (let i = 0; i < 4; i++) { const s = new T.Mesh(new T.BoxGeometry(0.05, 0.062, 0.034), mat(0xffffff)); s.position.x = 0.04 + i * 0.09; s.rotation.z = 0.5; top.add(s); }
      const label = new T.Mesh(new T.PlaneGeometry(0.26, 0.04), mat(RED)); label.position.set(0, 0.02, 0.017); clap.add(label);
    }
    if (o.can) {
      const can = cast(new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.22, 18), mat(0x2fb3a8, { metalness: 0.4, roughness: 0.3 })));
      can.position.set(0, -0.58, 0.08); armR.add(can);
      const band = new T.Mesh(new T.CylinderGeometry(0.072, 0.072, 0.07, 18), mat(0xe8742c)); band.position.y = -0.02; can.add(band);
    }

    const head = new T.Group(); head.position.y = 1.56; g.add(head);
    const neck = new T.Mesh(new T.CylinderGeometry(0.08, 0.09, 0.12, 10), skin); neck.position.y = -0.18; head.add(neck);
    head.add(cast(new T.Mesh(new T.SphereGeometry(female ? 0.23 : 0.24, 20, 16), skin)));
    const crown = new T.Mesh(new T.SphereGeometry(female ? 0.25 : 0.255, 20, 16, 0, Math.PI * 2, 0, Math.PI * (female ? 0.62 : 0.55)), hair);
    crown.position.set(0, 0.03, -0.03); head.add(crown);
    if (female) {
      // long hair falling behind the shoulders, plus side locks and small earrings
      const back = cast(new T.Mesh(new T.CapsuleGeometry(0.2, 0.32, 6, 14), hair));
      back.position.set(0, -0.2, -0.1); back.scale.set(1.15, 1, 0.7); head.add(back);
      [-1, 1].forEach((sx) => {
        const lock = new T.Mesh(new T.CapsuleGeometry(0.06, 0.26, 4, 8), hair); lock.position.set(sx * 0.2, -0.14, 0.04); head.add(lock);
        const ear = new T.Mesh(new T.SphereGeometry(0.025, 8, 6), mat(RED, { emissive: RED, emissiveIntensity: 0.4 })); ear.position.set(sx * 0.235, -0.07, 0.02); head.add(ear);
      });
    }
    const eye = (x) => { const e = new T.Mesh(new T.SphereGeometry(0.032, 10, 8), dark); e.position.set(x, 0.02, female ? 0.21 : 0.22); head.add(e); return e; };
    const eyes = [eye(-0.08), eye(0.08)];
    const smile = new T.Mesh(new T.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), female ? mat(0xb5363b) : dark);
    smile.position.set(0, -0.08, female ? 0.205 : 0.215); smile.rotation.z = Math.PI; head.add(smile);
    // director's cap, worn backwards
    const cap = new T.Mesh(new T.SphereGeometry(female ? 0.252 : 0.262, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), mat(RED)); cap.position.y = 0.05; head.add(cap);
    const brim = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.025, 20, 1, false, 0, Math.PI), mat(RED)); brim.position.set(0, 0.1, -0.2); brim.rotation.y = Math.PI / 2; head.add(brim);

    const shadow = new T.Mesh(new T.CircleGeometry(0.42, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01;
    const root = new T.Group(); root.add(g); root.add(shadow);

    const st = { walking: false, walk: 0, react: null, rt: 0 };
    root.userData = {
      body: a.body,
      setColors(b) { if (b.skin) skin.color.set(b.skin); if (b.jacket) jacket.color.set(b.jacket); },
      setWalking(on) { st.walking = on; },
      react(kind) { st.react = kind; st.rt = 0; },
      update(dt, time) {
        const k = reduced ? 0 : 1;
        if (st.walking) {
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
        const blink = (time % 3.4) < 0.12 ? 0.15 : 1;
        eyes.forEach((e) => { e.scale.y = blink; });
        if (top) top.rotation.z = -Math.max(0, Math.sin(time * 1.3)) * 0.35 * k;

        if (!st.react) return;
        st.rt += dt;
        const r = st.rt;
        if (st.react === "cheer" || st.react === "celebrate") {
          const dur = st.react === "celebrate" ? 1.8 : 0.6;
          g.position.y = Math.sin(((r % 0.6) / 0.6) * Math.PI) * 0.55 * k;
          armL.rotation.z = -2.6 * Math.sin(Math.min(r / 0.2, 1) * Math.PI / 2);
          armR.rotation.x = -2.8;
          if (st.react === "celebrate") g.rotation.y = r * 6 * k;
          if (r > dur) { st.react = null; armL.rotation.z = 0; g.rotation.y = 0; }
        } else if (st.react === "no") {
          head.rotation.y = Math.sin(r * 18) * 0.45 * (1 - r / 0.9) * k;
          armL.rotation.z = -0.5; armR.rotation.z = 0.5;
          if (r > 0.9) { st.react = null; head.rotation.y = 0; armL.rotation.z = 0; armR.rotation.z = 0; }
        } else if (st.react === "wave") {
          armL.rotation.z = -2.5;
          armL.rotation.x = Math.sin(r * 12) * 0.35 * k;
          if (r > 1.6) { st.react = null; armL.rotation.z = 0; armL.rotation.x = 0; }
        }
      },
    };
    return root;
  }

  // Keeps one director in a scene and rebuilds it when the body type changes.
  function Cast(scene, avatar, opts) {
    let hero = Director(avatar, opts), cur = Object.assign({}, avatar);
    scene.add(hero);
    return {
      get hero() { return hero; },
      set(next) {
        next = Object.assign({}, cur, next);
        if ((next.body || "male") !== (cur.body || "male")) {
          const n = Director(next, opts);
          n.position.copy(hero.position); n.rotation.copy(hero.rotation);
          scene.remove(hero); freeTree(hero); scene.add(n); hero = n;
        } else hero.userData.setColors(next);
        cur = next;
        return hero;
      },
    };
  }

  /* ---------------- set pieces ---------------- */

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
      case 1: // pre-vis: storyboard easel
        add(new T.BoxGeometry(0.05, 1.3, 0.05), dark, -0.4, 0.62, -0.1, 0.12);
        add(new T.BoxGeometry(0.05, 1.3, 0.05), dark, 0.4, 0.62, -0.1, 0.12);
        add(new T.BoxGeometry(1.0, 0.75, 0.04), white, 0, 0.9, 0, -0.12);
        [[-0.23, 1.06], [0.23, 1.06], [-0.23, 0.74], [0.23, 0.74]].forEach(([x, y], k) => add(new T.PlaneGeometry(0.4, 0.27), mat(k === 1 ? RED : 0x2a2a2a), x, y, 0.03, -0.12));
        break;
      case 2: // visual crafting: photo frames
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

  function textSprite(lines, opts) {
    const o = Object.assign({ color: "#ec1c24", w: 3.8, h: 0.95, pill: false }, opts);
    const c = document.createElement("canvas");
    c.width = 512; c.height = 128;
    const x = c.getContext("2d");
    x.textAlign = "center";
    if (o.pill) {
      x.font = "600 46px Outfit, 'Codec Pro', sans-serif";
      const w = Math.min(500, x.measureText(lines[0]).width + 70);
      x.fillStyle = "rgba(20,20,20,.88)";
      x.beginPath(); x.roundRect ? x.roundRect(256 - w / 2, 22, w, 84, 42) : x.rect(256 - w / 2, 22, w, 84); x.fill();
      x.strokeStyle = "#ec1c24"; x.lineWidth = 4; x.stroke();
      x.fillStyle = "#ffffff"; x.fillText(lines[0], 256, 80);
    } else {
      x.fillStyle = o.color;
      x.font = "600 34px ui-monospace, Menlo, monospace";
      x.fillText(lines[0], 256, 44);
      x.fillStyle = "#ffffff";
      x.font = "500 46px Outfit, 'Codec Pro', sans-serif";
      x.fillText(lines[1] || "", 256, 98);
    }
    const tex = new T.CanvasTexture(c);
    tex.encoding = T.sRGBEncoding;
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
    s.renderOrder = 10;
    s.scale.set(o.w, o.h, 1);
    return s;
  }

  /* ---------------- level map ---------------- */

  function createMap(el, opts) {
    const o = Object.assign({ levels: [], selected: 0, avatar: null, vertical: false, onSelect: () => {} }, opts);
    const S = stage(el, 32);
    const V = o.vertical; // phones: islands zig-zag down the screen instead of across
    const { scene, camera, renderer } = S;
    scene.fog = new T.Fog(0x0a0a0a, 18, 42);
    const n = o.levels.length;
    const spots = o.levels.map((_, i) => V
      ? new T.Vector3(i % 2 ? 0.75 : -0.75, 0, (i - (n - 1) / 2) * 3.1)
      : new T.Vector3((i - (n - 1) / 2) * 3.4, 0, i % 2 ? -1.3 : 1.1));

    const islands = [], rings = [], labels = [];
    o.levels.forEach((lv, i) => {
      const g = new T.Group(); g.position.copy(spots[i]);
      const top = new T.Mesh(new T.CylinderGeometry(1.15, 1.15, 0.28, 40), mat(NIGHT));
      top.position.y = -0.14; top.receiveShadow = true; top.userData.index = i; g.add(top);
      const rock = new T.Mesh(new T.ConeGeometry(1.1, 1.3, 7), mat(0x141414, { flatShading: true }));
      rock.position.y = -0.93; rock.rotation.x = Math.PI; rock.userData.index = i; g.add(rock);
      const ring = new T.Mesh(new T.TorusGeometry(1.16, 0.035, 8, 64), new T.MeshStandardMaterial({ color: GREY, emissive: GREY, emissiveIntensity: 0.4 }));
      ring.rotation.x = Math.PI / 2; g.add(ring); rings.push(ring);
      const pr = prop(i); pr.position.set(0.45, 0, -0.35); pr.rotation.y = -0.5; g.add(pr);
      const label = textSprite([lv.code, lv.name], V ? { w: 3.9, h: 0.98 } : null);
      if (V) label.position.set(i % 2 ? -1.55 : 1.55, -0.3, 0.9); else label.position.set(0, -1.75, 0.6);
      g.add(label); labels.push(label);
      g.userData.phase = i * 0.9;
      scene.add(g); islands.push(g);
    });

    const dots = [];
    for (let i = 0; i < n - 1; i++) {
      for (let t = 0.3; t <= 0.71; t += 0.1) {
        const d = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), new T.MeshStandardMaterial({ color: GREY, emissive: GREY, emissiveIntensity: 0.3 }));
        d.position.lerpVectors(spots[i], spots[i + 1], t); d.position.y = -0.05; d.userData.seg = i;
        scene.add(d); dots.push(d);
      }
    }

    const standAt = (i) => new T.Vector3(spots[i].x - 0.3, 0, spots[i].z + 0.25);
    const cast = Cast(scene, o.avatar);
    cast.hero.position.copy(standAt(o.selected || 0));
    let tag = null;
    const setTag = (name) => {
      if (tag) { scene.remove(tag); freeTree(tag); tag = null; }
      if (name) { tag = textSprite([name], { pill: true, w: 2.4, h: 0.6 }); scene.add(tag); }
    };
    setTag(o.avatar && o.avatar.name);

    let current = o.selected || 0, queue = [], statuses = o.levels.map((l) => l.status);
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
      labels.forEach((l, i) => { l.material.opacity = statuses[i] === "locked" ? 0.55 : 1; });
    };
    paint();

    const goTo = (i) => {
      if (i === current && !queue.length) return;
      const from = queue.length ? queue[queue.length - 1].i : current;
      const step = i > from ? 1 : -1;
      for (let k = from + step; step > 0 ? k <= i : k >= i; k += step) queue.push({ i: k, p: standAt(k) });
      current = i; paint();
    };

    const look = new T.Vector3();
    const dist = () => {
      const width = (n - 1) * 3.4 + 4;
      return Math.max(11, (width / 2) / Math.tan((camera.fov * Math.PI) / 360) / Math.max(camera.aspect, 0.6) * 1.12);
    };
    let mouseX = 0, mouseY = 0;
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
      mouseX = (e.clientX - r.left) / r.width - 0.5; mouseY = (e.clientY - r.top) / r.height - 0.5;
      renderer.domElement.style.cursor = pick(e) !== null ? "pointer" : "default";
    };
    const onClick = (e) => { const i = pick(e); if (i !== null) { goTo(i); o.onSelect(i); } };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);

    const stop = loop((dt, time) => {
      const hero = cast.hero;
      islands.forEach((g) => { g.position.y = reduced ? 0 : Math.sin(time * 0.9 + g.userData.phase) * 0.08; });
      if (queue.length) {
        const tgt = queue[0].p, pos = hero.position;
        const dx = tgt.x - pos.x, dz = tgt.z - pos.z, d = Math.hypot(dx, dz);
        hero.userData.setWalking(true);
        hero.rotation.y = Math.atan2(dx, dz);
        const sp = reduced ? 100 : 4.2 * dt;
        if (d <= sp) { pos.x = tgt.x; pos.z = tgt.z; queue.shift(); }
        else { pos.x += (dx / d) * sp; pos.z += (dz / d) * sp; }
      } else {
        hero.userData.setWalking(false);
        hero.rotation.y += (0.35 - hero.rotation.y) * 0.08;
      }
      let isl = islands[0], best = Infinity;
      spots.forEach((p, k) => { const d2 = (p.x - hero.position.x) ** 2 + (p.z - hero.position.z) ** 2; if (d2 < best) { best = d2; isl = islands[k]; } });
      hero.position.y = isl.position.y;
      hero.userData.update(dt, time);
      if (tag) tag.position.set(hero.position.x, hero.position.y + 2.25, hero.position.z);

      if (V) {
        // whole trail in view: high, steep camera centred on the map
        const h = 7.6 / Math.tan((camera.fov * Math.PI) / 360) * 1.22;
        camera.position.set(mouseX * 0.6, h * 0.86, h * 0.5);
        camera.lookAt(0, -0.4, 0.4);
      } else {
        const d = dist();
        look.x += (hero.position.x * 0.12 - look.x) * 0.05;
        camera.position.set(look.x + mouseX * 1.2, d * 0.62 - mouseY * 0.8, d * 0.82);
        camera.lookAt(look.x, -0.4, 0);
      }
      renderer.render(scene, camera);
    });

    return {
      select: goTo,
      setStatuses(list) { statuses = list; paint(); },
      setAvatar(a) { cast.set(a); setTag(a && a.name); },
      celebrate() { cast.hero.userData.react("celebrate"); },
      dispose() {
        stop();
        renderer.domElement.removeEventListener("pointermove", onMove);
        renderer.domElement.removeEventListener("click", onClick);
        dispose(S);
      },
    };
  }

  /* ---------------- solo director ---------------- */

  function createSolo(el, opts) {
    const o = Object.assign({ avatar: null, podium: true, celebrate: false, wave: false, turntable: false, distance: 5.6 }, opts);
    const S = stage(el, 30);
    const { scene, camera, renderer } = S;
    if (o.podium) {
      const base = new T.Mesh(new T.CylinderGeometry(0.95, 1.05, 0.3, 40), mat(NIGHT));
      base.position.y = -0.15; base.receiveShadow = true; scene.add(base);
      const ring = new T.Mesh(new T.TorusGeometry(0.97, 0.03, 8, 64), new T.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 1.1 }));
      ring.rotation.x = Math.PI / 2; scene.add(ring);
    }
    const cast = Cast(scene, o.avatar);
    cast.hero.rotation.y = 0.35;
    camera.position.set(0, 1.6, o.distance || 5.6);
    camera.lookAt(0, 0.85, 0);
    if (o.celebrate) setTimeout(() => cast.hero.userData.react("celebrate"), 500);
    if (o.wave) setTimeout(() => cast.hero.userData.react("wave"), 400);
    let spin = 0, drag = null;
    const down = (e) => { drag = e.clientX; };
    const move = (e) => { if (drag !== null) { spin += (e.clientX - drag) * 0.01; drag = e.clientX; } };
    const up = () => { drag = null; };
    if (o.turntable) {
      renderer.domElement.style.cursor = "grab";
      renderer.domElement.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }
    const stop = loop((dt, time) => {
      const hero = cast.hero;
      if (o.turntable) { if (drag === null && !reduced) spin += dt * 0.5; hero.rotation.y = spin; }
      hero.userData.update(dt, time);
      renderer.render(scene, camera);
    });
    return {
      react: (k) => cast.hero.userData.react(k),
      setAvatar: (a) => { cast.set(a); },
      dispose() {
        stop();
        if (o.turntable) { renderer.domElement.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); }
        dispose(S);
      },
    };
  }

  /* ---------------- camera-move film set ---------------- */

  const FACE = new T.Vector3(0, 1.5, 0);
  const MOVES = {
    "Push-in": (t) => ({ pos: new T.Vector3(0.4, 1.5, 6 - 3.6 * t), at: FACE }),
    "Pull-out": (t) => ({ pos: new T.Vector3(0.4, 1.5, 2.2 + 4.8 * t), at: FACE }),
    "Pan": (t) => ({ pos: new T.Vector3(0, 1.4, 5), at: new T.Vector3(-2.6 + 5.2 * t, 1.2, 0) }),
    "Tilt": (t) => ({ pos: new T.Vector3(0, 1.0, 3), at: new T.Vector3(0, 0.1 + 1.5 * t, 0) }),
    "Orbit": (t) => { const a = -1.1 + 2.2 * t; return { pos: new T.Vector3(Math.sin(a) * 3.6, 1.6, Math.cos(a) * 3.6), at: new T.Vector3(0, 1.1, 0) }; },
    "Tracking": (t) => ({ pos: new T.Vector3(-2 + 4 * t, 1.4, 3.6), at: new T.Vector3(-2 + 4 * t, 1.2, 0), walk: true }),
    "Handheld": (t, time) => ({ pos: new T.Vector3(0.3 + Math.sin(time * 7) * 0.05, 1.5 + Math.sin(time * 9.3) * 0.04, 4.2), at: new T.Vector3(Math.sin(time * 5) * 0.06, 1.3, 0) }),
    "Static": () => ({ pos: new T.Vector3(0.4, 1.5, 4.6), at: new T.Vector3(0, 1.1, 0) }),
  };

  function createCameraSet(el, opts) {
    const o = Object.assign({ avatar: null, move: "Push-in", duration: 3 }, opts);
    const S = stage(el, 40);
    const { scene, camera, renderer } = S;
    scene.background = new T.Color(0x151515);
    // floor, back wall with a window of light, cafe table with the can
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), mat(0x2a2320)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 8), mat(0x3a302b)); wall.position.set(0, 4, -3); wall.receiveShadow = true; scene.add(wall);
    const win = new T.Mesh(new T.PlaneGeometry(2.2, 1.6), new T.MeshBasicMaterial({ color: 0xffe2b0 })); win.position.set(-2.4, 2.4, -2.98); scene.add(win);
    [-4, 4].forEach((x) => { const pl = new T.Mesh(new T.CylinderGeometry(0.25, 0.2, 0.5, 12), mat(0x6b4a2f)); pl.position.set(x, 0.25, -2); scene.add(pl); const leaf = new T.Mesh(new T.SphereGeometry(0.5, 10, 8), mat(0x2f5d3a, { flatShading: true })); leaf.position.set(x, 0.85, -2); scene.add(leaf); });
    const table = new T.Group(); table.position.set(1.1, 0, 0.2); scene.add(table);
    const tTop = new T.Mesh(new T.CylinderGeometry(0.6, 0.6, 0.05, 30), mat(0x6b4a2f)); tTop.position.y = 0.95; tTop.castShadow = true; tTop.receiveShadow = true; table.add(tTop);
    const tLeg = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.95, 10), mat(0x111111)); tLeg.position.y = 0.48; table.add(tLeg);
    const can = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.28, 20), mat(0x2fb3a8, { metalness: 0.4, roughness: 0.3 })); can.position.set(0.1, 1.12, 0.1); can.castShadow = true; table.add(can);
    const band = new T.Mesh(new T.CylinderGeometry(0.092, 0.092, 0.09, 20), mat(0xe8742c)); band.position.y = -0.02; can.add(band);
    const sun = new T.SpotLight(0xffd9a0, 1.2, 20, 0.6, 0.6); sun.position.set(-3, 5, 3); sun.castShadow = true; scene.add(sun);

    const actor = Director(o.avatar, { clapper: false, can: true });
    actor.rotation.y = 0.25;
    scene.add(actor);

    let move = o.move, t0 = performance.now() / 1000;
    const stop = loop((dt, time) => {
      const t = ease(Math.min(1, (time - t0) / o.duration));
      const m = (MOVES[move] || MOVES.Static)(reduced ? 1 : t, time);
      if (m.walk) { actor.position.x = -2 + 4 * (reduced ? 1 : t); actor.rotation.y = Math.PI / 2; actor.userData.setWalking(t < 1); }
      else { actor.position.x = 0; actor.rotation.y = 0.25; actor.userData.setWalking(false); }
      actor.userData.update(dt, time);
      camera.position.copy(m.pos);
      camera.lookAt(m.at);
      renderer.render(scene, camera);
    });
    return {
      play(name) { move = name; t0 = performance.now() / 1000; },
      setAvatar() {},
      dispose() { stop(); dispose(S); },
    };
  }

  /* ---------------- prop turntable ---------------- */

  function createProp(el, opts) {
    const o = Object.assign({ prop: 0 }, opts);
    const S = stage(el, 30);
    const { scene, camera, renderer } = S;
    const base = new T.Mesh(new T.CylinderGeometry(1.1, 1.2, 0.25, 40), mat(NIGHT));
    base.position.y = -0.13; base.receiveShadow = true; scene.add(base);
    const ring = new T.Mesh(new T.TorusGeometry(1.12, 0.03, 8, 64), new T.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 1.1 }));
    ring.rotation.x = Math.PI / 2; scene.add(ring);
    const holder = new T.Group(); scene.add(holder);
    let item = null;
    const setProp = (i) => {
      if (item) { holder.remove(item); freeTree(item); }
      item = prop(i); item.scale.setScalar(1.3); holder.add(item);
    };
    setProp(o.prop);
    camera.position.set(0, 1.8, 4.6);
    camera.lookAt(0, 0.7, 0);
    const stop = loop((dt) => {
      if (!reduced) holder.rotation.y += dt * 0.6;
      renderer.render(scene, camera);
    });
    return { setProp, dispose() { stop(); dispose(S); } };
  }

  const supported = (() => {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  })();

  window.World3D = { createMap, createSolo, createCameraSet, createProp, MOVES: Object.keys(MOVES), supported };
})();
