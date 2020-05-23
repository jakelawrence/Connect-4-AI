import React, { Component } from "react";
import Node from "./node.jsx";

import "./board.css";

const ROWS = 7;
const COLUMNS = 7;
const PLAYER = 1;
const AI = 2;
const DEPTH = 5;
const CENTER_COLUMN = Math.floor(COLUMNS / 2);

class Board extends Component {
  state = {
    grid: [],
    nextOpenRow: [],
    gameInProgress: true,
    winner: 0,
  };

  componentDidMount() {
    const grid = drawBoard();
    this.setState({ grid });
  }

  handleClick(col) {
    let newGrid = dropPiece(this.state.grid, col, PLAYER);
    this.setState({ grid: newGrid });
    if (checkForWin(this.state.grid, PLAYER)) {
      console.log("PLAYER WINS");
    }
    let minimaxReturn = minimax(this.state.grid);
    console.log(minimaxReturn);
    let rowAI = getNextOpenRow(minimaxReturn.move, this.state.grid);
    if (rowAI < ROWS - 1) {
      let newGrid = getNewGrid(rowAI, minimaxReturn.move, this.state.grid, AI);
      this.setState({ grid: newGrid });
      if (checkForWin(this.state.grid, AI)) {
        console.log("AI WINS");
      }
    }
  }

  render() {
    const { grid } = this.state;
    const { gameInProgress } = this.state;
    return (
      <div className="grid">
        {grid.map((row, rowIdx) => {
          return (
            <div className="row" key={rowIdx}>
              {row.map((node, nodeIdx) => {
                const { row, col, isEmpty, isPlayer, isAI, isSelector } = node;

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
                    onClick={(col, grid) => this.handleClick(col)}
                  ></Node>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

const dropPiece = (grid, col, turn) => {
  let row = getNextOpenRow(col, grid);
  if (row < ROWS - 1) {
    let newGrid = getNewGrid(row, col, grid, turn);
    return newGrid;
  }
};

const minimax = (grid) => {
  let best = {
    move: null,
    score: -Infinity,
  };
  best.move = Math.floor(Math.random() * COLUMNS);
  let alpha = -Infinity;
  let beta = Infinity;
  let legalMoves = getValidDrops(grid);
  legalMoves.forEach((col) => {
    let gridCopy = JSON.parse(JSON.stringify(grid));
    let newBoard = dropPiece(gridCopy, col, AI);
    let moveScore = min(newBoard, alpha, beta, 1);
    if (moveScore > best.score) {
      best.score = moveScore;
      best.move = col;
    }
  });
  return best;
};

const max = (grid, alpha, beta, currentDepth) => {
  if (isTerminalGrid(grid)) {
    return evaluateEnd(grid);
  } else if (currentDepth === DEPTH) {
    return evaluateNonEnd(grid);
  } else {
    let score = -Infinity;
    let legalMoves = getValidDrops(grid);

    for (let i = 0; i < legalMoves.length; i++) {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      let newBoard = dropPiece(gridCopy, legalMoves[i], AI);
      let moveScore = min(newBoard, alpha, beta, currentDepth + 1);
      if (moveScore > score) {
        score = moveScore;
      }
      alpha = Math.max(alpha, score);
      if (alpha >= beta) {
        break;
      }
    }

    return score;
  }
};

const min = (grid, alpha, beta, currentDepth) => {
  if (isTerminalGrid(grid)) {
    return evaluateEnd(grid);
  } else if (currentDepth === DEPTH) {
    return evaluateNonEnd(grid);
  } else {
    let score = Infinity;
    let legalMoves = getValidDrops(grid);
    for (let i = 0; i < legalMoves.length; i++) {
      let gridCopy = JSON.parse(JSON.stringify(grid));
      let newBoard = dropPiece(gridCopy, legalMoves[i], PLAYER);
      let moveScore = max(newBoard, alpha, beta, currentDepth + 1);
      if (moveScore < score) {
        score = moveScore;
      }
      beta = Math.min(beta, score);
      if (alpha >= beta) {
        break;
      }
    }

    return score;
  }
};

const evaluateEnd = (grid) => {
  if (checkForWin(grid, AI) === true) {
    return Infinity;
  } else if (checkForWin(grid, PLAYER) === true) {
    return -Infinity;
  } else {
    return 0;
  }
};

const evaluateNonEnd = (grid) => {
  let score = 0;
  //score center column, more opportunities with the center column
  for (let row = 0; row < ROWS - 1; row++) {
    if (grid[row][CENTER_COLUMN].piece === AI) {
      score += 3;
    }
  }
  //score horizontal opportunities
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLUMNS - 3; c++) {
      let window = [grid[r][c], grid[r][c + 1], grid[r][c + 2], grid[r][c + 3]];
      score += evaluateWindow(window);
    }
  }
  //score vertical opportunities
  for (let c = 0; c < COLUMNS; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      let window = [grid[r][c], grid[r + 1][c], grid[r + 2][c], grid[r + 3][c]];
      score += evaluateWindow(window);
    }
  }

  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      let window = [
        grid[r][c],
        grid[r + 1][c + 1],
        grid[r + 2][c + 2],
        grid[r + 3][c + 3],
      ];
      score += evaluateWindow(window);
    }
  }

  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 3; r < ROWS - 1; r++) {
      let window = [
        grid[r][c],
        grid[r - 1][c + 1],
        grid[r - 2][c + 2],
        grid[r - 3][c + 3],
      ];
      score += evaluateWindow(window);
    }
  }

  return score;
};

const evaluateWindow = (window) => {
  let score = 0;
  let ai_pieces = 0;
  let player_pieces = 0;
  let empty_pieces = 0;
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
  if (ai_pieces === 4) {
    score += 100;
  } else if (ai_pieces === 3 && empty_pieces === 1) {
    score += 5;
  } else if (ai_pieces === 2 && empty_pieces === 2) {
    score += 2;
  }

  if (player_pieces === 3 && empty_pieces === 1) {
    score -= 7;
  } else if (player_pieces === 2 && empty_pieces === 2) {
    score -= 5;
  } else if (player_pieces === 2 && empty_pieces === 2) {
    score -= 3;
  }

  return score;
};

const getValidDrops = (grid) => {
  let validRows = [];
  for (let c = 0; c < COLUMNS; c++) {
    if (grid[ROWS - 2][c].piece === 0) {
      validRows.push(c);
    }
  }
  return validRows;
};

const isTerminalGrid = (grid) => {
  let validDrops = getValidDrops(grid);
  if (
    checkForWin(grid, PLAYER) ||
    checkForWin(grid, AI) ||
    validDrops.length === 0
  ) {
    return true;
  } else {
    return false;
  }
};

const checkForWin = (grid, turn) => {
  //check horizontal wins

  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 0; r < ROWS - 1; r++) {
      if (
        grid[r][c].piece === turn &&
        grid[r][c + 1].piece === turn &&
        grid[r][c + 2].piece === turn &&
        grid[r][c + 3].piece === turn
      ) {
        return true;
      }
    }
  }
  //check vertical wins
  for (let c = 0; c < COLUMNS; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      if (
        grid[r][c].piece === turn &&
        grid[r + 1][c].piece === turn &&
        grid[r + 2][c].piece === turn &&
        grid[r + 3][c].piece === turn
      ) {
        return true;
      }
    }
  }
  //check for upward diagonal wins
  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 0; r < ROWS - 4; r++) {
      if (
        grid[r][c].piece === turn &&
        grid[r + 1][c + 1].piece === turn &&
        grid[r + 2][c + 2].piece === turn &&
        grid[r + 3][c + 3].piece === turn
      ) {
        return true;
      }
    }
  }
  //check for downward diagonal wins
  for (let c = 0; c < COLUMNS - 3; c++) {
    for (let r = 3; r < ROWS - 1; r++) {
      if (
        grid[r][c].piece === turn &&
        grid[r - 1][c + 1].piece === turn &&
        grid[r - 2][c + 2].piece === turn &&
        grid[r - 3][c + 3].piece === turn
      ) {
        return true;
      }
    }
  }
};

const getNextOpenRow = (col, grid) => {
  for (let row = 0; row < ROWS - 1; row++) {
    if (grid[row][col].piece === 0) {
      return row;
    }
  }
  return Infinity;
};

const getNewGrid = (row, col, grid, turn) => {
  grid[row][col].piece = turn;
  if (turn === PLAYER) {
    grid[row][col].isPlayer = true;
  } else {
    grid[row][col].isAI = true;
  }
  grid[row][col].isEmpty = false;

  return grid;
};

const drawBoard = () => {
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < COLUMNS; col++) {
      currentRow.push(createNode(col, row, 0));
    }
    grid.push(currentRow);
  }
  return grid;
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
  };
};

export default Board;
