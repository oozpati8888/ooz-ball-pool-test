import { Ball } from "./Ball.js";
import { canvas, margin } from "./canvas.js";

export const COLORS = {
    WHITE: "rgb(210,210,210)",
    BLACK: "rgb(0,0,0)",
    YELLOW: "rgb(255,215,0)",
    ORANGE: "rgb(255, 120, 0)",
    RED: "rgb(230,10,10)",
    PURPLE: "rgb(90,0,170)",
    BLUE: "rgb(0,80,255)",
    BROWN: "rgb(150,20,0)",
    GREEN: "rgb(0,90,0)",
};

export function getBalls() {
const start = {
x: canvas.width - margin - (canvas.width - 2 * margin) / 4,
y: canvas.height / 2,
};

const step = {
x: 33,
y: 38,
};

// Weiße Kugel links vom Dreieck
const balls = [
new Ball({
pos: {
x: margin + (canvas.width - 2 * margin) / 4,
y: start.y,
},
color: COLORS.WHITE,
number: 0,
type: "cue",
}),
];

// Klassische Dreiecksaufstellung: 5 Reihen, 15 Objektkugeln
const rack = [
[1],
[9, 2],
[3, 8, 10],
[11, 4, 12, 5],
[6, 13, 7, 14, 15],
];

rack.forEach((row, rowIndex) => {
row.forEach((number, index) => {
const x = start.x + rowIndex * 28.6;
const y = start.y + (index - (row.length - 1) / 2) * step.y;

let color;
if (number === 8) color = COLORS.BLACK;
else if ([1, 9].includes(number)) color = COLORS.YELLOW;
else if ([2, 10].includes(number)) color = COLORS.BLUE;
else if ([3, 11].includes(number)) color = COLORS.RED;
else if ([4, 12].includes(number)) color = COLORS.PURPLE;
else if ([5, 13].includes(number)) color = COLORS.ORANGE;
else if ([6, 14].includes(number)) color = COLORS.GREEN;
else color = COLORS.BROWN;

balls.push(
new Ball({
pos: { x, y },
color,
number,
type: number === 8 ? "eight" : number >= 9 ? "stripe" : "solid",
})
);
});
});

return balls;
}



       