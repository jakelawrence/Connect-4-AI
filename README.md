# Connect 4 AI

## Introduction

This repository contains a React application that implements a Connect 4 game with an artificial intelligence opponent. The game is played on a 7-column and 6-row grid, and the goal is to get four of your pieces in a row (horizontally, vertically, or diagonally) before your opponent does.

## The Rules of Connect 4

1. The game is played between two players, one using red pieces and the other using yellow pieces.
2. Players take turns dropping their pieces into any of the seven columns.
3. The pieces fall to the bottom-most available row in the chosen column.
4. The first player to get four of their pieces in a row (horizontally, vertically, or diagonally) wins the game.
5. If all 42 spaces on the grid are filled and no player has four in a row, the game is a draw.

## The AI Algorithm: Minimax

The artificial intelligence opponent in this Connect 4 game uses the minimax algorithm to determine its moves. The minimax algorithm is a decision-making algorithm commonly used in two-player games like Connect 4. It explores all possible future moves and chooses the move that leads to the best outcome for the AI player, assuming that the other player will play optimally as well.

The algorithm evaluates the game tree by assigning a score to each node in the tree. Nodes representing terminal states (a win or draw for either player) are assigned a score of +1, -1, or 0, depending on the outcome. The score for non-terminal nodes is calculated based on the scores of its children, with the AI player maximizing its score and the other player minimizing it.

The AI player uses the minimax algorithm to determine the best move by choosing the child node with the highest score.
Running the Application Locally

## Running the Application Locally

To run the Connect 4 AI application on your local machine, follow these steps:

1. Clone the repository to your local machine using git clone https://github.com/jakelawrence/Connect-4-AI.git.
2. Navigate to the repository directory using the command line and run npm install to install all necessary dependencies.
3. Once the dependencies have been installed, run npm start to start the development server.
4. Open your browser and navigate to http://localhost:3000 to play the game.

## Conclusion

This Connect 4 AI application allows you to play against an AI opponent that uses the minimax algorithm to make its moves. By running the application locally, you can see how the AI algorithm works and even try to beat it!
