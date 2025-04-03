"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondOrderDynamics = exports.SimpleDynamics = exports.Dynamics = void 0;
class Dynamics {
    constructor(x0) {
        this.xp = x0;
        this.y = this.xp;
        this.yd = Dynamics.VECTOR_3_ZERO;
        this.y2d = Dynamics.VECTOR_3_ZERO;
    }
    reset(x0) {
        this.xp = x0;
        this.y = this.xp;
        this.yd = Dynamics.VECTOR_3_ZERO;
        this.y2d = Dynamics.VECTOR_3_ZERO;
    }
    getSpeed() {
        return this.yd;
    }
    getAcceleration() {
        return this.y2d;
    }
}
exports.Dynamics = Dynamics;
Dynamics.EPSILON = 0.00001;
Dynamics.VECTOR_3_ZERO = vec3.zero();
class SimpleDynamics extends Dynamics {
    constructor(x0) {
        super(x0);
    }
    update(t, x, xd = null) {
        if (t < Dynamics.EPSILON) {
            return x;
        }
        xd = x.sub(this.xp).uniformScale(1.0 / t);
        this.xp = x;
        this.y2d = xd.sub(this.yd).uniformScale(1.0 / t);
        this.yd = xd;
        // noinspection JSSuspiciousNameCombination
        this.y = x;
        return this.y;
    }
    predict(t) {
        const y2d = Dynamics.VECTOR_3_ZERO.sub(this.yd).uniformScale(1.0 / t / 3.0);
        const yd = this.yd.add(y2d.uniformScale(t));
        return this.y.add(yd.uniformScale(t));
    }
}
exports.SimpleDynamics = SimpleDynamics;
class SecondOrderDynamics extends Dynamics {
    constructor(f, z, r, x0) {
        super(x0);
        this.f = f;
        this.z = z;
        this.r = r;
        this.w = 2.0 * Math.PI * f;
        this.d = this.w * Math.sqrt(Math.abs(z * z - 1.0));
        this.k1 = z / (Math.PI * f);
        this.k2 = 1.0 / ((2.0 * Math.PI * f) * (2.0 * Math.PI * f));
        this.k3 = r * z / (2.0 * Math.PI * f);
    }
    update(t, x, xd = null) {
        if (t < Dynamics.EPSILON) {
            return x;
        }
        if (!xd) {
            xd = x.sub(this.xp).uniformScale(1.0 / t);
            this.xp = x;
        }
        const k2Stable = this.calculateK2Stable(t);
        this.y2d = x.add(xd.uniformScale(this.k3))
            .sub(this.y)
            .sub(this.yd.uniformScale(this.k1))
            .uniformScale(1.0 / k2Stable);
        this.yd = this.yd.add(this.y2d.uniformScale(t));
        this.y = this.y.add(this.yd.uniformScale(t));
        return this.y;
    }
    predict(t) {
        const x = this.xp;
        const xd = Dynamics.VECTOR_3_ZERO;
        const k2Stable = this.calculateK2Stable(t);
        const y2d = x.add(xd.uniformScale(this.k3))
            .sub(this.y)
            .sub(this.yd.uniformScale(this.k1))
            .uniformScale(1.0 / k2Stable);
        const yd = this.yd.add(y2d.uniformScale(t));
        return this.y.add(yd.uniformScale(t));
    }
    calculateK2Stable(t) {
        let k2Stable;
        if (this.w * t < this.z) {
            k2Stable = Math.max(this.k2, t * t / 2.0 + t * this.k1 / 2.0, t * this.k1);
        }
        else {
            let t1 = Math.exp(-this.z * this.w * t);
            let alpha = 2.0 * t1 * (this.z <= 1.0 ? Math.cos(t * this.d) : cosh(t * this.d));
            let beta = t1 * t1;
            let t2 = t / (1.0 + beta - alpha);
            k2Stable = t * t2;
        }
        return k2Stable;
    }
}
exports.SecondOrderDynamics = SecondOrderDynamics;
function cosh(x) {
    return (Math.exp(x) + Math.exp(-x)) / 2.0;
}
//# sourceMappingURL=SecondOrderDynamics.js.map