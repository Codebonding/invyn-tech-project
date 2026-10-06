import * as THREE from "three";
import { DIM } from "./humanRig";
import { aimBone, solveTwoBone } from "../../utils/ik";
import { FK_MAP, POSES, POSEQ, substate } from "./characterPoses";

/* Camera contract with the canvas (see CourseCharacter3D): fov 30, distance 5.04 -> 2.7 world units tall */
export const VIS_H = 2.7;
export const CAM_Y = 0.9;
export const CAM_Z = 5.04;

const { clamp } = THREE.MathUtils;
const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));
const wrapPI = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const AX = new THREE.Vector3(1, 0, 0);
const AY = new THREE.Vector3(0, 1, 0);
const AZ = new THREE.Vector3(0, 0, 1);
const tq = new THREE.Quaternion();
const addRot = (b, axis, ang) => b.quaternion.multiply(tq.setFromAxisAngle(axis, ang));

const V = {
  S: new THREE.Vector3(), E: new THREE.Vector3(), W: new THREE.Vector3(),
  up: new THREE.Vector3(), fo: new THREE.Vector3(), left: new THREE.Vector3(),
  pole: new THREE.Vector3(), fwd: new THREE.Vector3(), head: new THREE.Vector3(), look: new THREE.Vector3(),
};
const QIK = new THREE.Quaternion();

export function makeState(rig) {
  const fk = {};
  FK_MAP.forEach(([bn]) => { fk[bn] = rig.J[bn].quaternion.clone(); });
  return {
    fk, last: "", t0: 0, init: false, time: 0,
    yaw: -1.05, curl: { L: 0.35, R: 0.35 }, ik: 0, lookW: 0.55, lookYaw: 0, lookPitch: 0,
    legs: { lUp: -0.02, lLeg: 0.04, rUp: -0.02, rLeg: 0.04 },
    stride: 0, vel: 0, pushW: 0, mouth: 0, pupX: 0, pupY: 0,
    edge: -0.95, home: 0.75, tgt: new THREE.Vector3(), tgtInit: false,
    blinkIn: 3, blinkT: -1, rippleT: -1, measureT: 0,
    sub: "idle",
  };
}

/* Card position -> world units. env.getCanvasRect(), env.getCardRect() return DOMRect-likes. */
function measure(s, env) {
  const c = env.getCanvasRect();
  if (!c || !c.height) return;
  const card = env.getCardRect && env.getCardRect();
  const k = VIS_H / c.height;
  const homeDist = c.width < 240 ? 1.05 : 1.7;
  if (card) {
    const zContact = 0.15;
    const cx = c.left + c.width / 2;
    s.edge = (card.right - cx) * k * (CAM_Z - zContact) / CAM_Z;
  }
  s.home = Math.min(s.edge + homeDist, (c.width * k) / 2 - 0.35);
}

const HOLD_HOVER = { walkIn: 0.12, reach: 0.0, push: 0 };

function pushTravel(phase, sub, ms) {
  if (phase === "push") return 0.2 * easeOut(ms / 260);
  if (sub === "followThrough") return 0.2 + 0.06 * easeOut(ms / 150);
  if (sub === "reposition") return 0.26;
  return 0;
}

/**
 * One animation tick. phase = shared interaction phase from useCourseInteraction.
 * Everything (card transition and character) is driven by that same phase.
 */
export function step(s, rig, dt, phase, now, env) {
  const { J, root } = rig;
  s.time += dt;

  if (!s.init) { measure(s, env); root.position.x = s.home; s.init = true; }

  if (phase !== s.last) {
    s.last = phase;
    s.t0 = now;
    if (phase === "approach") measure(s, env); // measure BEFORE the card index changes
    if (phase === "push") s.rippleT = 0;
  }
  const ms = now - s.t0;
  const sub = substate(phase, ms);
  const P = POSES[sub];
  s.sub = sub;

  if (phase === "idle") {
    s.measureT -= dt;
    if (s.measureT < 0) { measure(s, env); s.measureT = 0.5; }
  }

  /* ---- 1. blend FK pose toward the current state's pose (this is the crossfade) ---- */
  const a = 1 - Math.exp(-P.k * dt);
  const aa = 1 - Math.exp(-P.ka * dt);
  FK_MAP.forEach(([bn, key]) => {
    s.fk[bn].slerp(POSEQ[sub][bn], key[0] === "l" || key[0] === "r" ? aa : a);
    J[bn].quaternion.copy(s.fk[bn]);
  });
  s.yaw = damp(s.yaw, P.yaw, P.k * 0.8, dt);
  ["lUp", "lLeg", "rUp", "rLeg"].forEach((n) => { s.legs[n] = damp(s.legs[n], P[n], P.k, dt); });
  s.curl.L = damp(s.curl.L, P.curlL, 9, dt);
  s.curl.R = damp(s.curl.R, P.curlR, 6, dt);
  s.ik = damp(s.ik, P.ik, P.ik > s.ik ? 13 : 6, dt);
  s.lookW = damp(s.lookW, P.lookW, 8, dt);
  s.mouth = damp(s.mouth, P.smile, 10, dt);
  s.pushW = damp(s.pushW, sub === "push" || sub === "followThrough" ? 1 : 0, 12, dt);

  /* ---- 2. locomotion: gait follows real travel speed, no rigid sliding ---- */
  const forwardSpeed = -s.vel;
  s.stride += forwardSpeed * dt * 7;
  const amp = clamp(Math.abs(s.vel) * 1.1, 0, 1) * 0.55;
  const sw = Math.sin(s.stride) * amp;
  const lUp = s.legs.lUp + sw;
  const rUp = s.legs.rUp - sw;
  const lKnee = s.legs.lLeg + Math.max(0, -Math.cos(s.stride)) * amp * 1.1;
  const rKnee = s.legs.rLeg + Math.max(0, Math.cos(s.stride)) * amp * 1.1;
  J.LUpLeg.rotation.set(lUp, 0, 0.02);
  J.RUpLeg.rotation.set(rUp, 0, -0.02);
  J.LLeg.rotation.x = lKnee;
  J.RLeg.rotation.x = rKnee;
  J.LFoot.rotation.x = -(lUp + lKnee);   // sole stays flat on the floor
  J.RFoot.rotation.x = -(rUp + rKnee);
  addRot(J.RArm, AX, sw);                // contralateral arm swing
  addRot(J.LArm, AX, -sw * (1 - s.ik));
  addRot(J.Spine, AX, Math.sin(s.time * 1.7) * 0.012 * (sub === "idle" ? 1 : 0.4)); // breathing
  if (P.wave) addRot(J.LForearm, AZ, Math.sin((ms / 1000) * 14) * 0.3);

  /* ---- 3. gaze: eyes lead, then head, neck, spine ---- */
  J.Head.getWorldPosition(V.head);
  if (P.look === "cam") V.look.set(0.4, 1.55, 4.5);
  else V.look.set(s.edge - 0.15, 1.1, 0.1);
  const dx = V.look.x - V.head.x, dy = V.look.y - V.head.y, dz = V.look.z - V.head.z;
  const tYaw = clamp(wrapPI(Math.atan2(dx, dz) - (s.yaw + P.spine[1])), -1, 1) * s.lookW;
  const tPitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.45, 0.45) * s.lookW;
  s.pupX = damp(s.pupX, clamp((tYaw - s.lookYaw) * 0.07, -0.016, 0.016), 25, dt);
  s.pupY = damp(s.pupY, clamp(-tPitch * 0.03, -0.01, 0.01), 20, dt);
  s.lookYaw = damp(s.lookYaw, tYaw, 9, dt);
  s.lookPitch = damp(s.lookPitch, tPitch, 9, dt);
  J.Neck.quaternion.identity();
  J.Head.quaternion.identity();
  addRot(J.Neck, AY, s.lookYaw * 0.35);
  addRot(J.Neck, AX, s.lookPitch * 0.4);
  addRot(J.Head, AY, s.lookYaw * 0.65 + Math.sin(s.time * 0.8) * 0.03 * (sub === "idle" ? 1 : 0));
  addRot(J.Head, AX, s.lookPitch * 0.6);
  addRot(J.Head, AZ, 0.12 * s.mouth);
  addRot(J.Spine, AY, s.lookYaw * 0.12);
  rig.pupils.forEach((p) => p.position.set(s.pupX, s.pupY, 0));

  /* ---- 4. root: walk in, plant the front foot, drive the body forward ---- */
  const travel = pushTravel(phase, sub, ms);
  let targetRoot = s.home;
  if (P.hold !== "home") {
    J.LArm.getWorldPosition(V.S);
    const shoulderDx = V.S.x - root.position.x;
    const goalX = s.edge + 0.035 + (P.hold === "walkIn" ? HOLD_HOVER.walkIn : P.hover) - travel;
    targetRoot = goalX + P.standoff - shoulderDx;
  }
  const prevX = root.position.x;
  root.position.x = damp(prevX, targetRoot, P.rootK, dt);
  s.vel = damp(s.vel, (root.position.x - prevX) / dt, 20, dt);
  root.rotation.y = s.yaw;
  root.position.y = sub === "success" ? Math.max(0, Math.sin(clamp(ms / 420, 0, 1) * Math.PI)) * 0.05 : 0;
  J.Hips.position.y = DIM.hipsY - s.pushW * 0.03 + Math.abs(Math.sin(s.stride)) * amp * 0.03;
  J.Hips.rotation.x = s.pushW * 0.06;
  root.updateMatrixWorld(true);

  /* ---- 5. IK: left arm solves toward a hand target pinned to the card edge ---- */
  if (s.ik > 0.02) {
    J.LHand.getWorldPosition(V.W);
    J.LArm.getWorldPosition(V.S);
    if (!s.tgtInit) { s.tgt.copy(V.W); s.tgtInit = true; }
    const hover = P.hold === "walkIn" ? HOLD_HOVER.walkIn : P.hover;
    s.tgt.x = damp(s.tgt.x, s.edge + 0.035 + hover - travel, 16, dt);
    s.tgt.y = damp(s.tgt.y, 1.1, 10, dt);
    s.tgt.z = V.S.z;                       // keep the arm in one plane toward the card

    V.left.set(1, 0, 0).applyQuaternion(root.quaternion);
    V.fwd.set(Math.sin(s.yaw), 0, Math.cos(s.yaw));
    V.pole.set(0, -1, 0).addScaledVector(V.fwd, -0.3);
    solveTwoBone(V.S, s.tgt, DIM.upper, DIM.fore, V.pole, V.E, V.W);
    V.up.subVectors(V.E, V.S).normalize();
    V.fo.subVectors(V.W, V.E).normalize();

    aimBone(J.LArm, V.up, V.left, QIK);
    J.LArm.quaternion.slerp(QIK, s.ik);
    J.LArm.updateMatrixWorld(true);
    aimBone(J.LForearm, V.fo, V.left, QIK);
    J.LForearm.quaternion.slerp(QIK, s.ik);
    J.LForearm.updateMatrixWorld(true);
  } else {
    s.tgtInit = false;
  }

  /* ---- 6. fingers ---- */
  ["L", "R"].forEach((n) => {
    const c = s.curl[n];
    const set = rig.fingers[n];
    set.fingers.forEach((f, i) => {
      f.p.rotation.x = c * 1.25 * [0.8, 1, 1.05, 1.1][i];
      f.d.rotation.x = c * 1.0;
    });
    set.thumb.p.rotation.x = c * 0.5;
    set.thumb.d.rotation.x = c * 0.6;
  });

  /* ---- 7. face, contact ripple, shadow ---- */
  s.blinkIn -= dt;
  if (s.blinkIn < 0) { s.blinkT = 0; s.blinkIn = 2.5 + Math.random() * 3; }
  let lid = 1;
  if (s.blinkT >= 0) {
    s.blinkT += dt;
    const u = clamp(s.blinkT / 0.16, 0, 1);
    lid = 1 - Math.sin(Math.PI * u) * 0.9;
    if (u >= 1) s.blinkT = -1;
  }
  rig.eyes.forEach((e) => { e.scale.y = lid; });
  rig.mouthOpen.scale.setScalar(0.001 + s.mouth * 0.9);
  rig.smile.scale.x = 1 + 0.25 * s.mouth;

  if (env.ring) {
    if (s.rippleT >= 0) {
      s.rippleT += dt;
      const u = s.rippleT / 0.55;
      env.ring.visible = u < 1;
      env.ring.position.set(s.tgt.x + 0.02, s.tgt.y + 0.05, s.tgt.z + 0.02);
      env.ring.scale.setScalar(0.4 + u * 2.4);
      env.ring.material.opacity = Math.max(0, (1 - u) * 0.8);
      if (u >= 1) s.rippleT = -1;
    } else env.ring.visible = false;
  }
  if (env.shadow) {
    env.shadow.position.x = root.position.x;
    const hop = root.position.y;
    env.shadow.scale.set(1.4 - hop * 2, 0.8 - hop, 1);
  }
}