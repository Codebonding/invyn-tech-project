import * as THREE from "three";
import { courseTimeline as T } from "../../utils/animation";

const HALF = Math.PI / 2;
const D = (x = 0, y = 0, z = 0) => [x, y, z];

/* Bones driven by the FK pose table: [bone name, pose key] */
export const FK_MAP = [
  ["Spine", "spine"], ["Chest", "chest"],
  ["LArm", "lArm"], ["LForearm", "lFore"], ["LHand", "lHand"],
  ["RArm", "rArm"], ["RForearm", "rFore"], ["RHand", "rHand"],
];

/* Hand rest (palm toward thigh): left = +90deg about Y, right = -90deg.
   Hand push pose (fingers up, palm to card): -90deg about X in the IK forearm frame. */
const BASE = {
  yaw: -1.05,
  spine: D(0.02), chest: D(),
  lArm: D(0.05, 0, 0.09), lFore: D(-0.2), lHand: D(0, HALF, 0),
  rArm: D(0.05, 0, -0.09), rFore: D(-0.2), rHand: D(0, -HALF, 0),
  lUp: -0.02, lLeg: 0.04, rUp: -0.02, rLeg: 0.04,
  curlL: 0.35, curlR: 0.35,
  ik: 0, lookW: 0.55, look: "card",
  k: 6, ka: 6, rootK: 2.6, hold: "home", hover: 0, standoff: 0.46, smile: 0, wave: false,
};
const mk = (o) => ({ ...BASE, ...o });

export const POSES = {
  idle: mk({}),
  // head and eyes react first
  look: mk({ lookW: 1, k: 9, yaw: -1.1 }),
  // body turns toward the card
  turn: mk({ lookW: 1, k: 8, yaw: -1.38, spine: D(0.03, -0.06), lArm: D(-0.12, 0, 0.1), lFore: D(-0.45) }),
  // step in, arm lifts with a bent elbow
  approach: mk({
    lookW: 1, k: 7, ka: 8, yaw: -1.42, spine: D(0.07, -0.08), chest: D(0.03),
    lArm: D(-0.8, 0, 0.12), lFore: D(-0.7), lHand: D(-HALF * 0.7, 0.5, 0),
    rArm: D(0.2, 0, -0.1), lUp: -0.15, lLeg: 0.1, rUp: 0.1,
    curlL: 0.05, ik: 0.45, hold: "walkIn", rootK: 6, hover: 0.12,
  }),
  // arm extends, wrist rotates, palm turns to the card, fingers open
  reach: mk({
    lookW: 1, k: 9, ka: 11, yaw: -1.45, spine: D(0.12, -0.12), chest: D(0.05),
    lArm: D(-1.3, 0, 0.1), lFore: D(-0.3), lHand: D(-HALF, 0, 0),
    rArm: D(0.15, 0, -0.12), lUp: -0.3, lLeg: 0.2, rUp: 0.22, rLeg: 0.1,
    curlL: -0.12, ik: 0.9, hold: "reach", rootK: 10, hover: 0.05,
  }),
  // palm meets the card edge
  touch: mk({
    lookW: 1, k: 10, ka: 14, yaw: -1.45, spine: D(0.15, -0.14), chest: D(0.07),
    lArm: D(-1.3, 0, 0.1), lFore: D(-0.3), lHand: D(-HALF, 0, 0),
    rArm: D(0.15, 0, -0.12), lUp: -0.34, lLeg: 0.24, rUp: 0.26, rLeg: 0.1,
    curlL: 0.04, ik: 1, hold: "reach", rootK: 10, hover: 0,
  }),
  // full-body push: front foot planted, rear leg drives, spine and chest lean
  push: mk({
    lookW: 1, k: 14, ka: 16, yaw: -1.5, spine: D(0.26, -0.16), chest: D(0.14),
    lArm: D(-1.3, 0, 0.1), lFore: D(-0.3), lHand: D(-HALF, 0, 0),
    rArm: D(0.22, 0, -0.14), lUp: -0.46, lLeg: 0.34, rUp: 0.36, rLeg: 0.06,
    curlL: 0.1, ik: 1, hold: "push", rootK: 12, standoff: 0.44,
  }),
  // hand follows the card briefly, body settles
  followThrough: mk({
    lookW: 1, k: 6, ka: 7, yaw: -1.4, spine: D(0.17, -0.1), chest: D(0.08),
    lArm: D(-1.2, 0, 0.1), lFore: D(-0.35), lHand: D(-HALF, 0, 0),
    lUp: -0.3, lLeg: 0.2, rUp: 0.22, rLeg: 0.08,
    curlL: 0.3, ik: 0.5, hold: "push", rootK: 7, standoff: 0.44,
  }),
  // arm relaxes, feet reposition
  reposition: mk({ lookW: 0.9, k: 5, ka: 5, yaw: -1.2, lArm: D(0.25, 0, 0.1), lFore: D(-0.35), curlL: 0.3, rootK: 3.2 }),
  // small smile and wave
  success: mk({
    lookW: 0.35, look: "cam", k: 8, ka: 9, yaw: -0.95,
    lArm: D(-1.9, 0, 0.5), lFore: D(-1.0), lHand: D(0, HALF, 0),
    curlL: 0.2, smile: 1, wave: true, rootK: 3,
  }),
};

const FK_KEYS = FK_MAP;
export const POSEQ = Object.fromEntries(
  Object.entries(POSES).map(([name, p]) => [
    name,
    Object.fromEntries(FK_KEYS.map(([bone, key]) => [bone, new THREE.Quaternion().setFromEuler(new THREE.Euler(...p[key]))])),
  ])
);

/** One shared phase from the interaction hook -> a detailed animation state. */
export function substate(phase, ms) {
  switch (phase) {
    case "approach": {
      const f = ms / T.touch;
      return f < 0.22 ? "look" : f < 0.42 ? "turn" : "approach";
    }
    case "touch":
      return ms < (T.push - T.touch) * 0.55 ? "reach" : "touch";
    case "push":
      return "push";
    case "switching":
      return ms < 150 ? "followThrough" : "reposition";
    case "success":
      return "success";
    default:
      return "idle";
  }
}