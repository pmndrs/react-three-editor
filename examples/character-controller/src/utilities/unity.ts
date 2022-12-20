function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Loops the value t, so that it is never larger than length and never smaller than 0.
function repeat(t: number, length: number) {
  return clamp(t - Math.floor(t / length) * length, 0, length);
}

// Calculates the shortest difference between two given angles.
function deltaAngle(current: number, target: number) {
  let delta = repeat(target - current, 360);
  if (delta > 180) delta -= 360;
  return delta;
}

function deltaAngleRad(current: number, target: number) {
  let delta = repeat(target - current, 360 * (Math.PI / 180));
  if (delta > 180 * (Math.PI / 180)) delta -= 360 * (Math.PI / 180);
  return delta;
}

function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(current - target) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

// Gradually changes a value towards a desired goal over time.
function smoothDamp(
  current: number,
  target: number,
  currentVelocity: number,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number,
) {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;

  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;

  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;
  change = Math.min(Math.max(change, -maxChange), maxChange);
  target = current - change;

  const temp = (currentVelocity + omega * change) * deltaTime;
  currentVelocity = (currentVelocity - omega * temp) * exp;
  let output = target + (change + temp) * exp;

  // Prevent overshooting
  if (originalTo - current > 0.0 === output > originalTo) {
    output = originalTo;
    currentVelocity = (output - originalTo) / deltaTime;
  }

  return output;
}

function smoothDampAngle(
  current: number,
  target: number,
  currentVelocity: number,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number,
) {
  target = current + deltaAngle(current, target);
  return smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime);
}

export const Unity = {
  clamp,
  repeat,
  deltaAngle,
  deltaAngleRad,
  moveTowards,
  smoothDamp,
  smoothDampAngle,
};
