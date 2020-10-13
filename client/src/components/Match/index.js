import React from "react"
import "./style.css"

function Match(props){
    return(
        <div className="row">
            <span className="player1 col-md-3 col-2">{props.player1}</span>
            {props.player2 !== "Bye" ?
            <>
            <div className="form-group col-md-1 col-3">
            <select className="form-control" id="wins1">
            <option>0</option>
            <option>1</option>
            <option>2</option>
            </select>
            </div>
            <span className="vs col-1">vs</span>
            <div className="form-group col-md-1 col-3">
            <select className="form-control" id="wins2">
            <option>0</option>
            <option>1</option>
            <option>2</option>
            </select>
            </div>
            </>
            : <br></br>}
            <span className="player2 col-md-3 col-2">{props.player2}</span>
        </div>
    )

}

export default Match;