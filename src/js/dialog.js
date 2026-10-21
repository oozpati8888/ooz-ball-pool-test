
const dialogElement = document.getElementById("dialog");
const dialogContent = document.getElementById("dialogContent");
const closeBtn = document.getElementById("closeBtn");

export function openDialog(txt) {
    const isWin =
        txt.toLowerCase().includes("won") ||
        txt.toLowerCase().includes("gewonnen");

    const title = isWin
        ? "DU HAST GEWONNEN!"
        : "DU HAST VERLOREN!";

    const subtitle = isWin
        ? "Ein perfektes Spiel. Glückwunsch!"
        : "Dieses Spiel gehört deinem Gegner.";

    dialogContent.innerHTML = `
        <div class="ooz-result ${isWin ? "ooz-win" : "ooz-lose"}">
            <div class="ooz-result-brand">OOZ BALL</div>
            <div class="ooz-result-icon">${isWin ? "🏆" : "🎱"}</div>
            <h2>${title}</h2>
            <p>${subtitle}</p>
            <button class="ooz-result-btn" id="oozPlayAgain">
                NOCH EIN SPIEL
            </button>
        </div>
    `;

    dialogElement.open = true;

    document.getElementById("oozPlayAgain").addEventListener("click", () => {
        closeDialog();

        // Vorhandenen Neustart-Button verwenden
        document.getElementById("restartBtn")?.click();
    });
}

export function closeDialog() {
    dialogElement.classList.add("close");

    setTimeout(() => {
        dialogElement.classList.remove("close");
        dialogElement.open = false;
        dialogContent.innerHTML = "";
    }, 300);
}

closeBtn.addEventListener("click", closeDialog);
