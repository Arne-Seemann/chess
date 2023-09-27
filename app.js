//render board and pieces

const gameboard = document.getElementById("gameboard");
const pieces = [
  rook,
  knight,
  bishop,
  queen,
  king,
  bishop,
  knight,
  rook,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  pawn,
  rook,
  knight,
  bishop,
  queen,
  king,
  bishop,
  knight,
  rook,
];

function generateBoard() {
  pieces.forEach((piece, i) => {
    const square = document.createElement("div");
    square.setAttribute("square-id", i);
    square.innerHTML = piece;
    square.classList.add("square");
    gameboard.append(square);
    const row = Math.floor((63 - i) / 8 + 1);
    if (row % 2 === 0) {
      square.classList.add(i % 2 === 0 ? "brown1" : "brown2");
    } else {
      square.classList.add(i % 2 === 0 ? "brown2" : "brown1");
    }
    square.firstChild?.setAttribute("draggable", true);
    if (i <= 15) {
      square.firstChild.firstChild.classList.add("black");
      square.firstChild.classList.add("black");
    } else if (i >= 48) {
      square.firstChild.firstChild.classList.add("white");
      square.firstChild.classList.add("white");
    }
  });
}
generateBoard();

//Game mechanices

let draggedPiece;
let startSquare; //assigned in movePiece
let targetSquare; //assigned in dragdrop
let playersTurn = "white";
const squares = document.querySelectorAll(".square");
squares.forEach((square) => {
  square.addEventListener("dragstart", movePiece);
  square.addEventListener("dragover", dragover);
  square.addEventListener("drop", dragdrop);
  //help
  square.addEventListener("click", () => {
    console.log(square.getAttribute("square-id"));
  });
});

function movePiece(e) {
  if (e.target.classList.contains(playersTurn)) {
    draggedPiece = e.target;
    startSquare = Number(draggedPiece.parentElement.getAttribute("square-id"));
  } else {
    e.preventDefault();
  }
}

function dragover(e) {
  e.preventDefault();
}

function dragdrop(e) {
  targetSquare = e.target.parentElement.classList.contains("square")
    ? Number(e.target.parentElement.getAttribute("square-id"))
    : Number(e.target.getAttribute("square-id"));
  const take = e.target.classList.contains("piece");
  const opponent = playersTurn === "white" ? "black" : "white";
  const opponentTake = e.target.classList.contains(opponent);
  const valid = validMove(startSquare, targetSquare, draggedPiece.id);

  if (valid) {
    if (opponentTake) {
      e.target.parentElement.append(draggedPiece);
      e.target.firstChild.remove();
      if (isKingInCheck()) {
        if (playersTurn === "black") {
          reverseIDs();
        }
        alert("you are in check!");
        restoreChessboard();
        return;
      }
      playersTurn = opponent;
    } else if (take) {
      return;
    } else {
      e.target.append(draggedPiece);
      if (isKingInCheck()) {
        if (playersTurn === "black") {
          reverseIDs();
        }
        alert("you are in check!");
        restoreChessboard();
        return;
      }
      playersTurn = opponent;
    }

    if (isKingInCheck()) {
      alert("check!");
    }
  } else {
    alert("invalid Move");
    return;
  }
  saveBoardState();
  reverseIDs();
  // flipBoard();
}

function isKingInCheck() {
  const opponent = playersTurn === "white" ? "black" : "white";
  const opponentPieces = document.querySelectorAll(`.piece.${opponent}`);
  let inCheck = false;
  for (const piece of opponentPieces) {
    const whiteKingSquare = Number(
      document
        .querySelector(`#king.${playersTurn}`)
        .parentElement.getAttribute("square-id")
    );
    const pieceSquare = Number(piece.parentElement.getAttribute("square-id"));
    const check = validMove(pieceSquare, whiteKingSquare, piece.id);
    if (check) {
      inCheck = true;
      break;
    }
  }
  return inCheck;
}

const boardState = [];
function saveBoardState() {
  boardState.length = 0;
  document.querySelectorAll(".square").forEach((square) => {
    boardState.push(square.innerHTML);
  });
  return boardState;
}

function restoreChessboard() {
  boardState.forEach((square, i) => {
    document.querySelector(`[square-id="${i}"]`).innerHTML = square;
  });
}

function flipBoard() {
  gameboard.classList.toggle("reverse");
  document.querySelectorAll(".piece").forEach((piece) => {
    piece.classList.toggle("reverse");
  });
}

//necessary to avoid defining valid pawn moves twice
function reverseIDs() {
  squares.forEach((square) => {
    square.setAttribute(
      "square-id",
      parseInt(63 - Number(square.getAttribute("square-id")))
    );
  });
}

//valid moves

function validMove(startID, targetID, piece) {
  switch (piece) {
    case "pawn":
      return validMoves.pawn(startID, targetID);
    case "bishop":
      return validMoves.bishop(startID, targetID);
    case "knight":
      return validMoves.knight(startID, targetID);
    case "rook":
      return validMoves.rook(startID, targetID);
    case "queen":
      return validMoves.queen(startID, targetID);
    case "king":
      return validMoves.king(startID, targetID);
  }
}

const validMoves = {
  pawn: (startID, targetID) => {
    const startRow = [48, 49, 50, 51, 52, 53, 54, 55];
    return (
      (startRow.includes(startID) &&
        startID - 16 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes()) ||
      (startID - 8 + 1 === targetID &&
        document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes()) ||
      (startID - 8 - 1 === targetID &&
        document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes())
    );
  },
  bishop: (startID, targetID) => {
    return (
      startID - 8 + 1 === targetID ||
      startID - 8 - 1 === targetID ||
      startID + 8 + 1 === targetID ||
      startID + 8 - 1 === targetID ||
      (startID - 2 * 8 + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes()) ||
      (startID - 2 * 8 - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes()) ||
      (startID + 2 * 8 - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes()) ||
      (startID + 2 * 8 + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 + 5}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 - 5}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 - 5}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 + 5}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8 + 6}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 - 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8 - 6}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 - 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8 - 6}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8 + 6}"]`)
          .hasChildNodes())
    );
  },
  knight: (startID, targetID) => {
    return (
      startID + 2 * 8 + 1 === targetID ||
      startID + 2 * 8 - 1 === targetID ||
      startID - 2 * 8 + 1 === targetID ||
      startID - 2 * 8 - 1 === targetID ||
      startID + 8 - 2 === targetID ||
      startID + 8 + 2 === targetID ||
      startID - 8 - 2 === targetID ||
      startID - 8 + 2 === targetID
    );
  },
  rook: (startID, targetID) => {
    return (
      startID + 8 === targetID ||
      (startID + 2 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 === targetID &&
        !document.querySelector(`[square-id="${startID + 8}"]`) &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8}"]`)
          .hasChildNodes()) ||
      startID - 8 === targetID ||
      (startID - 2 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8}"]`)
          .hasChildNodes()) ||
      startID + 1 === targetID ||
      (startID + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes()) ||
      (startID + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes()) ||
      (startID + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes()) ||
      (startID + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes()) ||
      (startID + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5}"]`)
          .hasChildNodes()) ||
      (startID + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6}"]`)
          .hasChildNodes()) ||
      startID - 1 === targetID ||
      (startID - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes()) ||
      (startID - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes()) ||
      (startID - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes()) ||
      (startID - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes()) ||
      (startID - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5}"]`)
          .hasChildNodes()) ||
      (startID - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5}"]`)
          .hasChildNodes() &&
        !document.querySelector(`[square-id="${startID - 6}"]`).hasChildNodes())
    );
  },
  queen: (startID, targetID) => {
    return (
      startID - 8 + 1 === targetID ||
      startID - 8 - 1 === targetID ||
      startID + 8 + 1 === targetID ||
      startID + 8 - 1 === targetID ||
      (startID - 2 * 8 + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes()) ||
      (startID - 2 * 8 - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes()) ||
      (startID + 2 * 8 - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes()) ||
      (startID + 2 * 8 + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 + 5}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 - 5}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 - 5}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 + 5}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8 + 6}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8 - 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8 - 6}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 - 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8 - 6}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8 + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8 + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8 + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8 + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8 + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8 + 6}"]`)
          .hasChildNodes()) ||
      startID + 8 === targetID ||
      (startID + 2 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes()) ||
      (startID + 3 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 4 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 5 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 6 * 8 === targetID &&
        !document.querySelector(`[square-id="${startID + 8}"]`) &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8}"]`)
          .hasChildNodes()) ||
      (startID + 7 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6 * 8}"]`)
          .hasChildNodes()) ||
      startID - 8 === targetID ||
      (startID - 2 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes()) ||
      (startID - 3 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 4 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 5 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 6 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8}"]`)
          .hasChildNodes()) ||
      (startID - 7 * 8 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5 * 8}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 6 * 8}"]`)
          .hasChildNodes()) ||
      startID + 1 === targetID ||
      (startID + 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes()) ||
      (startID + 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes()) ||
      (startID + 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes()) ||
      (startID + 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes()) ||
      (startID + 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5}"]`)
          .hasChildNodes()) ||
      (startID + 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID + 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 5}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID + 6}"]`)
          .hasChildNodes()) ||
      startID - 1 === targetID ||
      (startID - 2 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes()) ||
      (startID - 3 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes()) ||
      (startID - 4 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes()) ||
      (startID - 5 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes()) ||
      (startID - 6 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5}"]`)
          .hasChildNodes()) ||
      (startID - 7 === targetID &&
        !document
          .querySelector(`[square-id="${startID - 1}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 2}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 3}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 4}"]`)
          .hasChildNodes() &&
        !document
          .querySelector(`[square-id="${startID - 5}"]`)
          .hasChildNodes() &&
        !document.querySelector(`[square-id="${startID - 6}"]`).hasChildNodes())
    );
  },
  king: (startID, targetID) => {
    return (
      startID + 1 === targetID ||
      startID - 1 === targetID ||
      startID + 8 === targetID ||
      startID - 8 === targetID ||
      startID + 8 - 1 === targetID ||
      startID + 8 + 1 === targetID ||
      startID - 8 + 1 === targetID ||
      startID - 8 - 1 === targetID
    );
  },
};
