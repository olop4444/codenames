import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import io from 'socket.io-client';
const socket = io('http://localhost:9000');

function FilledSquare(props) {
    return (
      <button className="square" onClick={props.onClick} style={props.style}>
        {props.value}
      </button>
    );
}

function Square(props) {
    return (
      <button className="square hoverable" onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(5).fill(Array(5).fill(null)),
	  turn: "",
	  won: undefined,
	  spymaster: false,
	  team: "BLUE",
	  seconds: -1
    };
	
	var component = this;
	var timeout;
	function updateTime() {
		component.setState({
			seconds: component.state.seconds + 1
		});
		timeout = setTimeout(updateTime, 1000);
	}
	timeout = setTimeout(updateTime, 1000);
	
	socket.on('info', (gameState) => {
		if (this.state.turn !== gameState.turn) {
			this.setState({
				seconds: 0
			});
		}
		var turn = gameState.turn;
		var newBoard = gameState.tiles;
		var winningTeam = gameState.winningTeam;
		var newSquares = [];
		for (var x = 0; x < 5; x++) {
			newSquares[x] = Array(5).fill(null);
			for (var y = 0; y < 5; y++) {
				newSquares[x][y] = newBoard[x][y];
			}
		}
		this.setState({
			squares: newBoard,
			turn: turn
		});
		
		if (typeof winningTeam !== 'undefined') {
			clearTimeout(timeout);
			this.setState({
				won: winningTeam
			});
		}
	});
	
	socket.on('newGame', () => {
		clearTimeout(timeout);
		timeout = setTimeout(updateTime, 1000);
		this.setState({
			won: null,
			seconds: 0
		})
	});
  }
  
  renderSquare(x, y) {
	var dictionary = {
		"ASSASSIN" : 'darkslategrey',
		"BLUE_AGENT" : 'blue',	
		"RED_AGENT" : 'red',
		"BYSTANDER" : 'tan',
		"NULL" : 'white'
	}
	var color = this.state.squares[x][y] ? this.state.squares[x][y].type : "NULL";
	var word = this.state.squares[x][y] ? this.state.squares[x][y].word : "";
	var flipped = this.state.squares[x][y] ? this.state.squares[x][y].flipped : "false";
	var style = {
		background: dictionary[color]
	};
	
	if (flipped || this.state.spymaster) {
		return <FilledSquare value={word} onClick={() => this.handleClick(x, y)} style={style}/>;
	}
	else {
		return <Square value={word} onClick={() => this.handleClick(x, y)}/>;
	}
  }
  
  handleClick(x, y) {
    if (false || this.state.won || (this.state.squares[x][y] && this.state.squares[x][y].flipped) || this.state.turn !== this.state.team) {
		return;
    }
	
	var guess = {'@class': 'codenames.gameObjects.Guess',
			     'x': x,
			     'y': y};
	socket.emit('guess', guess);
  }
  
  spymaster() {
	  var newSpymaster = !this.state.spymaster;
	  this.setState({
		  spymaster: newSpymaster
	  });
  }
  
  endTurn() {
	if (this.state.turn === this.state.team) {	
		socket.emit('endTurn');
	}
  }
  
  restart() {
	if (window.confirm("Are you sure you want to restart?")) {
		socket.emit('restart');
		this.setState({
		  won: null
		})
	}
  }
  
  switchTeam() {
	  if (this.state.team === "BLUE") {
		this.setState({
		  team: "RED"
		})
	  }
	  else if (this.state.team === "RED") {
		this.setState({
		  team: "BLUE"
		})
	  }
  }

  render() {
	const team = 'You are on ' + this.state.team + ' Team';
	const status = this.state.won ? 'Team ' + this.state.won + ' has won!' : 'Turn: ' + (this.state.turn);
	var floatLeft = {
		float: 'left'
	};
	var floatRight = {
		float: 'right'
	};
	var clear = {
		clear: 'both'
	}

	function pad(val) {
		var valString = val + "";
		if (valString.length < 2) {
			return "0" + valString;
		} else {
			return valString;
		}
	}

	var minutes = pad(Math.floor(this.state.seconds/60));
    var seconds = pad(this.state.seconds%60);
    return (
      <div>
		<div className="status">
			<div>{team}</div>
			<div style={floatLeft}>{status}</div>
			<div style={floatRight}><label id="minutes">{minutes}</label>:<label id="seconds">{seconds}</label></div>
			<div style={clear}></div>
		</div>
        <div className="board-row">
          {this.renderSquare(0, 0)}
          {this.renderSquare(1, 0)}
          {this.renderSquare(2, 0)}
          {this.renderSquare(3, 0)}
          {this.renderSquare(4, 0)}
        </div>
        <div className="board-row">
          {this.renderSquare(0, 1)}
          {this.renderSquare(1, 1)}
          {this.renderSquare(2, 1)}
          {this.renderSquare(3, 1)}
          {this.renderSquare(4, 1)}
        </div>
        <div className="board-row">
          {this.renderSquare(0, 2)}
          {this.renderSquare(1, 2)}
          {this.renderSquare(2, 2)}
          {this.renderSquare(3, 2)}
          {this.renderSquare(4, 2)}
        </div>
        <div className="board-row">
          {this.renderSquare(0, 3)}
          {this.renderSquare(1, 3)}
          {this.renderSquare(2, 3)}
          {this.renderSquare(3, 3)}
          {this.renderSquare(4, 3)}
        </div>
        <div className="board-row">
          {this.renderSquare(0, 4)}
          {this.renderSquare(1, 4)}
          {this.renderSquare(2, 4)}
          {this.renderSquare(3, 4)}
          {this.renderSquare(4, 4)}
        </div>
		<div className="buttons">
			<div style={floatLeft}>
				<button onClick={() => this.endTurn()}>End Turn</button>&nbsp;
				<button onClick={() => this.switchTeam()}>Switch Team</button>&nbsp;
			</div>
			<div style={floatRight}>
				<button onClick={() => this.spymaster()}>Toggle Spymaster</button>&nbsp;
				<button onClick={() => this.restart()}>Restart</button>&nbsp;
			</div>
			<div style={clear}></div>
		</div>
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="board">
          <Board />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
