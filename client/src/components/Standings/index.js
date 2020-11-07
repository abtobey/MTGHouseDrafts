import React from "react"
import "./style.css"

function Standings(props){
    return(
        <div className="row standingRow">
            <div className="col-1">
                {props.id}
            </div>
            <div className="playerName col-2">
                {props.playerName}
            </div>
            <div className="col-1">
                {props.matchWins * 3 + props.matchDraws*1} 
            </div>
            <div className="col-1">
                {props.matchWins} 
            </div>
            <div className="col-1">
                {props.matchLosses}
            </div>
            <div className="col-1">
                {props.matchDraws}
            </div>
            <div className="col-1">
                {props.gameWins}
            </div>
            <div className="col-1">
                {props.gameLosses}
            </div>
            <div className="col-1">
                {(props.oppWinPercent*100).toFixed(2) + "%"}
            </div>
        </div>
    )

}

export default Standings;