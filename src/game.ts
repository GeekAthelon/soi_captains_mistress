// ./node_modules/.bin/tsc src/index.ts --module amd  ./src/game.ts

interface IGameState {
  gameCode: "cm";
  soiRoom: string;
  board: string;
  player1: string;
  player2: string;
  gameId: number;
  turn: number;
  gameOver: boolean;
  whichPlayer: string;
}


const cellEmpty = 9;
const cellP1 = 1;
const cellP2 = 2;

type cellType = 9 | 1 | 2;


let soiLinkType = true;

export class Game {
  gameState: IGameState;
  readonly board_x = 7;
  readonly board_y = 6;

  submitCallback: (mistres: Game) => void;

  constructor() {
    this.gameState = {
      gameCode: "cm",
      soiRoom: null,
      board: "",
      player1: null,
      player2: null,
      gameId: -1,
      turn: -1,
      gameOver: true,
      whichPlayer: null,
    }

    for (let x = 0; x < this.board_x; x++) {
      // this.gameState.board[x] = [];
      for (let y = 0; y < this.board_y; y++) {
        this.setPoint(this.gameState, x, y, cellEmpty);
      }
    }
  }

  getIndex(x1: number, y1: number) {
    // Yes, yes, this is horribly hacky!
    // My brain hurts too much to do the math right now.
    let idx = 0;
    for (let x = 0; x < this.board_x; x++) {
      for (let y = 0; y < this.board_y; y++) {
        if (x === x1 && y === y1) {
          return idx;
        }
        idx++;
      }
    }
  }

  setPoint(gameState: IGameState, x: number, y: number, value: cellType) {
    const index = this.getIndex(x, y);
    const arr = gameState.board.split("");
    arr[index] = "" + value;
    gameState.board = arr.join("");
  }

  getPoint(gameState: IGameState, x: number, y: number) {
    const index = this.getIndex(x, y);
    const arr = gameState.board.split("");
    return +arr[index] as cellType;
  }

  init(name1: string, name2: string, soiRoom: string) {
    this.gameState.player1 = name1;
    this.gameState.player2 = name2;
    this.gameState.turn = 0;
    this.gameState.gameOver = false;
    this.gameState.whichPlayer = name1;
    this.gameState.soiRoom = soiRoom;
  }

  setDevLinkType() {
    soiLinkType = false;
  }

  setSubmitAction(callback: (mistress: Game) => void) {
    this.submitCallback = callback;
  }

  render() {
    const backgroundColor = "cyan";
    const markerSize = 15;

    function getMarker(color: string, text = " ") {
      return `<span style="text-decoration: none!important; display: inline-block; border-radius: 50%; width: ${markerSize}px; height: ${markerSize}px; background: ${color}">${text}</span>`;
    }

    function getButton(color: string, gamestate: IGameState) {
      const base32 = new Base32();
      const gs = base32.encode(JSON.stringify(gamestate));
      let link: string;

      if (soiLinkType) {
        link = `#r-jsgames(**),${gs}`;
      } else {
        let player = gamestate.player1;
        if (player === gamestate.whichPlayer) {
          player = gamestate.player2;
        }

        link = `<a href="#" data-gamestate="${gs}" data-player="${player}">**</a>`;
      }
      return getMarker(color, link);
    }

    let html = `<center>The Captain's Mistress:<br>
            Another mediocre game from At<b></b>helon.</center>`;

    html += `<i>${this.gameState.player1.split("").join("<b></b>")}</i> vs <i>${this.gameState.player2.split("").join("<b></b>")}</i><br>`;
    html += `${this.gameState.whichPlayer.split("").join("<b></b>")}!  It's your go.  Turn: ${this.gameState.turn + 1}<br>`;

    html += `<pre style="line-height: 0.5; display:inline-block; background-color:${backgroundColor}">`;


    for (let y = 0; y < this.board_y; y++) {
      html += "<br>";
      for (let x = 0; x < this.board_x; x++) {
        const cell = this.getPoint(this.gameState, x, y);

        switch (cell) {
          case cellEmpty:
            html += getMarker("black");
            break;
          case cellP1:
            html += getMarker("red");
            break;
          case cellP2:
            html += getMarker("yellow");
            break;
        }
      }
    }

    html += "<br>";
    for (let x = 0; x < this.board_x; x++) {
      const newState: IGameState = JSON.parse(JSON.stringify(this.gameState));

      let isValidMove: boolean;
      if (newState.whichPlayer === newState.player1) {
        newState.whichPlayer = newState.player2;
        isValidMove = this.play(cellP2, x, newState);
      } else {
        newState.whichPlayer = newState.player1;
        isValidMove = this.play(cellP1, x, newState);
      }
      newState.turn++;

      if (isValidMove) {
        html += `${getButton("white", newState)}`;
      } else {
        html += getMarker("gray");
      }
    }

    html += "</pre>";
    return html;
  }

  processTurn(user: string, gameStatestr: string) {
    const base32 = new Base32();
    const gameState: IGameState = JSON.parse(base32.decode(gameStatestr));

    const realPlayer = gameState.whichPlayer === gameState.player1 ? gameState.player2 : gameState.player1;
    const wp = realPlayer.toLowerCase().replace(/[^a-z0-0]/g, "");
    const cp = user.toLowerCase().replace(/[^a-z0-0]/g, "");

    if (wp.indexOf(cp) !== 0) {
      alert(`Sorry, ${user}, it is not your turn.  It is ${realPlayer}'s turn.'`);
      this.submitCallback(null);
    }

    this.gameState = gameState;
    this.submitCallback(this);
  }

  play(player: cellType, column: number, gameState: IGameState) {
    for (let y = this.board_y - 1; y >= 0; y--) {
      const cell = this.getPoint(gameState, column, y);
      console.log(`cell = `, column, `y = ${y}`, cell);
      if (cell === cellEmpty) {
        this.setPoint(gameState, column, y, player);
        return true;
      }
    }
    console.log(`There is no room on column ${(column)}`);
    return false;
  }
}

export function isLife() {
  return true;
}

/*
Copyright (c) 2010-2013 Thomas Peri
http://www.tumuski.com/

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true,
	eqeqeq: true, plusplus: true, regexp: true, newcap: true, immed: true */
// (good parts minus bitwise and strict, plus white.)

/**
 * Nibbler - Multi-Base Encoder
 *
 * version 2013-04-24
 *
 * Options:
 *   dataBits: The number of bits in each character of unencoded data.
 *   codeBits: The number of bits in each character of encoded data.
 *   keyString: The characters that correspond to each value when encoded.
 *   pad (optional): The character to pad the end of encoded output.
 *   arrayData (optional): If truthy, unencoded data is an array instead of a string.
 *
 * Example:
 *
 * var base64_8bit = new Nibbler({
 *     dataBits: 8,
 *     codeBits: 6,
 *     keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
 *     pad: '='
 * });
 * base64_8bit.encode("Hello, World!");  // returns "SGVsbG8sIFdvcmxkIQ=="
 * base64_8bit.decode("SGVsbG8sIFdvcmxkIQ==");  // returns "Hello, World!"
 *
 * var base64_7bit = new Nibbler({
 *     dataBits: 7,
 *     codeBits: 6,
 *     keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
 *     pad: '='
 * });
 * base64_7bit.encode("Hello, World!");  // returns "kZdmzesQV9/LZkQg=="
 * base64_7bit.decode("kZdmzesQV9/LZkQg==");  // returns "Hello, World!"
 *
 */

interface INibblerOptions {
  dataBits: number;
  codeBits: number;
  keyString: string;
  arrayData?: string;
  pad: string;
}

const Nibbler = function(options: INibblerOptions) {
  "use strict";

  // Code quality tools like jshint warn about bitwise operators,
  // because they're easily confused with other more common operators,
  // and because they're often misused for doing arithmetic.  Nibbler uses
  // them properly, though, for moving individual bits, so turn off the warning.
  /*jshint bitwise:false */

  let construct,

    // options
    pad: string,
    dataBits: number,
    codeBits: number,
    keyString: string,
    arrayData: string,

    // private instance variables
    mask: number[], group: any, max: any,

    // private methods
    gcd: any, translate: any,

    // public methods
    encode: any, decode: any;

  // pseudo-constructor
  construct = function() {
    let i: any, mag: any, prev: any;

    // options
    pad = options.pad || '';
    dataBits = options.dataBits;
    codeBits = options.codeBits;
    keyString = options.keyString;
    arrayData = options.arrayData;

    // bitmasks
    mag = Math.max(dataBits, codeBits);
    prev = 0;
    mask = [];
    for (i = 0; i < mag; i += 1) {
      mask.push(prev);
      prev += prev + 1;
    }
    max = prev;

    // ouput code characters in multiples of this number
    group = dataBits / gcd(dataBits, codeBits);
  };

  // greatest common divisor
  gcd = function(a: number, b: number) {
    let t;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // the re-coder
  translate = function(input: any, bitsIn: any, bitsOut: any, decoding: any) {
    let i, len, chr, byteIn,
      buffer, size, output: any,
      write;

    // append a byte to the output
    write = function(n: number) {
      if (!decoding) {
        output.push(keyString.charAt(n));
      } else if (arrayData) {
        output.push(n);
      } else {
        output.push(String.fromCharCode(n));
      }
    };

    buffer = 0;
    size = 0;
    output = [];

    len = input.length;
    for (i = 0; i < len; i += 1) {
      // the new size the buffer will be after adding these bits
      size += bitsIn;

      // read a character
      if (decoding) {
        // decode it
        chr = input.charAt(i);
        byteIn = keyString.indexOf(chr);
        if (chr === pad) {
          break;
        } else if (byteIn < 0) {
          throw 'the character "' + chr + '" is not a member of ' + keyString;
        }
      } else {
        if (arrayData) {
          byteIn = input[i];
        } else {
          byteIn = input.charCodeAt(i);
        }
        if ((byteIn | max) !== max) {
          throw byteIn + " is outside the range 0-" + max;
        }
      }

      // shift the buffer to the left and add the new bits
      buffer = (buffer << bitsIn) | byteIn;

      // as long as there's enough in the buffer for another output...
      while (size >= bitsOut) {
        // the new size the buffer will be after an output
        size -= bitsOut;

        // output the part that lies to the left of that number of bits
        // by shifting the them to the right
        write(buffer >> size);

        // remove the bits we wrote from the buffer
        // by applying a mask with the new size
        buffer &= mask[size];
      }
    }

    // If we're encoding and there's input left over, pad the output.
    // Otherwise, leave the extra bits off, 'cause they themselves are padding
    if (!decoding && size > 0) {

      // flush the buffer
      write(buffer << (bitsOut - size));

      // add padding string for the remainder of the group
      while (output.length % group > 0) {
        output.push(pad);
      }
    }

    // string!
    return (arrayData && decoding) ? output : output.join('');
  };

  // **
  // * Encode.  Input and output are strings.
  // */
  encode = function(input: any) {
    return translate(input, dataBits, codeBits, false);
  };

  // /**
  // * Decode.  Input and output are strings.
  // */
  decode = function(input: any) {
    return translate(input, codeBits, dataBits, true);
  };

  this.encode = encode;
  this.decode = decode;
  construct();
};


export class Base32 {
  // We use '1' as a padding because the SOI password field we use to sneak
  // around information only allows alpha-numeric -- so we had to set `pad`
  // to one of our unused characters.

  readonly options = {
    dataBits: 8,
    codeBits: 5,
    keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    pad: '1'
  };

  public encode(str: string) {
    const k: any = Nibbler;
    const base32: any = new k(this.options);
    return base32.encode(str);
  }

  public decode(str: string) {
    const k: any = Nibbler;
    const base32: any = new k(this.options);
    return base32.decode(str);

  }

}
