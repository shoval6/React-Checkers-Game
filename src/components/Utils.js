
export const initBoard = [
['B','null','B','null','B','null','B','null'],
['null','B','null','B','null','B','null','B'],
['B','null','B','null','B','null','B','null'],
['null','-','null','-','null','-','null','-'],
['-','null','-','null','-','null','-','null'],
['null','W','null','W','null','W','null','W'],
['W','null','W','null','W','null','W','null'],
['null','W','null','W','null','W','null','W']
]

export function evaluateWinner(board){
    let whitePlayer = 0;
    let blackPlayer = 0;
    for(let i=0; i<board.length; ++i){
      for(let j=0; j<board.length; ++j){
        const squareValue = board[i][j];
        if(squareValue === 'W' || squareValue === 'WK') whitePlayer++;
        if(squareValue === 'B' || squareValue === 'BK') blackPlayer++;
      }
    }

    if(whitePlayer === 0) return 'black';
    if(blackPlayer === 0) return 'white';
    return false; 

  }

  export function isKing(rowIndex,clickedSquare,currentPlayer){
    if(clickedSquare.length > 1) return false;
    if(currentPlayer)
      return rowIndex === 0 ? 'WK' : false ;
    else
      return rowIndex === 7 ? 'BK' : false ;
  }

  export function replaceSquare(board,rowIndex,colIndex,symbol){
    board[rowIndex][colIndex] = symbol
  }

  export function checkBounds(rowIndex,colIndex){
    if(rowIndex < 0 || colIndex < 0 || rowIndex > 7 || colIndex > 7)
      return true;
    return false;
  }


  