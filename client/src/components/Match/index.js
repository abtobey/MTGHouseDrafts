import React, {useEffect, useState} from "react"
import "./style.css"

function Match(props){
const [games, setGames] = useState({wins1: 0, wins2: 0})
const [entered, setEntered]=useState(props.complete)

useEffect(() => {
  if(games.wins1 >0 || games.wins2 >0){
  handleSubmit()
  }
},[games])

function handleInputChange(event){
    const {name, value} =event.target;
    setGames({...games, [name]: value})
}

function handleSubmit(){
  setEntered(true);
  props.onClick(props.id, props.player1, props.player2, parseInt(games.wins1), parseInt(games.wins2))
}

    return(
        <div className="row" key={props.id}>
            <span className="player1 col-md-4 col-2">{props.player1}</span>
            {props.player2 !== "Bye" ?
            <>
            <div className="form-group col-md-1 col-3">
            <select className="form-control" type="number" onChange={handleInputChange} name="wins1" id="wins1" value={games.wins1 || 0}>
            <option>0</option>
            <option>1</option>
            {games.wins2 <2 &&<option>2</option>}
            </select>
            </div>
            <span className="vs col-1">vs</span>
            <div className="form-group col-md-1 col-3">
            <select className="form-control" type="number" onChange={handleInputChange} name= "wins2" id="wins2" value={games.wins2 || 0}>
            <option>0</option>
            <option>1</option>
            {games.wins1 <2 &&<option>2</option>}
            </select>
            </div>
            
            </>
            : <><span className="col-md-3 col-8"></span><br></br></>}
            <span className="player2 col-md-4 col-2">{props.player2}</span>

        </div>
    )

}

export default Match;