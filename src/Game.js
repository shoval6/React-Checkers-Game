import React from 'react';
import './index.css';
import Board from './components/Board';
import * as Utils from './components/Utils';

const INITBOARD = Utils.initBoard;

class Game extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      board: this.getBoard(),
      history: [{
                boardState: this.getBoard(),
                currentPlayer: true,
            }],
      currentPlayer:true,
      moves: [],
      clicks: [false,false],
      squareCoords:[-1,-1],
      stepNumber: 0,
      isWinner : false,

    }
  }

  
  onClickHandle(rowIndex,colIndex){
    const {board, clicks, currentPlayer, squareCoords} = this.state;
    const currentState = this.getCurrentState();
    const tempBoard = this.cloneBoard(currentState.boardState);
    let clickedSquare = board[rowIndex][colIndex];
    let firstClick = clicks[0];
    let secondClick = clicks[1];


    // clicked on an empty square , or opponent square.
    if(clickedSquare === "-" || (clickedSquare.charAt(0) !== (currentPlayer ? 'W' : 'B') && 
      clickedSquare !== 'O')) return; 
    
    //initial first click
    if(firstClick === false || clickedSquare === (currentPlayer ? 'W' : 'B' ) ||
    clickedSquare === (currentPlayer ? 'WK' : 'BK' )){
      squareCoords[0] = rowIndex;
      squareCoords[1] = colIndex;
      firstClick = true;
    }

    //initial second click
    if(clickedSquare === 'O'){
      firstClick = false;
      secondClick = true;
    }

    if(firstClick === true){
      const res = this.checkOptionalMoves(tempBoard,rowIndex,colIndex,clickedSquare);
      tempBoard[rowIndex][colIndex] = 'H';

      for(let i=0; i<res.length; ++i){
        const {row,col} = res[i];
        tempBoard[row][col] = 'O';
      }

      this.setState({
        board: tempBoard,
        clicks : [firstClick,secondClick],
        moves: res,
      })
      return;
    }

    if(secondClick === true){
      clickedSquare = tempBoard[squareCoords[0]][squareCoords[1]];
      const {moves} = this.state;
      const flag = Utils.isKing(rowIndex,clickedSquare);
      Utils.replaceSquare(tempBoard,rowIndex,colIndex,(flag ? flag : clickedSquare));
      Utils.replaceSquare(tempBoard,squareCoords[0],squareCoords[1],'-');

      if(moves.length > 0){
        for(let i=0; i<moves.length; ++i){
          const {row,col,deleteList} = moves[i];
          if(row === rowIndex && col === colIndex){
            for(let j=0; j<deleteList.length; ++j){
              const {row,col} = deleteList[j];
              Utils.replaceSquare(tempBoard,row,col,'-');
            }
            i=moves.length;
          }
        }
      }

      const winner = Utils.evaluateWinner(tempBoard);
      console.log(winner)

      this.setState({
        board: tempBoard,
        currentPlayer: !this.state.currentPlayer,
        history:this.state.history.concat([{
          boardState:tempBoard,
          currentPlayer:!this.state.currentPlayer,
        }]),
        stepNumber: this.state.history.length,
        squareCoords: [-1,-1],
        isWinner: winner,

      })
      return;

    }
  }


  // checks the first move (not jumps) to a neighboring square. 
  // for a king state checks also forward and backward direction.
  // finally stores the founded moves in array .
  checkOptionalMoves(board,rowIndex,colIndex,clickedSquare){
    const {currentPlayer} = this.state;
    const optionalMoves = [];
    const playerDirection = [];
    const leftRight = [-1,1];
    const isKing = clickedSquare.length > 1 ? true : false;
    if(currentPlayer)
      playerDirection.push(-1); 
    else
      playerDirection.push(1);

    //if the selected piece is a king , we also check both directions forward and backward.
    if(isKing)
      playerDirection.push(playerDirection[0]*-1);

    for(let i=0; i<playerDirection.length; ++i){
      for(let j=0; j<leftRight.length; ++j){
        const row = rowIndex + playerDirection[i]; 
        const col = colIndex + leftRight[j];
        if(Utils.checkBounds(row,col,currentPlayer)) continue;
        const squareValue = board[row][col];
        if(squareValue === '-'){
          const move = {
            row: row,
            col: col,
            deleteList: []
          }
          optionalMoves.push(move);
        }
      }
    }   
        let prevSquare = {row:rowIndex,col:colIndex}
        const jumps = this.checkOptionalJumps(board,rowIndex,colIndex,prevSquare,playerDirection,[],[])
        optionalMoves.push(...jumps);
        return optionalMoves;   
    }

    // here we check for possible jump moves , for each direction we look 2 diag spaces away 
    // to see if the square is free and if we jumped over an enemy . 
    checkOptionalJumps(board,rowIndex,colIndex,prevSquare,playerDirection,deleteList,optionalMoves){
      const {currentPlayer} = this.state;
      const leftRight = [-1,1];
      let {row,col,rowJump,colJump,squareValue} = 0;

      for(let i=0; i<playerDirection.length; ++i){
        for(let j=0; j<leftRight.length; ++j){
          row = rowIndex + playerDirection[i]; 
          col = colIndex + leftRight[j];
         if(Utils.checkBounds(row,col)) continue;
          squareValue = board[row][col];
         if((currentPlayer ? 'B' : 'W') === squareValue.charAt(0)){
          rowJump = rowIndex + 2*playerDirection[i];
          colJump = colIndex + 2*leftRight[j];
          if(Utils.checkBounds(rowJump,colJump)) continue;
          squareValue = board[rowJump][colJump];
          if(prevSquare.row === rowJump && prevSquare.col === colJump) continue;
          if(squareValue === '-'){
            const move = {
              row: rowJump,
              col: colJump,
              deleteList:[{row:row,col:col}]
            }
            for(let i=0; i<deleteList.length; ++i)
              move.deleteList.push(deleteList[i]);
            optionalMoves.push(move);

          }
        }
      }
    }

    const temp = [];
    for(let i=0; i<optionalMoves.length; ++i){  
      prevSquare = {row:rowIndex,col:colIndex}
      const {row , col , deleteList} = optionalMoves[i];
      const nextJumps = this.checkOptionalJumps(board,row,col,prevSquare,playerDirection,deleteList,[]);
      temp.push(...nextJumps);
    }
    optionalMoves.push(...temp);
    return optionalMoves;
    
    }


    getCurrentState() {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      return history[history.length - 1];
    }


    getBoard = () => {
      return this.cloneBoard(INITBOARD);
    }


    cloneBoard(array){
      return array.map(o => [...o]); 
    }

    undo() {
      const backStep = this.state.stepNumber-1;
      if (backStep < 0) {
        return;
      }
      const history = this.state.history.slice(0, backStep+1);
      const currentState = history[history.length - 1];
      const currentPlayer = currentState.currentPlayer;
      const tempBoard = this.cloneBoard(currentState.boardState);

      this.setState({
        board: tempBoard,
        history: history,
        moves: [],
        clicks: [false,false],
        squareCoords: [-1,-1],
        stepNumber: backStep,
        currentPlayer: currentPlayer,
      })
    }

  render(){

    const {board , isWinner , currentPlayer} = this.state;
    let status = null;
    if(isWinner)
      status = isWinner + " is the winner !!!";
    else
      status = currentPlayer ? "white is your turn" : "black is your turn";


    return (
      <div >
        <div className="center">
        {board.map((row,i) => (
          <div className="board-row" key={i}>
          {row.map((col,j) =>
            (<Board 
                   symbol={col}  
                   key={j*10}
                   onClick={() => this.onClickHandle(i,j)} />
            ))}
          </div>
        ))}
        </div>

        <button className={"btn1"} onClick={() => this.undo()}>Undo</button>
        <div className={"status"}><h2>status: {status} </h2></div>


      </div>
      
    


    );
  }
}

export default Game;
