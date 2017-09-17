import * as game from "./game";

describe('Captain\'s Mistress Control Flow', () => {
  it('base32', () => {
    // arrange
    const base32 = new game.Base32();
    const testString = "Now is the time for all good men {}[][].12$";

    // action
    const encoded = base32.encode(testString);
    const decoded = base32.decode(encoded);

    // console.log("TS", testString);
    // console.log("EN", encoded);
    // console.log("DE", decoded);

    // assert
    expect(decoded).toBe(testString);
  });


  describe('Constructor', () => {

    it('constructor should return empty game', () => {
      const mistress = new game.Game();
      expect(mistress).not.toBeNull();
    });

    it('constructor should valid board', () => {
      const mistress = new game.Game();
      expect(mistress.gameState.board.length).toBe(mistress.board_x * mistress.board_y);
    });
  });

  describe('init', () => {
    it('game should be ready to play', () => {
      const mistress = new game.Game();
      mistress.init("Robot1", "AI2.0", "multiloc@soi");

      expect(mistress.gameState.gameOver).toBeTruthy();
      expect(mistress.gameState.player1).toBe("Robot1");
      expect(mistress.gameState.player2).toBe("AI2.0");
      expect(mistress.gameState.turn).toBe(0);
    });
  });


})
