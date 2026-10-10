import * as THREE from "three";

const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _alt = new THREE.Vector3(0, 0, 1);
const _dir = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _pq = new THREE.Quaternion();

export function solveTwoBone(S, T, L1, L2, pole, outElbow, outWrist) {
  _dir.subVectors(T, S);
  let d = _dir.length();
  const max = L1 + L2 - 1e-3;
  const min = Math.abs(L1 - L2) + 1e-3;
  d = Math.min(max, Math.max(min, d));
  _dir.normalize();

  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(L1 * L1 - a * a, 0));

  _perp.copy(pole).addScaledVector(_dir, -pole.dot(_dir));
  if (_perp.lengthSq() < 1e-6) _perp.set(0, -1, 0);
  _perp.normalize();

  outElbow.copy(S).addScaledVector(_dir, a).addScaledVector(_perp, h);
  outWrist.copy(S).addScaledVector(_dir, d);
}

/**
 * Orient a bone so its local -Y axis points along `worldDir`.
 * `hint` is the world direction its local +X should roughly follow (controls twist).
 * Result (local quaternion, relative to the parent) is written to `out`.
 */
export function aimBone(bone, worldDir, hint, out) {
  _y.copy(worldDir).negate().normalize();
  _z.crossVectors(hint, _y);
  if (_z.lengthSq() < 1e-6) _z.crossVectors(_alt, _y);
  _z.normalize();
  _x.crossVectors(_y, _z);
  _m.makeBasis(_x, _y, _z);
  _q.setFromRotationMatrix(_m);
  bone.parent.getWorldQuaternion(_pq).invert();
  return out.copy(_pq.multiply(_q));
}