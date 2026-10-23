function N(r, t) { return Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2)); }
function y(r) { return Math.sqrt(Math.pow(r.x, 2) + Math.pow(r.y, 2)); }
function E(r, t) { return { x: r.x - t.x, y: r.y - t.y }; }
function _(r, t) { return { x: r.x + t.x, y: r.y + t.y }; }
function T(r, t) { return { x: r * t.x, y: r * t.y }; }
function ot(r) { return r.x == 0 && r.y == 0 ? r : T(1 / y(r), r); }
function rt(r, t) { let s = y(t); return s <= r ? t : T(r / s, t); }
function nt(r, t) { return { x: t.x * Math.cos(r) - t.y * Math.sin(r), y: t.x * Math.sin(r) + t.y * Math.cos(r) }; }
function $(r, t) { return r.x * t.x + r.y * t.y; }
function ht(r, t) { return Math.acos($(r, t) / (y(r) * y(t))); }
function Pt(r, t, s) { let n = t * t - 4 * r * s; if (n < 0) return []; let l = Math.sqrt(n); return [(-t + l) / (2 * r), (-t - l) / (2 * r)]; }
function lt(r, t) { let [s, n] = r, [l, d] = t, a = Math.pow(n.x - s.x, 2) + Math.pow(n.y - s.y, 2), b = 2 * ((s.x - l.x) * (n.x - s.x) + (s.y - l.y) * (n.y - s.y)), p = Math.pow(s.x - l.x, 2) + Math.pow(s.y - l.y, 2) - Math.pow(d, 2), g = Pt(a, b, p); return g.length > 0 && g.some(f => f >= 0 && f <= 1); }

var o = document.getElementById("canvas"), j = document.getElementById("tableCanvas"), e = o.getContext("2d"), h = j.getContext("2d"), i = 60;
o.width = j.width = 1200 + 2 * i; o.height = j.height = 600 + 2 * i;
var at = y({ x: o.width, y: o.height });
function ct() { e.clearRect(0, 0, o.width, o.height); }

var H = document.getElementById("dialog"), dt = document.getElementById("dialogContent"), kt = document.getElementById("closeBtn");
function D(r) {
let t = r.toLowerCase().includes("won") || r.toLowerCase().includes("gewonnen"), s = t ? "DU HAST GEWONNEN!" : "DU HAST VERLOREN!", n = t ? "Ein perfektes Spiel. Glückwunsch!" : "Dieses Spiel gehört deinem Gegner.";
dt.innerHTML = `
<div class="ooz-result ${t ? "ooz-win" : "ooz-lose"}">
<div class="ooz-result-brand">OOZ BALL</div>
<div class="ooz-result-icon">${t ? "\u{1F3C6}" : "\u{1F3B1}"}</div>
<h2>${s}</h2>
<p>${n}</p>
<button class="ooz-result-btn" id="oozPlayAgain">NOCH EIN SPIEL</button>
</div>`;
H.open = !0;
document.getElementById("oozPlayAgain").addEventListener("click", () => { ft(), document.getElementById("restartBtn")?.click(); });
}
function ft() { H.classList.add("close"), setTimeout(() => { H.classList.remove("close"), H.open = !1, dt.innerHTML = ""; }, 300); }
if(kt) kt.addEventListener("click", ft);

var R = { x: 0, y: 0 };
function updatePointerPosition(r) {
let t = o.getBoundingClientRect();
R.x = (r.clientX - t.left) * (o.width / t.width);
R.y = (r.clientY - t.top) * (o.height / t.height);
}
window.addEventListener("pointerdown", updatePointerPosition);
window.addEventListener("pointermove", updatePointerPosition);

var m = { CUE: new Audio("./sfx/cue.mp3"), COLLISION: new Audio("./sfx/collision.mp3"), BUMPER: new Audio("./sfx/bumper.mp3"), POCKET: new Audio("./sfx/pocket.mp3"), WHIP: new Audio("./sfx/whip.mp3"), WIN: new Audio("./sfx/win.mp3"), LOSE: new Audio("./sfx/lose.mp3") };
m.WHIP.volume = .3;

window.X = class {
constructor(t) { this.ball = t, this.vector = { x: 0, y: 0 }, this.active = !0, this.maxLength = 300, this.dragging = !1, this.startPoint = null, this.addControl(); }
addControl() {
document.addEventListener("pointerdown", t => { !this.active || t.target.nodeName === "BUTTON" || (this.dragging = !0, updatePointerPosition(t), this.startPoint = { x: R.x, y: R.y }); });
document.addEventListener("pointermove", t => { if (this.dragging) { updatePointerPosition(t); } });
document.addEventListener("pointerup", () => {
if (!this.active || !this.dragging) return; this.dragging = !1; let t = .15;
this.game && (this.game.firstContactBall = null, this.game.foulThisTurn = !1, this.game.pocketedThisTurn = !1, this.game.shotInProgress = !0);
this.ball.vel = T(t, this.vector); let s = y(this.ball.vel);
s > 0 && (m.CUE.volume = Math.min(1, s / (t * this.maxLength)), m.CUE.play().catch(() => { }), this.active = !1);
});
}
update() { this.vector = rt(this.maxLength, E(R, this.ball.pos)); }
draw() {
if (!this.active) return; let t = y(this.vector); if (t < 1) return; let s = ot(this.vector), n = s.x, l = s.y, d = this.ball.pos.x, a = this.ball.pos.y, b = Math.min(t, this.maxLength) * .32, p = d - n * (this.ball.size + 8 + b), g = a - l * (this.ball.size + 8 + b), f = p - n * 280, M = g - l * 280; e.save(), e.lineCap = "round", e.beginPath(), e.moveTo(f + 3, M + 4), e.lineTo(p + 3, g + 4), e.strokeStyle = "rgba(0,0,0,0.65)", e.lineWidth = 14, e.stroke(), e.beginPath(), e.moveTo(f, M), e.lineTo(p, g), e.strokeStyle = "#35200e", e.lineWidth = 11, e.stroke(); let B = e.createLinearGradient(f, M, p, g); B.addColorStop(0, "#704511"), B.addColorStop(.18, "#fff0a6"), B.addColorStop(.36, "#b98223"), B.addColorStop(.55, "#fff7cf"), B.addColorStop(.76, "#c28b2d"), B.addColorStop(1, "#fff0b0"), e.beginPath(), e.moveTo(f, M), e.lineTo(p, g), e.strokeStyle = B, e.lineWidth = 7, e.stroke(), e.beginPath(), e.moveTo(f, M), e.lineTo(p, g), e.strokeStyle = "rgba(255,255,235,0.9)", e.lineWidth = 1.5, e.stroke(); for (let u of [.12, .18, .24, .78, .84]) { let P = f + (p - f) * u, k = M + (g - M) * u; e.beginPath(), e.arc(P, k, 5, 0, Math.PI * 2), e.strokeStyle = "#fff0ad", e.lineWidth = 2, e.stroke(); } e.beginPath(), e.moveTo(p, g), e.lineTo(d - n * this.ball.size, a - l * this.ball.size), e.strokeStyle = "#f5e8c8", e.lineWidth = 3, e.stroke(); let A = T(at, s), bt = this.game?.balls ?? [], v = this.ball.size ?? 18, V = 1 / 0, O = null; for (let u of bt) { if (u === this.ball || u.inPocket) continue; let P = u.pos.x - d, k = u.pos.y - a, G = v + (u.size ?? v), L = P * n + k * l; if (L <= 0) continue; let z = P * P + k * k - L * L, I = G * G - z; if (I < 0) continue; let W = L - Math.sqrt(I); W >= 0 && W < V && (V = W, O = u); } let vt = Math.hypot(A.x, A.y), F = O ? V : vt, Q = d + n * F, J = a + l * F; if (e.beginPath(), e.moveTo(d, a), e.lineTo(Q, J), e.strokeStyle = "rgba(255,255,255,0.9)", e.lineWidth = 2, e.stroke(), O) { let u = O.size ?? v, P = O.pos.x, k = O.pos.y, G = (P - Q) / (v + u), L = (k - J) / (v + u), z = P - G * (v + u), I = k - L * (v + u); e.beginPath(), e.arc(z, I, v, 0, Math.PI * 2), e.strokeStyle = "#bdefff", e.lineWidth = 2, e.stroke(); let W = (P - z) / (v + u), tt = (k - I) / (v + u), et = v * 2, st = et * 3, it = et * 2.5; e.save(), e.lineCap = "round", e.lineWidth = 2.5, e.strokeStyle = "rgba(255,255,255,0.95)", e.beginPath(), e.moveTo(P, k), e.lineTo(P + W * st, k + tt * st), e.stroke(), e.beginPath(), e.moveTo(z, I), e.lineTo(z - tt * it, I + W * it), e.stroke(), e.restore(); } }
};

window.U = class {
constructor({ pos: t, color: s, vel: n, number: l = 0, type: d = "solid" }) { this.number = l, this.type = d, this.originalPos = { ...t }, this.pos = { ...t }, this.vel = n ?? { x: 0, y: 0 }, this.originalVel = { ...this.vel }, this.color = s, this.size = 18, this.friction = .99, this.rollAngle = 0, this.rollDirection = 0, this.inPocket = !1, this.gradient = e.createRadialGradient(-.4 * this.size, -.4 * this.size, 1, 0, 0, this.size), this.gradient.addColorStop(0, "rgba(255,255,255,0.25)"), this.gradient.addColorStop(.4, "rgba(255,255,255,0)"), this.gradient.addColorStop(.7, "rgba(0,0,0,0)"), this.gradient.addColorStop(1, "rgba(0,0,0,0.3)"), this.alpha = 1; }
draw() {
if (this.alpha <= 0) return; this.inPocket && (this.alpha = Math.max(0, this.alpha - .2)), e.save(), e.globalAlpha = this.alpha, e.translate(this.pos.x, this.pos.y); let t = this.size, s = this.color; e.beginPath(), e.ellipse(3, 5, t * 1.02, t * .78, 0, 0, Math.PI * 2), e.fillStyle = "rgba(0,0,0,0.4)", e.fill(), e.beginPath(), e.arc(0, 0, t, 0, Math.PI * 2); let n = e.createRadialGradient(-t * .38, -t * .45, 1, t * .12, t * .18, t * 1.3); n.addColorStop(0, "#ffffff"), n.addColorStop(.18, s), n.addColorStop(.72, s), n.addColorStop(1, "#090c13"), e.fillStyle = n, e.fill(), e.beginPath(), e.ellipse(-t * .36, -t * .48, t * .24, t * .12, -.55, 0, Math.PI * 2), e.fillStyle = "rgba(255,255,255,0.65)", e.fill(), e.beginPath(), e.arc(0, 0, t - 1, 0, Math.PI * 2), e.strokeStyle = "rgba(255,255,255,0.3)", e.lineWidth = 1, e.stroke(); let l = this.rollAngle, d = this.rollDirection || 0, a = -Math.sin(d), b = Math.cos(d), p = Math.cos(d) * Math.sin(l), g = Math.sin(d) * Math.sin(l), f = Math.cos(l); if (this.type === "stripe" && (e.save(), e.beginPath(), e.arc(0, 0, t - 1, 0, Math.PI * 2), e.clip(), e.translate(0, 0), e.rotate(d), e.transform(1, 0, 0, Math.max(.12, Math.abs(Math.cos(l))), 0, 0), e.fillStyle = "#ffffff", e.fillRect(-t, -t * .42 + Math.sin(l) * t * .25, t * 2, t * .84), e.restore()), this.number > 0 && f > -.05) { let M = p * t * .62, B = g * t * .62, A = Math.max(.12, f); e.save(), e.translate(M, B), e.scale(A, A), e.beginPath(), e.arc(0, 0, t * .42, 0, Math.PI * 2), e.fillStyle = "#ffffff", e.fill(), e.fillStyle = "#111111", e.font = "bold 12px Arial", e.textAlign = "center", e.textBaseline = "middle", e.fillText(String(this.number), 0, 0), e.restore(); } e.restore();
}
get idle() { return this.vel.x == 0 && this.vel.y == 0; }
update(t) {
let s = Math.hypot(this.vel.x, this.vel.y);
s > .04 && (this.rollAngle += s / this.size, this.rollDirection = Math.atan2(this.vel.y, this.vel.x)),
this.pos.x += this.vel.x, this.pos.y += this.vel.y, this.vel.x *= this.friction, this.vel.y *= this.friction,
this.handleTinyVelocity(), !this.inPocket && (this.bounceOfWalls(), this.collideWithBalls(t.balls), this.bounceOffBumpers(t.bumpers), this.checkPockets(t.pockets));
}
handleTinyVelocity() { if (Math.abs(this.vel.x) < 0.05) this.vel.x = 0; if (Math.abs(this.vel.y) < 0.05) this.vel.y = 0; }
bounceOfWalls() { let t = i + this.size, s = o.width - i - this.size, n = i + this.size, l = o.height - i - this.size; this.pos.x >= s && this.vel.x > 0 ? (this.pos.x = s, this.vel.x *= -1) : this.pos.x <= t && this.vel.x < 0 && (this.pos.x = t, this.vel.x *= -1), this.pos.y >= l && this.vel.y > 0 ? (this.pos.y = l, this.vel.y *= -1) : this.pos.y <= n && this.vel.y < 0 && (this.pos.y = n, this.vel.y *= -1); }
collideWithBalls() {}
bounceOffBumpers() {}
checkPockets() {}
};
