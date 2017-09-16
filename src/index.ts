import * as game from "./game";

export default class Main {
  mistress: game.Game;

  constructor() {
    console.log('Typescript Webpack starter launched');

    this.mistress = new game.Game();
    // this.mistress.setDevLinkType();
    this.mistress.init("NPC1", "Goulag, the un-moving", "multiloc@soi");
    this.mistress.setSubmitAction(this.mainLoop);
    this.mainLoop(this.mistress);
  }

  mainLoop(mistress: game.Game) {
    const html = mistress.render();

    const el: HTMLTextAreaElement = <any>document.getElementsByName("vqxsp")[0];
    el.value = html;

    document.getElementById("mistress-display").innerHTML = html;

    // Attach handlers
    const links = document.querySelectorAll("[data-gamestate]");
    for (let i = 0; i < links.length; i++) {
      const link = links[i] as HTMLAnchorElement;
      link.addEventListener("click", () => {
        link.style.backgroundColor = "blue";
        const player = link.getAttribute("data-player");
        const gameStateStr = link.getAttribute("data-gameState");

        mistress.processTurn(player, gameStateStr);
      });
    }

  }
}

let start = new Main();
