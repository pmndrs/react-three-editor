import { Matrix3, Object3D, Quaternion, Vector3 } from 'three'
import Rapier from '@dimforge/rapier3d-compat'

const calculateInv = (mass: number) => mass > 0 ? 1.0 / mass : 0

// Multiply a quaternion by a vector
export const multiplyQuaternionByVector = (
    q: Quaternion,
    v: Vector3,
    target = new Vector3()
): Vector3 => {
    const x = v.x
    const y = v.y
    const z = v.z
    const qx = q.x
    const qy = q.y
    const qz = q.z
    const qw = q.w

    // q*v
    const ix = qw * x + qy * z - qz * y

    const iy = qw * y + qz * x - qx * z
    const iz = qw * z + qx * y - qy * x
    const iw = -qx * x - qy * y - qz * z

    target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
    target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
    target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx

    return target
}

const getVelocityAtWorldPoint_r = new Vector3()
const getVelocityAtWorldPoint_position = new Vector3()
const getVelocityAtWorldPoint_angvel = new Vector3()
const getVelocityAtWorldPoint_linvel = new Vector3()

export const getVelocityAtWorldPoint = (
    rigidBody: Rapier.RigidBody,
    worldPoint: Vector3,
    target = new Vector3()
): Vector3 => {
    const r = getVelocityAtWorldPoint_r.set(0, 0, 0)

    const position = getVelocityAtWorldPoint_position.copy(
        rigidBody.translation() as Vector3
    )
    const angvel = getVelocityAtWorldPoint_angvel.copy(
        rigidBody.angvel() as Vector3
    )
    const linvel = getVelocityAtWorldPoint_linvel.copy(
        rigidBody.linvel() as Vector3
    )

    r.subVectors(worldPoint, position)
    target.crossVectors(angvel, r)
    target.addVectors(linvel, target)

    return target
}

const pointToWorldFrame_quaternion = new Quaternion()

export const pointToWorldFrame = (
    object: Rapier.RigidBody | Object3D,
    localPoint: Vector3,
    target = new Vector3()
): Vector3 => {
    target.copy(localPoint)

    const quaternion = pointToWorldFrame_quaternion.copy(
        object instanceof Object3D
            ? object.quaternion
            : (object.rotation() as Quaternion)
    )

    const position =
        object instanceof Object3D
            ? object.position
            : (object.translation() as Vector3)

    return multiplyQuaternionByVector(quaternion, localPoint, target).add(
        position
    )
}

const vectorToLocalFrame_quaternion = new Quaternion()

export const vectorToLocalFrame = (
    object: Rapier.RigidBody | Object3D,
    worldVector: Vector3,
    target = new Vector3()
): Vector3 => {
    const quaternion = vectorToLocalFrame_quaternion.copy(
        object instanceof Object3D
            ? object.quaternion
            : (object.rotation() as Quaternion)
    )

    quaternion.conjugate()

    return multiplyQuaternionByVector(quaternion, worldVector, target)
}

const vectorToWorldFrame_quaternion = new Quaternion()

export const vectorToWorldFrame = (
    object: Rapier.RigidBody | Object3D,
    localVector: Vector3,
    target = new Vector3()
): Vector3 => {
    const quaternion = vectorToWorldFrame_quaternion.copy(
        object instanceof Object3D
            ? object.quaternion
            : (object.rotation() as Quaternion)
    )

    return multiplyQuaternionByVector(quaternion, localVector, target)
}

// get one of the wheel axes, world-oriented
export const getVehicleAxisWorld = (
    chassisBody: Rapier.RigidBody,
    axisIndex: number,
    result = new Vector3()
): Vector3 => {
    result.set(
        axisIndex === 0 ? 1 : 0,
        axisIndex === 1 ? 1 : 0,
        axisIndex === 2 ? 1 : 0
    )
    return vectorToWorldFrame(chassisBody, result, result)
}

// bilateral constraint between two dynamic objects
const resolveSingleBilateralConstraint_vel1 = new Vector3()
const resolveSingleBilateralConstraint_vel2 = new Vector3()
const resolveSingleBilateralConstraint_vel = new Vector3()

export const resolveSingleBilateralConstraint = (
    body1: Rapier.RigidBody,
    pos1: Vector3,
    body2: Rapier.RigidBody,
    pos2: Vector3,
    normal: Vector3,
): number => {
    const normalLenSqr = normal.lengthSq()
    if (normalLenSqr > 1.1) {
        return 0 // no impulse
    }

    const vel1 = resolveSingleBilateralConstraint_vel1
    const vel2 = resolveSingleBilateralConstraint_vel2
    const vel = resolveSingleBilateralConstraint_vel

    getVelocityAtWorldPoint(body1, pos1, vel1)
    getVelocityAtWorldPoint(body2, pos2, vel2)

    vel.subVectors(vel1, vel2)

    const rel_vel = normal.dot(vel)

    const contactDamping = 0.2

    const body1InvMass = calculateInv(body1.mass())
    const body2InvMass = calculateInv(body2.mass())

    const massTerm = 1 / (body1InvMass + body2InvMass)
    const impulse = -contactDamping * rel_vel * massTerm

    return impulse
}

// set Matrix3 rotation from quaternion
export const setMatrix3RotationFromQuaternion = (
    m: Matrix3,
    q: Quaternion
): void => {
    const x = q.x
    const y = q.y
    const z = q.z
    const w = q.w
    const x2 = x + x
    const y2 = y + y
    const z2 = z + z
    const xx = x * x2
    const xy = x * y2
    const xz = x * z2
    const yy = y * y2
    const yz = y * z2
    const zz = z * z2
    const wx = w * x2
    const wy = w * y2
    const wz = w * z2
    const e = m.elements

    e[3 * 0 + 0] = 1 - (yy + zz)
    e[3 * 0 + 1] = xy - wz
    e[3 * 0 + 2] = xz + wy

    e[3 * 1 + 0] = xy + wz
    e[3 * 1 + 1] = 1 - (xx + zz)
    e[3 * 1 + 2] = yz - wx

    e[3 * 2 + 0] = xz - wy
    e[3 * 2 + 1] = yz + wx
    e[3 * 2 + 2] = 1 - (xx + yy)
}

// matrix-vector multiplication
export const matrixVectorMultiplication = (
    m: Matrix3,
    v: Vector3,
    target = new Vector3()
): Vector3 => {
    const e = m.elements

    const x = v.x
    const y = v.y
    const z = v.z

    target.x = e[0] * x + e[1] * y + e[2] * z
    target.y = e[3] * x + e[4] * y + e[5] * z
    target.z = e[6] * x + e[7] * y + e[8] * z

    return target
}

// scale matrix3 columns of by vector3
const scaleMatrix3ByVector3 = (m: Matrix3, vector: Vector3): void => {
    const e = m.elements
    for (let i = 0; i !== 3; i++) {
        e[3 * i + 0] = vector.x * e[3 * i + 0]
        e[3 * i + 1] = vector.y * e[3 * i + 1]
        e[3 * i + 2] = vector.z * e[3 * i + 2]
    }
}

// calculate inertia for an aabb
export const calculateAABBInertia = (
    halfExtents: Vector3,
    mass: number,
    target = new Vector3()
): Vector3 => {
    const e = halfExtents
    return target.set(
        (1.0 / 12.0) * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z),
        (1.0 / 12.0) * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z),
        (1.0 / 12.0) * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x)
    )
}

// calculate inertia world
const calculateInertiaWorld_uiw_m1 = new Matrix3()
const calculateInertiaWorld_uiw_m2 = new Matrix3()

export const calculateInvInertiaWorld = (
    rigidBody: Rapier.RigidBody,
    invInertia: Vector3,
    target = new Matrix3()
): Matrix3 => {
    const I = invInertia
    const invInertiaWorld = target

    const m1 = calculateInertiaWorld_uiw_m1
    const m2 = calculateInertiaWorld_uiw_m2

    setMatrix3RotationFromQuaternion(m1, rigidBody.rotation() as Quaternion)
    m2.copy(m1).transpose()

    scaleMatrix3ByVector3(m1, I)
    invInertiaWorld.multiplyMatrices(m1, m2)

    return invInertiaWorld
}

// compute impulse denominator
const computeImpulseDenominator_r0 = new Vector3()
const computeImpulseDenominator_c0 = new Vector3()
const computeImpulseDenominator_vec = new Vector3()
const computeImpulseDenominator_m = new Vector3()
const computeImpulseDenominator_localInertia = new Vector3()
const computeImpulseDenominator_invInertia = new Vector3()
const computeImpulseDenominator_invInertiaWorld = new Matrix3()

export const computeImpulseDenominator = (
    body: Rapier.RigidBody,
    pos: Vector3,
    normal: Vector3,
    halfExtents: Vector3
): number => {
    const r0 = computeImpulseDenominator_r0
    const c0 = computeImpulseDenominator_c0
    const vec = computeImpulseDenominator_vec
    const m = computeImpulseDenominator_m

    const localInertia = computeImpulseDenominator_localInertia
    calculateAABBInertia(
        halfExtents,
        body.mass(),
        computeImpulseDenominator_localInertia
    )

    const invIntertia = computeImpulseDenominator_invInertia.set(
        calculateInv(localInertia.x),
        calculateInv(localInertia.y),
        calculateInv(localInertia.z)
    )

    const invInertiaWorld = computeImpulseDenominator_invInertiaWorld
    calculateInvInertiaWorld(body, invIntertia, invInertiaWorld)

    r0.subVectors(pos, body.translation() as Vector3)
    c0.crossVectors(r0, normal)

    matrixVectorMultiplication(invInertiaWorld, c0, m)
    vec.crossVectors(m, r0)

    const invMass = calculateInv(body.mass())

    return invMass + normal.dot(vec)
}

// calculate rolling friction
const calcRollingFriction_vel1 = new Vector3()
const calcRollingFriction_vel2 = new Vector3()
const calcRollingFriction_vel = new Vector3()
const calcRollingFriction_groundHalfExtents = new Vector3(1, 1, 1)

export const calcRollingFriction = (
    chassisHalfExtents: Vector3,
    body0: Rapier.RigidBody,
    body1: Rapier.RigidBody,
    frictionPosWorld: Vector3,
    frictionDirectionWorld: Vector3,
    maxImpulse: number
): number => {
    let j1 = 0
    const contactPosWorld = frictionPosWorld

    const vel1 = calcRollingFriction_vel1
    const vel2 = calcRollingFriction_vel2
    const vel = calcRollingFriction_vel

    getVelocityAtWorldPoint(body0, contactPosWorld, vel1)
    getVelocityAtWorldPoint(body1, contactPosWorld, vel2)
    vel.subVectors(vel1, vel2)

    const vrel = frictionDirectionWorld.dot(vel)

    const denom0 = computeImpulseDenominator(
        body0,
        frictionPosWorld,
        frictionDirectionWorld,
        // hack: use chassis half extents to estimate inertia for chasssi rigid body
        // todo: get inertia from rapier rigid body - bindings might need updating?
        chassisHalfExtents
    )

    const denom1 = computeImpulseDenominator(
        body1,
        frictionPosWorld,
        frictionDirectionWorld,
        // hack: use aabb of box with half extents of 1,1,1 to estimate inertia for ground rigid body
        // todo: get inertia from rapier rigid body - bindings might need updating?
        calcRollingFriction_groundHalfExtents.set(1, 1, 1)
    )

    const relaxation = 1
    const jacDiagABInv = relaxation / (denom0 + denom1)

    // calculate j that moves us to zero relative velocity
    j1 = -vrel * jacDiagABInv

    if (maxImpulse < j1) {
        j1 = maxImpulse
    }
    if (j1 < -maxImpulse) {
        j1 = -maxImpulse
    }

    return j1
}
