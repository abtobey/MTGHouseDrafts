import React from "react"

function Match(props){
    return(
        <div className="row">
            <span>{props.player1}</span>
            {props.player2 !== "Bye" ?
            <>
            <input type="number" min={0} max={2}></input>
            <span>vs</span>
            <input type="number" min={0} max={2}></input>
            </>
            : <br></br>}
            <span>{props.player2}</span>
        </div>
    )

}

export default Match;