import { canvas, ctx, margin } from "./canvas.js";
import {
    angleBetween,
    sub,
    distance,
    norm,
    rotate,
    scale,
    dotProduct,
    add,
} from "./math.js";
import { SOUND } from "./sound.js";

export class Ball {
    constructor({ pos, color, vel, number = 0, type = "solid" }) {
        this.number = number;
        this.type = type;
        this.originalPos =  {...pos };
        this.pos = { ...pos };
        this.vel = vel ?? { x: 0, y: 0 };
        this.originalVel = { ...this.vel };
        this.color = color;
        this.size = 18;
        this.friction = 0.99;
        this.rollAngle = 0;
this.rollDirection = 0;
        this.inPocket = false;
        // gradient for light effects
        this.gradient = ctx.createRadialGradient(
            -0.4 * this.size,
            -0.4 * this.size,
            1,
            0,
            0,
            this.size
        );
        this.gradient.addColorStop(0, "rgba(255,255,255,0.25)");
        this.gradient.addColorStop(0.4, "rgba(255,255,255,0)");
        this.gradient.addColorStop(0.7, "rgba(0,0,0,0)");
        this.gradient.addColorStop(1, "rgba(0,0,0,0.3)");
        this.alpha = 1;
    }

    draw() {
if (this.alpha <= 0) return;

if (this.inPocket) {
this.alpha = Math.max(0, this.alpha - 0.2);
}

ctx.save();
ctx.globalAlpha = this.alpha;
ctx.translate(this.pos.x, this.pos.y);

const r = this.size;
const color = this.color;

// Schatten
ctx.beginPath();
ctx.ellipse(3, 5, r * 1.02, r * 0.78, 0, 0, Math.PI * 2);
ctx.fillStyle = "rgba(0,0,0,0.4)";
ctx.fill();

// Grundkugel mit glänzendem Farbverlauf
ctx.beginPath();
ctx.arc(0, 0, r, 0, Math.PI * 2);
const gradient = ctx.createRadialGradient(
-r * 0.38, -r * 0.45, 1,
r * 0.12, r * 0.18, r * 1.3
);
gradient.addColorStop(0, "#ffffff");
gradient.addColorStop(0.18, color);
gradient.addColorStop(0.72, color);
gradient.addColorStop(1, "#090c13");
ctx.fillStyle = gradient;
ctx.fill();


// Glanz und Kontur
ctx.beginPath();
ctx.ellipse(-r * 0.36, -r * 0.48, r * 0.24, r * 0.12,
-0.55, 0, Math.PI * 2);
ctx.fillStyle = "rgba(255,255,255,0.65)";
ctx.fill();

ctx.beginPath();
ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(255,255,255,0.3)";
ctx.lineWidth = 1;
ctx.stroke();
// Oberflächenmarkierungen mit perspektivischer Rotation
const angle = this.rollAngle;
const direction = this.rollDirection || 0;

// Rotationsachse liegt quer zur Bewegungsrichtung
const axisX = -Math.sin(direction);
const axisY = Math.cos(direction);

// Position eines Markierungspunkts auf der Kugeloberfläche
const surfaceX = Math.cos(direction) * Math.sin(angle);
const surfaceY = Math.sin(direction) * Math.sin(angle);
const surfaceZ = Math.cos(angle);

// Gestreifte Kugeln: Band wird mit der Rollbewegung gedreht
if (this.type === "stripe") {
ctx.save();
ctx.beginPath();
ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
ctx.clip();

ctx.translate(0, 0);
ctx.rotate(direction);
ctx.transform(
1, 0,
0, Math.max(0.12, Math.abs(Math.cos(angle))),
0, 0
);

ctx.fillStyle = "#ffffff";
ctx.fillRect(
-r,
-r * 0.42 + Math.sin(angle) * r * 0.25,
r * 2,
r * 0.84
);

ctx.restore();
}

// Nummernkreis wandert über die sichtbare Kugeloberfläche
if (this.number > 0 && surfaceZ > -0.05) {
const badgeX = surfaceX * r * 0.62;
const badgeY = surfaceY * r * 0.62;
const perspective = Math.max(0.12, surfaceZ);

ctx.save();
ctx.translate(badgeX, badgeY);
ctx.scale(perspective, perspective);

ctx.beginPath();
ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
ctx.fillStyle = "#ffffff";
ctx.fill();

ctx.fillStyle = "#111111";
ctx.font = "bold 12px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(String(this.number), 0, 0);

ctx.restore();
}


ctx.restore();
}





    get idle() {
        return this.vel.x == 0 && this.vel.y == 0;
    }

  update(game) {
const speed = Math.hypot(this.vel.x, this.vel.y);

if (speed > 0.04) {
this.rollAngle += speed / this.size;
this.rollDirection = Math.atan2(this.vel.y, this.vel.x);
}

this.pos.x += this.vel.x;
this.pos.y += this.vel.y;

this.vel.x *= this.friction;
this.vel.y *= this.friction;

this.handleTinyVelocity();

if (this.inPocket) return;

this.bounceOfWalls();
this.collideWithBalls(game.balls);
this.bounceOffBumpers(game.bumpers);
this.checkPockets(game.pockets);
}

    bounceOfWalls() {
const left = margin + this.size;
const right = canvas.width - margin - this.size;
const top = margin + this.size;
const bottom = canvas.height - margin - this.size;

// Linke und rechte Bande
if (this.pos.x >= right && this.vel.x > 0) {
this.pos.x = right;
this.vel.x *= -1;
} else if (this.pos.x <= left && this.vel.x < 0) {
this.pos.x = left;
this.vel.x *= -1;
}

// Obere und untere Bande
if (this.pos.y >= bottom && this.vel.y > 0) {
this.pos.y = bottom;
this.vel.y *= -1;
} else if (this.pos.y <= top && this.vel.y < 0) {
this.pos.y = top;
this.vel.y *= -1;
}

        
    }

    collideWithBalls(balls) {
        balls.forEach((ball) => {
            if (ball == this || ball.inPocket) return;
            const dist = distance(this.pos, ball.pos);
            // check for collision
            if (dist > this.size + ball.size) return;
            // Ersten Kugelkontakt des aktuellen Stoßes erfassen
// Ersten Kontakt der weißen Kugel erfassen
if (
    this.color === this.game?.whiteBall?.color &&
    this.game.shotInProgress &&
    !this.game.firstContactBall &&
    ball !== this.game.whiteBall
) {
    this.game.firstContactBall = ball;
}
            // pull balls apart when there is overlap
            const L = this.size + ball.size - dist;
            const x_d = sub(ball.pos, this.pos);
            const c = scale(L / (2 * dist), x_d);
            this.pos = sub(this.pos, c);
            ball.pos = add(ball.pos, c);
            // elastic collision
            const v_d = sub(this.vel, ball.vel);
            const w = scale(
                (1 / Math.pow(dist, 2)) * dotProduct(x_d, v_d),
                x_d
            );
            this.vel = sub(this.vel, w);
            ball.vel = add(ball.vel, w);
            // play sound
            const volume = Math.min(
                (norm(this.vel) + norm(ball.vel)) / 15,
                1
            );
            SOUND.COLLISION.volume = volume;
            SOUND.COLLISION.play();
        });
    }

    bounceOffBumpers(bumpers) {
        bumpers.forEach((bumper) => {
            const segment = bumper.intersectionSegment(this);
            if (segment !== null) {
                // bouncing
                const [a, b] = segment;
                const vector = sub(b, a);
                const angle = angleBetween(this.vel, vector);
                this.vel = rotate(2 * angle, this.vel);
                // play sound
                const volume = Math.min(1, norm(this.vel) / 30);
                SOUND.BUMPER.volume = volume;
                SOUND.BUMPER.play();
            }
        });
    }

    checkPockets(pockets) {
        pockets.forEach((pocket) => {
            if (pocket.includes(this)) {
                this.inPocket = true;
                SOUND.POCKET.play();
                return;
            }
        });
    }

    handleTinyVelocity() {
        const threshold = 0.04;
        if (Math.abs(this.vel.x) < threshold) {
            this.vel.x = 0;
        }
        if (Math.abs(this.vel.y) < threshold) {
            this.vel.y = 0;
        }
    }

    intersects(ball) {
        return distance(this.pos, ball.pos) <= this.size + ball.size;
    }

    reset(game) {
        this.inPocket = false;
        this.alpha = 1;
        this.rollAngle = 0;
        this.rollDirection = 0;
        this.pos = { ...this.originalPos };
        this.vel = { ...this.originalVel };
        if (this == game.whiteBall) {
            this.avoidOtherBalls(game.balls);
        }
    }

    avoidOtherBalls(balls) {
        const delta = 4;
        while (
            balls.some(
                (ball) => ball != this && this.intersects(ball)
            )
        ) {
            const coord = Math.random() < 0.5 ? "x" : "y";
            const sign = Math.random() < 0.5 ? +1 : -1;
            this.pos[coord] += sign * delta;
        }
    }
}
