import { ctx, canvasNorm } from "./canvas.js";
import { mouse } from "./mouse.js";
import { SOUND } from "./sound.js";
import { sub, scale, normalize, limit, norm } from "./math.js";

export class Controller {
constructor(ball) {
this.ball = ball;
this.vector = { x: 0, y: 0 };
this.active = true;
this.maxLength = 300;
this.dragging = false;
this.startPoint = null;

this.addControl();
}

addControl() {
document.addEventListener("pointerdown", (e) => {
if (!this.active || e.target.nodeName === "BUTTON") return;
this.dragging = true;
this.startPoint = { x: mouse.x, y: mouse.y };
});

document.addEventListener("pointerup", () => {
if (!this.active || !this.dragging) return;

this.dragging = false;

const factor = 0.15;

if (this.game) {
    this.game.firstContactBall = null;
    this.game.foulThisTurn = false;
    this.game.pocketedThisTurn = false;
    this.game.shotInProgress = true;
}

this.ball.vel = scale(factor, this.vector);

const speed = norm(this.ball.vel);
if (speed > 0) {
SOUND.CUE.volume = Math.min(
1,
speed / (factor * this.maxLength)
);
SOUND.CUE.play().catch(() => {});
this.active = false;
}
});
}

update() {
this.vector = limit(
this.maxLength,
sub(mouse, this.ball.pos)
);
}

draw() {
if (!this.active) return;

const length = norm(this.vector);
if (length < 1) return;

// Stoßrichtung
const direction = normalize(this.vector);
const nx = direction.x;
const ny = direction.y;

const ballX = this.ball.pos.x;
const ballY = this.ball.pos.y;
const pullback = Math.min(length, this.maxLength) * 0.32;

// Goldener Queue hinter der weißen Kugel
const tipX = ballX - nx * (this.ball.size + 8 + pullback);
const tipY = ballY - ny * (this.ball.size + 8 + pullback);
const tailX = tipX - nx * 280;
const tailY = tipY - ny * 280;

ctx.save();
ctx.lineCap = "round";

// Schatten
ctx.beginPath();
ctx.moveTo(tailX + 3, tailY + 4);
ctx.lineTo(tipX + 3, tipY + 4);
ctx.strokeStyle = "rgba(0,0,0,0.65)";
ctx.lineWidth = 14;
ctx.stroke();

// Dunkler Griff
ctx.beginPath();
ctx.moveTo(tailX, tailY);
ctx.lineTo(tipX, tipY);
ctx.strokeStyle = "#35200e";
ctx.lineWidth = 11;
ctx.stroke();

// Goldverlauf
const gold = ctx.createLinearGradient(tailX, tailY, tipX, tipY);
gold.addColorStop(0, "#704511");
gold.addColorStop(0.18, "#fff0a6");
gold.addColorStop(0.36, "#b98223");
gold.addColorStop(0.55, "#fff7cf");
gold.addColorStop(0.76, "#c28b2d");
gold.addColorStop(1, "#fff0b0");

ctx.beginPath();
ctx.moveTo(tailX, tailY);
ctx.lineTo(tipX, tipY);
ctx.strokeStyle = gold;
ctx.lineWidth = 7;
ctx.stroke();

// Helle Mittelader
ctx.beginPath();
ctx.moveTo(tailX, tailY);
ctx.lineTo(tipX, tipY);
ctx.strokeStyle = "rgba(255,255,235,0.9)";
ctx.lineWidth = 1.5;
ctx.stroke();

// Goldringe
for (const t of [0.12, 0.18, 0.24, 0.78, 0.84]) {
const x = tailX + (tipX - tailX) * t;
const y = tailY + (tipY - tailY) * t;

ctx.beginPath();
ctx.arc(x, y, 5, 0, Math.PI * 2);
ctx.strokeStyle = "#fff0ad";
ctx.lineWidth = 2;
ctx.stroke();
}

// Helle Queue-Spitze
ctx.beginPath();
ctx.moveTo(tipX, tipY);
ctx.lineTo(ballX - nx * this.ball.size, ballY - ny * this.ball.size);
ctx.strokeStyle = "#f5e8c8";
ctx.lineWidth = 3;
ctx.stroke();


 // Physikalische Zielhilfe: Raycasting und Ghost Ball
const targetFar = scale(canvasNorm, direction);
const game = this.game;
const balls = game?.balls ?? [];
const radius = this.ball.size ?? 18;

let nearestDistance = Infinity;
let hitBall = null;

for (const other of balls) {
    if (other === this.ball || other.inPocket) continue;

    const dx = other.pos.x - ballX;
    const dy = other.pos.y - ballY;
    const combinedRadius = radius + (other.size ?? radius);

    const projection = dx * nx + dy * ny;
    if (projection <= 0) continue;

    const perpendicularSquared =
        dx * dx + dy * dy - projection * projection;

    const discriminant =
        combinedRadius * combinedRadius - perpendicularSquared;

    if (discriminant < 0) continue;

    const t = projection - Math.sqrt(discriminant);

    if (t >= 0 && t < nearestDistance) {
        nearestDistance = t;
        hitBall = other;
    }
}

const rayLength = Math.hypot(targetFar.x, targetFar.y);
const lineDistance = hitBall ? nearestDistance : rayLength;
const endX = ballX + nx * lineDistance;
const endY = ballY + ny * lineDistance;

// Weiße Ziellinie bis zum ersten Kontakt
ctx.beginPath();
ctx.moveTo(ballX, ballY);
ctx.lineTo(endX, endY);
ctx.strokeStyle = "rgba(255,255,255,0.9)";
ctx.lineWidth = 2;
ctx.stroke();

if (hitBall) {
    const targetRadius = hitBall.size ?? radius;
    const centerX = hitBall.pos.x;
    const centerY = hitBall.pos.y;

    // Ghost-Ball-Mittelpunkt: exakt eine Kugelberührung entfernt
    const axisX = (centerX - endX) / (radius + targetRadius);
    const axisY = (centerY - endY) / (radius + targetRadius);

    const ghostX = centerX - axisX * (radius + targetRadius);
    const ghostY = centerY - axisY * (radius + targetRadius);

    // Ghost Ball
    ctx.beginPath();
    ctx.arc(ghostX, ghostY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#bdefff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stoßachse vom Ghost Ball zur Objektkugel
    const ax = (centerX - ghostX) / (radius + targetRadius);
    const ay = (centerY - ghostY) / (radius + targetRadius);

    const kugelDurchmesser = radius * 2;

const objektKugelLinienLaenge = kugelDurchmesser *3
;
const weisseKugelLinienLaenge = kugelDurchmesser * 2.5;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";

    // Linie 1: Objektkugel-Pfad
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + ax * objektKugelLinienLaenge,
        centerY + ay * objektKugelLinienLaenge
    );
    ctx.stroke();

    // Linie 2: Tangente der weißen Kugel, exakt 90 Grad
    ctx.beginPath();
    ctx.moveTo(ghostX, ghostY);
    ctx.lineTo(
        ghostX - ay * weisseKugelLinienLaenge,
        ghostY + ax * weisseKugelLinienLaenge
    );
    ctx.stroke();

    ctx.restore();
}




}
}