import React from "react"
import "./style.css"


function BackWarning(props){

    function goBack(){
        props.goBack()
    }

    function clickBack(){
        props.clickBack()
    }

    return(
<div className="card">
  <div className="card-body">
    <h5 className="card-title">Are you sure?</h5>
    <p className="card-text">Going back to round {props.roundNum-1} will erase all matches from round {props.roundNum}, and the pairings will be different after the previous round is re-entered</p>
    <button className="btn btn-success yes" onClick={goBack}>Yes</button>
    <button className="btn btn-danger no" onClick={clickBack}>No</button>
  </div>
</div>
    )
}

export default BackWarning