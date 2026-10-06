import * as THREE from "three";

/* Bone lengths shared with the IK solver (world units; character is ~1.75 tall). */
export const DIM = { hipsY: 0.81, thigh: 0.38, shin: 0.36, upper: 0.28, fore: 0.25 };

const std = (color, roughness = 0.6, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04, ...extra });

const cap = (r, total) => new THREE.CapsuleGeometry(r, Math.max(total - 2 * r, 0.001), 4, 12);
const sph = (r) => new THREE.SphereGeometry(r, 20, 14);

/**
 * Original stylised human, facing +Z. Built from a real bone hierarchy
 * (THREE.Bone) with rigid segments bound to each bone:
 * Root > Hips > Spine > Chest > Neck > Head, shoulders > arm > forearm > hand > fingers (2 bones each),
 * hips > upper leg > lower leg > foot.
 * Bone names follow the usual humanoid convention so a skinned GLB can be mapped later.
 */
export function buildHuman() {
  const M = {
    skin: std("#F2C6A0", 0.62),
    skinSh: std("#DDAE86", 0.66),
    hair: std("#0E1F36", 0.5),
    hoodie: std("#132C48", 0.74),
    hoodieDark: std("#0E2238", 0.78),
    pants: std("#0C1B2E", 0.82),
    pantsDark: std("#0A1626", 0.82),
    blue: std("#0B9AF0", 0.4, { emissive: "#0B9AF0", emissiveIntensity: 0.25 }),
    ice: std("#8CD6FF", 0.4),
    shoe: std("#F4F8FF", 0.5),
    eye: std("#FFFFFF", 0.25),
    pupil: std("#132C48", 0.2),
    glint: new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    mouth: std("#7A2F20", 0.5),
    blush: std("#FF8F7A", 0.9, { transparent: true, opacity: 0.32 }),
  };

  const root = new THREE.Group();
  root.name = "Root";
  const J = {};

  const bone = (name, parent, x = 0, y = 0, z = 0) => {
    const b = new THREE.Bone();
    b.name = name;
    b.position.set(x, y, z);
    parent.add(b);
    J[name] = b;
    return b;
  };
  const add = (geo, mat, parent, p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    parent.add(m);
    return m;
  };

  /* ---------- spine chain ---------- */
  const hips = bone("Hips", root, 0, DIM.hipsY, 0);
  const spine = bone("Spine", hips, 0, 0.07, 0);
  const chest = bone("Chest", spine, 0, 0.18, 0);
  const neck = bone("Neck", chest, 0, 0.22, 0);
  const head = bone("Head", neck, 0, 0.1, 0);

  add(sph(0.15), M.pants, hips, [0, 0, 0], [1.12, 0.78, 0.85]);                    // pelvis
  add(cap(0.15, 0.46), M.hoodie, chest, [0, -0.04, 0], [1.12, 1, 0.78]);            // hoodie torso
  add(new THREE.CylinderGeometry(0.168, 0.168, 0.045, 24), M.blue, chest, [0, -0.255, 0], [1.12, 1, 0.78]); // hem
  add(new THREE.TorusGeometry(0.085, 0.034, 10, 22), M.hoodieDark, chest, [0, 0.2, -0.01], [1.1, 1, 1], [Math.PI / 2, 0, 0]); // collar
  add(sph(0.1), M.hoodieDark, chest, [0, 0.17, -0.09], [1.2, 0.9, 0.7]);            // hood
  add(new THREE.BoxGeometry(0.008, 0.36, 0.006), M.blue, chest, [0, -0.05, 0.118]);  // zip accent
  [-1, 1].forEach((s) => {
    add(cap(0.007, 0.1), M.ice, chest, [s * 0.04, 0.09, 0.12], [1, 1, 1], [0.1, 0, 0]); // drawstrings
  });
  add(new THREE.CylinderGeometry(0.05, 0.058, 0.14, 14), M.skinSh, neck, [0, 0.04, 0]);

  /* ---------- head ---------- */
  const headG = new THREE.Group();
  headG.position.y = 0.16;
  head.add(headG);
  add(sph(0.21), M.skin, headG, [0, 0, 0], [1, 1.06, 0.98]);
  [-1, 1].forEach((s) => add(sph(0.04), M.skinSh, headG, [s * 0.205, -0.005, -0.005], [0.55, 1, 0.8]));
  add(new THREE.SphereGeometry(0.226, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52), M.hair, headG, [0, 0.005, -0.012], [1, 1.06, 1], [-0.55, 0, 0]);
  add(sph(0.07), M.hair, headG, [0.05, 0.2, 0.1], [1.3, 0.6, 1], [0, 0, -0.4]);
  add(new THREE.BoxGeometry(0.02, 0.012, 0.17), M.blue, headG, [0.07, 0.226, 0.02], [1, 1, 1], [-0.4, 0, -0.2]);

  const eyes = [];
  const pupils = [];
  [1, -1].forEach((s) => {
    const eg = new THREE.Group();
    eg.position.set(s * 0.085, 0.03, 0.19);
    headG.add(eg);
    add(sph(0.05), M.eye, eg, [0, 0, 0], [1, 1.2, 0.55]);
    const pg = new THREE.Group();
    eg.add(pg);
    add(sph(0.03), M.pupil, pg, [0, 0, 0.02], [1, 1.1, 0.5]);
    add(sph(0.009), M.glint, pg, [-0.01, 0.014, 0.036]);
    eyes.push(eg);
    pupils.push(pg);
    add(cap(0.009, 0.052), M.hair, headG, [s * 0.085, 0.105, 0.195], [1, 1, 0.6], [0, 0, Math.PI / 2 + s * 0.12]);
    add(sph(0.03), M.blush, headG, [s * 0.125, -0.05, 0.16], [1, 0.7, 0.3]);
  });
  add(sph(0.02), M.skinSh, headG, [0, -0.012, 0.205], [1, 0.9, 0.9]);

  const mouthG = new THREE.Group();
  mouthG.position.set(0, -0.062, 0.205);
  headG.add(mouthG);
  const smile = add(new THREE.TorusGeometry(0.048, 0.007, 8, 18, Math.PI), M.mouth, mouthG, [0, 0.01, 0], [1, 1, 1], [0, 0, Math.PI]);
  const mouthOpen = add(sph(0.035), M.mouth, mouthG, [0, -0.012, -0.004], [1, 0.75, 0.35]);
  mouthOpen.scale.setScalar(0.001);

  /* ---------- legs ---------- */
  [["L", 1], ["R", -1]].forEach(([n, s]) => {
    const up = bone(`${n}UpLeg`, hips, s * 0.085, -0.02, 0);
    const leg = bone(`${n}Leg`, up, 0, -DIM.thigh, 0);
    const foot = bone(`${n}Foot`, leg, 0, -DIM.shin, 0);
    add(cap(0.078, 0.4), M.pants, up, [0, -0.19, 0]);
    add(sph(0.07), M.pants, leg);
    add(cap(0.064, 0.38), M.pantsDark, leg, [0, -0.18, 0]);
    add(sph(0.058), M.pantsDark, foot);
    add(cap(0.05, 0.17), M.shoe, foot, [0, -0.012, 0.045], [1.1, 0.85, 1], [Math.PI / 2, 0, 0]);
    add(new THREE.BoxGeometry(0.105, 0.022, 0.19), M.blue, foot, [0, -0.052, 0.04]);
  });

  /* ---------- arms + hands ---------- */
  const fingers = {};
  [["L", 1], ["R", -1]].forEach(([n, s]) => {
    const sh = bone(`${n}Shoulder`, chest, s * 0.17, 0.14, 0);
    const arm = bone(`${n}Arm`, sh, s * 0.035, 0, 0);
    const fore = bone(`${n}Forearm`, arm, 0, -DIM.upper, 0);
    const hand = bone(`${n}Hand`, fore, 0, -DIM.fore, 0);

    add(sph(0.068), M.hoodie, arm);
    add(cap(0.054, 0.3), M.hoodie, arm, [0, -0.14, 0]);
    add(sph(0.05), M.hoodie, fore);
    add(cap(0.047, 0.27), M.hoodie, fore, [0, -0.125, 0]);
    add(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 14), M.blue, fore, [0, -0.225, 0]);

    // hand frame: fingers -Y, palm normal -Z, thumb on -X for the left hand
    const thumbSide = -s;
    add(cap(0.04, 0.095), M.skin, hand, [0, -0.048, 0], [1, 1, 0.5]);
    const fl = [];
    const lens = [0.036, 0.04, 0.037, 0.03];
    for (let i = 0; i < 4; i++) {
      const x = thumbSide * (0.027 - 0.018 * i);
      const lp = lens[i];
      const ld = lp * 0.85;
      const p = bone(`${n}Finger${i}A`, hand, x, -0.088, 0);
      const d = bone(`${n}Finger${i}B`, p, 0, -lp, 0);
      add(cap(0.0095, lp + 0.004), M.skin, p, [0, -lp / 2, 0]);
      add(cap(0.0088, ld + 0.004), M.skin, d, [0, -ld / 2, 0]);
      fl.push({ p, d });
    }
    const tp = bone(`${n}ThumbA`, hand, thumbSide * 0.04, -0.03, 0);
    tp.rotation.z = thumbSide * 0.6;
    const td = bone(`${n}ThumbB`, tp, 0, -0.035, 0);
    add(cap(0.011, 0.04), M.skin, tp, [0, -0.018, 0]);
    add(cap(0.0098, 0.034), M.skin, td, [0, -0.016, 0]);
    fingers[n] = { fingers: fl, thumb: { p: tp, d: td } };
  });

  return { root, J, eyes, pupils, smile, mouthOpen, fingers };
}

export function disposeRig(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
  });
}