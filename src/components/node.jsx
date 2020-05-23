import React, { Component } from "react";
import "./node.css";

class Node extends Component {
  render() {
    const {
      col,
      row,
      isEmpty,
      isPlayer,
      isAI,
      isSelector,
      isWinningPiece,
      onClick,
    } = this.props;
    const extraClassName = isEmpty
      ? "piece-empty"
      : isPlayer
      ? "piece-player"
      : isAI
      ? "piece-AI"
      : isSelector
      ? "piece-selector"
      : "";
    const backGroundClass = isSelector
      ? "selectorBackgound"
      : "pieceBackground";

    const winningClass = isWinningPiece ? "winningPiece" : "";
    return (
      <div className={`${backGroundClass}`}>
        <div
          id={`piece-${row}-${col}`}
          className={`piece ${extraClassName} ${winningClass}`}
          onClick={() => onClick(col)}
        ></div>
      </div>
    );
  }
}

export default Node;
