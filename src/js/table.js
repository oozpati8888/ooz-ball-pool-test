import { canvas, tctx } from "./canvas.js";

const tableImage = new Image();
let imageLoaded = false;

tableImage.onload = () => {
imageLoaded = true;
drawTableImage();
};

tableImage.onerror = () => {
console.error("OOZ-Tischbild konnte nicht geladen werden:", tableImage.src);
};

tableImage.src = "./OOZ_BALL_Tisch_1320x720.png";

export function drawCloth() {
drawTableImage();
}

export function drawWood() {
// Der Tisch wird bereits durch drawCloth gezeichnet.
}

function drawTableImage() {
if (!imageLoaded) return;

tctx.clearRect(0, 0, canvas.width, canvas.height);
tctx.drawImage(
tableImage,
0,
0,
canvas.width,
canvas.height
);
}

