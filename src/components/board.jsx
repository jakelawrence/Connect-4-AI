import React, { Component } from "react";
import Node from "./node.jsx";

import "./board.css";

const ROWS = 7;
const COLUMNS = 7;
const PLAYER = 1;
const AI = 2;
const CENTER_COLUMN = Math.floor(COLUMNS / 2);

class Board extends Component {
  state = {
    //init board
    board: [],

    //for winner message after game over
    winnerColor: "",
    winner: " ",

    gameOver: false,

    difficulty: {
      //difficulty of ai, default is easy
      selectedDifficulty: "easy",

      //depth for the minimax algorithm
      depth: 1,

      //css classes for buttons
      easy: "difficultyButtonSelected",
      medium: "difficultyButton",
      hard: "difficultyButton",
    },
  };

  componentDidMount() {
    const board = drawBoard();
    this.setState({ board });
  }
  //for pressing new game
  resetBoard() {
    const board = drawBoard();
    this.setState({ board });
    this.setState({ winner: "" });
    this.setState({ gameOver: false });
  }

  //changes difficulty in scoring for minimax and the depth the alg travels as well
  changeDifficulty(difficulty) {
    let updateDifficulty = this.state.difficulty;

    switch (difficulty) {
      case "easy":
        updateDifficulty.selectedDifficulty = "easy";
        updateDifficulty.easy = "difficultyButtonSelected";
        updateDifficulty.medium = "difficultyButton";
        updateDifficulty.hard = "difficultyButton";
        updateDifficulty.depth = 2;
        this.resetBoard();
        break;
      case "medium":
        updateDifficulty.selectedDifficulty = "medium";
        updateDifficulty.easy = "difficultyButton";
        updateDifficulty.medium = "difficultyButtonSelected";
        updateDifficulty.hard = "difficultyButton";
        updateDifficulty.depth = 3;
        this.resetBoard();
        break;
      default:
        updateDifficulty.selectedDifficulty = "hard";
        updateDifficulty.easy = "difficultyButton";
        updateDifficulty.medium = "difficultyButton";
        updateDifficulty.hard = "difficultyButtonSelected";
        updateDifficulty.depth = 5;
        this.resetBoard();
        break;
    }
    this.setState({ difficulty: updateDifficulty });
  }

  //when a piece has been clicked, execute
  handleClick(col) {
    //if the game is not over
    if (!this.state.gameOver) {
      //if the column is not completely full of game pieces
      if (this.state.board[ROWS - 2][col].piece === 0) {
        //drop the piece
        let newBoard = dropPiece(this.state.board, col, PLAYER);
        this.setState({ board: newBoard });
        //check for a four in a row
        let forWinPlayer = checkForWin(this.state.board, PLAYER);
        if (forWinPlayer.isWin) {
          //highlight the four in a row with css
          let finalBoard = highlightWin(forWinPlayer, this.state.board);
          //set the footer to say the winner
          this.setState({
            board: finalBoard,
            winner: "YOU WIN!",
            winnerColor: "red",
            gameOver: true,
          });
          return;
        }

        //get the score and column returned by the minimax
        let minimaxReturn = minimax(
          this.state.board, //game board
          this.state.difficulty.depth, //how many steps the minimax looks ahead
          this.state.difficulty.selectedDifficulty //difficulty selected by user
        );
        // get the row that is corresponding to the column returned by minimax for the placement
        let rowAI = getNextOpenRow(minimaxReturn.move, this.state.board);
        //double check the row isnt full
        if (rowAI < ROWS - 1) {
          let newBoard = getNewBoard(
            rowAI,
            minimaxReturn.move,
            this.state.board,
            AI
          );
          this.setState({ board: newBoard });
          //check for four in a row
          let forWinAI = checkForWin(this.state.board, AI);
          if (forWinAI.isWin) {
            //highlight four in a row with css
            let finalBoard = highlightWin(forWinAI, this.state.board);
            this.setState({
              board: finalBoard,
              winner: "AI WINS!",
              winnerColor: "gold",
              gameOver: true,
            });
            return;
          }
        }
      }
    }
  }

  render() {
    const { board } = this.state;

    return (
      <div className="main">
        <div className="head">
          <div className="title">CONNECT 4 AI</div>
          <div className="difficultyGroup">
            <div
              onClick={() => this.changeDifficulty("easy")}
              className={this.state.difficulty.easy}
            >
              Easy
            </div>
            <div
              onClick={() => this.changeDifficulty("medium")}
              className={this.state.difficulty.medium}
            >
              Medium
            </div>
            <div
              onClick={() => this.changeDifficulty("hard")}
              className={this.state.difficulty.hard}
            >
              Hard
            </div>
          </div>
          <div className="newGame">
            <div className="newGameButton" onClick={() => this.resetBoard()}>
              New Game
            </div>
          </div>
        </div>
        <div className="board">
          {board.map((row, rowIdx) => {
            return (
              <div className="pieceRow" key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {
                    row,
                    col,
                    isEmpty,
                    isPlayer,
                    isAI,
                    isSelector,
                    isWinningPiece,
                  } = node;

                  return (
                    <Node
                      style={{ backgroundColor: "blue" }}
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isEmpty={isEmpty}
                      isPlayer={isPlayer}
                      isAI={isAI}
                      isSelector={isSelector}
                      isWinningPiece={isWinningPiece}
                      onClick={(col) => this.handleClick(col)}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ color: this.state.winnerColor }} className="foot">
            {this.state.winner}
        </div>
      </div>
    );
  }
}

//drop the piece in the game board
const dropPiece = (board, col, turn) => {
  let row = getNextOpenRow(col, board);
  if (row < ROWS - 1) {
    let newBoard = getNewBoard(row, col, board, turn);
    return newBoard;
  }
};

//minimax algorithm searches all possibilites to a certain depth
//uses alpha beta pruing to speed up the process
//finds the most effective move based on heuristuc score
const minimax = (board, depth, difficulty) => {
  let best = {
    move: null,
    score: -Infinity,
  };
  let alpha = -Infinity;
  let beta = Infinity;
  //get all non-filled rows
  let legalMoves = getValidDrops(board);
  //simulate drops for each row that is available
  legalMoves.forEach((col) => {
    //create a deep copy of board to avoid changing the state
    let boardCopy = JSON.parse(JSON.stringify(board));
    let newBoard = dropPiece(boardCopy, col, AI);
    //pass to min
    let moveScore = min(newBoard, alpha, beta, 1, depth, difficulty);
    //find the best score of all the columns
    if (moveScore > best.score) {
      best.score = moveScore;
      best.move = col;
    }
    if (alpha >= beta) {
      return;
    }
  });
  if (difficulty === "easy" && !Math.floor(Math.random() * 3)) {
    let item = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    best.move = item;
  }
  return best;
};

//find the move that benefits the AI the most, which is the largest possible heuristic score
const max = (board, alpha, beta, currentDepth, depth, difficulty) => {
  //if the move leads to a connect 4 or tie game
  if (isTerminalBoard(board) || currentDepth === depth) {
    return evaluate(board, difficulty);
  }
  //simulate all possible drops again
  //this is a recursive functiom
  //look up minimax pseudocode if confused
  else {
    //start with lowest possible score, negative infinity
    let score = -Infinity;
    //get all open columns
    let legalMoves = getValidDrops(board);
    //simulate a drop for each possible move
    for (let i = 0; i < legalMoves.length; i++) {
      //deep copy board so it doesn't change the current state
      //we do this because we are just simulating the drops
      let boardCopy = JSON.parse(JSON.stringify(board));
      let newBoard = dropPiece(boardCopy, legalMoves[i], AI);
      let moveScore = min(
        newBoard,
        alpha,
        beta,
        currentDepth + 1,
        depth,
        difficulty
      );
      //find the score that is best for AI and set it to the new best score
      score = Math.max(score, moveScore);
      alpha = Math.max(alpha, score);
      //we use alpha beta pruing to break out of a simulated move
      if (alpha >= beta) {
        return alpha;
      }
    }

    return score;
  }
};

//find the move that hurts the PLAYER the most, which is the smallest possible heuristic score
const min = (board, alpha, beta, currentDepth, depth, difficulty) => {
  //if the move leads to a connect 4 or tie game
  //or if the minimax has looked as far as it can go with the given depth
  if (isTerminalBoard(board) || currentDepth === depth) {
    return evaluate(board, difficulty);
  }

  //simulate all possible drops again
  //this is a recursive functiom
  //look up minimax pseudocode if confused
  else {
    //start with highest possible score, infinity
    let score = Infinity;
    //get all open columns
    let legalMoves = getValidDrops(board);
    //simulate a drop for each possible move
    for (let i = 0; i < legalMoves.length; i++) {
      //deep copy board so it doesn't change the current state
      //we do this because we are just simulating the drops
      let boardCopy = JSON.parse(JSON.stringify(board));
      let newBoard = dropPiece(boardCopy, legalMoves[i], PLAYER);
      let moveScore = max(
        newBoard,
        alpha,
        beta,
        currentDepth + 1,
        depth,
        difficulty
      );
      //find the score that inhibits PLAYER the most and set it to the new best score
      score = Math.min(score, moveScore);
      beta = Math.min(beta, score);
      //we use alpha beta pruing to break out of a simulated move
      if (alpha >= beta) {
        return beta;
      }
    }

    return score;
  }
};

//if the game has been simulated to its end by the minimac algorithm
//check who has one the simulated game
//if its the AI, we want that move so return infinity
//if its the PLAYER, we dont want that move, so return negative infinity
//else, the game is a tie so we return zero
//if the game has been simulated to the maximum depth
const evaluate = (board, difficulty) => {
  let score = 0;

  if (isTerminalBoard(board)) {
    let checkPlayer = checkForWin(board, PLAYER);
    let checkAI = checkForWin(board, AI);
    if (checkAI.isWin) {
      score = Infinity;
    } else if (checkPlayer.isWin) {
      score = -Infinity;
    } else {
      score = 0;
    }
  } else {
    for (let r = 0; r < ROWS - 1; r++) {
      if (board[r][CENTER_COLUMN].piece === 2) {
        score += 1;
      }
    }
    //score horizontal opportunities
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLUMNS - 3; c++) {
        let window = [
          board[r][c],
          board[r][c + 1],
          board[r][c + 2],
          board[r][c + 3],
        ];
        score += evaluateWindow(window, difficulty);
      }
    }
    //score vertical opportunities
    for (let c = 0; c < COLUMNS; c++) {
      for (let r = 0; r < ROWS - 4; r++) {
        let window = [
          board[r][c],
          board[r + 1][c],
          board[r + 2][c],
          board[r + 3][c],
        ];
        score += evaluateWindow(window, difficulty);
      }
    }

    //score upward diagonal opportunities
    for (let c = 0; c < COLUMNS - 3; c++) {
      for (let r = 0; r < ROWS - 4; r++) {
        let window = [
          board[r][c],
          board[r + 1][c + 1],
          board[r + 2][c + 2],
          board[r + 3][c + 3],
        ];
        score += evaluateWindow(window, difficulty);
      }
    }

    //score downward diagonal opportunites
    for (let c = 0; c < COLUMNS - 3; c++) {
      for (let r = 3; r < ROWS - 1; r++) {
        let window = [
          board[r][c],
          board[r - 1][c + 1],
          board[r - 2][c + 2],
          board[r - 3][c + 3],
        ];
        score += evaluateWindow(window, difficulty);
      }
    }
  }

  return score;
};

//score the window given by evaluateNonEnd
//this is where the difficulties come into play
const evaluateWindow = (window, difficulty) => {
  let score = 0;
  let ai_pieces = 0;
  let player_pieces = 0;
  let empty_pieces = 0;

  //count the pieces in the given window of 4 pieces passed in
  for (let i = 0; i < window.length; i++) {
    switch (window[i].piece) {
      case AI:
        ai_pieces++;
        break;
      case PLAYER:
        player_pieces++;
        break;
      default:
        empty_pieces++;
    }
  }

  //easy difficulty will still prevent the player from getting 4 in a fours
  //but it doesn't try to set itself up for any moves in the future for the most part
  if (difficulty === "easy") {
    if (player_pieces === 3 && empty_pieces === 1) {
      score -= 1;
    } else if (player_pieces === 2 && empty_pieces === 2) {
      score -= 2;
    }
  }
  //medium will still not set up for much in the future
  //but the depth is greater so its harder to beat than the easy AI
  if (difficulty === "medium") {
    if (player_pieces === 3 && empty_pieces === 1) {
      score -= 1;
    } else if (player_pieces === 2 && empty_pieces === 2) {
      score -= 2;
    }
  }
  //the hard is looking farther into the game for the best moves
  //it is also minimizing the win for the PLAYER
  //while simultaneously maximizing the AIs change to win
  if (difficulty === "hard") {
    if (ai_pieces === 4) {
      score += 100; // Ensure winning moves are highly prioritized.
    }
    if (ai_pieces === 3 && empty_pieces === 1) {
      score += 10; // Encourage moves that lead to a win.
    }
    if (player_pieces === 4) {
      score -= 4;
    } else if (player_pieces === 3 && empty_pieces === 1) {
      score -= 2;
    }
    if (player_pieces === 4) {
      score -= 100; // Block winning moves for the player.
    }
  }

  return score;
};

const getValidDrops = (board) => {
  let validRows = [];
  for (let c = 0; c < COLUMNS; c++) {
    if (board[ROWS - 2][c].piece === 0) {
      validRows.push(c);
    }
  }
  return validRows;
};

const isTerminalBoard = (board) => {
  let validDrops = getValidDrops(board);
  if (
    checkForWin(board, PLAYER).isWin ||
    checkForWin(board, AI).isWin ||
    validDrops.length === 0
  ) {
    return true;
  } else {
    return false;
  }
};

const checkForWin = (board, turn) => {
  //check horizontal wins
  let fourInARow = {
    isWin: false,
    one: {
      r: 0,
      c: 0,
    },
    two: {
      r: 0,
      c: 0,
    },
    three: {
      r: 0,
      c: 0,
    },
    four: {
      r: 0,
      c: 0,
    },
  };
  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 0; r < ROWS - 1; r++) {
      if (
        board[r][c].piece === turn &&
        board[r][c + 1].piece === turn &&
        board[r][c + 2].piece === turn &&
        board[r][c + 3].piece === turn
      ) {
        fourInARow.one.r = r;
        fourInARow.one.c = c;
        fourInARow.two.r = r;
        fourInARow.two.c = c + 1;
        fourInARow.three.r = r;
        fourInARow.three.c = c + 2;
        fourInARow.four.r = r;
        fourInARow.four.c = c + 3;
        fourInARow.isWin = true;
        return fourInARow;
      }
    }
  }
  //check vertical wins
  for (let c = 0; c < COLUMNS; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      if (
        board[r][c].piece === turn &&
        board[r + 1][c].piece === turn &&
        board[r + 2][c].piece === turn &&
        board[r + 3][c].piece === turn
      ) {
        fourInARow.one.r = r;
        fourInARow.one.c = c;
        fourInARow.two.r = r + 1;
        fourInARow.two.c = c;
        fourInARow.three.r = r + 2;
        fourInARow.three.c = c;
        fourInARow.four.r = r + 3;
        fourInARow.four.c = c;
        fourInARow.isWin = true;
        return fourInARow;
      }
    }
  }
  //check for upward diagonal wins
  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      if (
        board[r][c].piece === turn &&
        board[r + 1][c + 1].piece === turn &&
        board[r + 2][c + 2].piece === turn &&
        board[r + 3][c + 3].piece === turn
      ) {
        fourInARow.one.r = r;
        fourInARow.one.c = c;
        fourInARow.two.r = r + 1;
        fourInARow.two.c = c + 1;
        fourInARow.three.r = r + 2;
        fourInARow.three.c = c + 2;
        fourInARow.four.r = r + 3;
        fourInARow.four.c = c + 3;
        fourInARow.isWin = true;
        return fourInARow;
      }
    }
  }
  //check for downward diagonal wins
  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 3; r < ROWS - 1; r++) {
      if (
        board[r][c].piece === turn &&
        board[r - 1][c + 1].piece === turn &&
        board[r - 2][c + 2].piece === turn &&
        board[r - 3][c + 3].piece === turn
      ) {
        fourInARow.one.r = r;
        fourInARow.one.c = c;
        fourInARow.two.r = r - 1;
        fourInARow.two.c = c + 1;
        fourInARow.three.r = r - 2;
        fourInARow.three.c = c + 2;
        fourInARow.four.r = r - 3;
        fourInARow.four.c = c + 3;
        fourInARow.isWin = true;
        return fourInARow;
      }
    }
  }
  return fourInARow;
};

const highlightWin = (fourInARow, board) => {
  board[fourInARow.one.r][fourInARow.one.c].isWinningPiece = true;
  board[fourInARow.two.r][fourInARow.two.c].isWinningPiece = true;
  board[fourInARow.three.r][fourInARow.three.c].isWinningPiece = true;
  board[fourInARow.four.r][fourInARow.four.c].isWinningPiece = true;
  return board;
};

const getNextOpenRow = (col, board) => {
  for (let row = 0; row < ROWS - 1; row++) {
    if (board[row][col].piece === 0) {
      return row;
    }
  }
  return Infinity;
};

const getNewBoard = (row, col, board, turn) => {
  board[row][col].piece = turn;
  if (turn === PLAYER) {
    board[row][col].isPlayer = true;
  } else {
    board[row][col].isAI = true;
  }
  board[row][col].isEmpty = false;

  return board;
};

const drawBoard = () => {
  const board = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLUMNS; col++) {
      currentRow.push(createNode(col, row, 0));
    }
    board.push(currentRow);
  }
  return board;
};

const createNode = (col, row, piece) => {
  return {
    col,
    row,
    piece,
    isEmpty: row !== ROWS - 1,
    isPlayer: false,
    isAI: false,
    isSelector: row === ROWS - 1,
    isWinningPiece: false,
  };
};

export default Board;
