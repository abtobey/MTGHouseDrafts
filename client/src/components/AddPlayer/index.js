import { authorize } from "passport"
import React, {useState} from "react"
import "./style.css"
import axios from "axios"

function AddPlayer(props){

    const [players, setPlayers] =useState(["Bob","Steve","Jim","John","Mike","Aaron"])
    const [playerForm, setPlayerForm] =useState("")
    const [errorMessage, setErrorMessage]=useState("")

    function handleInputChange(e){
        setPlayerForm(e.target.value)
    }
    function addToList(e){
        e.preventDefault();
        setErrorMessage("")
        if(players.includes(playerForm)){
            setErrorMessage(playerForm +" already added")
        }
        else if(players.length >=10){
            setErrorMessage("Maximum is 10 players")

        }
        else{
        setPlayers([...players, playerForm])
        }
        setPlayerForm("")
    }
    function removePlayer(e){
        let i=e.target.id
        let array=[...players];
        array.splice(i,1);
        setPlayerForm("")
        setPlayers(array)
    }
    function startDraft(e){
        e.preventDefault();
        const newDraft={
            format: "Zendikar",
            players: players,
            userId: props.user
        }
        console.log(newDraft)
        axios.post("/api/drafts/draft", newDraft)
        .then((res) => console.log(res))
        .catch((err) => console.log(err))
    }


    return(
        <div className="playerEntry">
            <label htmlFor="PlayerForm">Enter Player Name</label>
            <input
                  onChange={handleInputChange}
                  value={playerForm}
                  id="playerForm"
                  type="text"
                />
                {players.length < 6 && <p>Must have at least 6 players</p>}
                <p>{errorMessage}</p>
                <button
                  style={{
                    width:"150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  onClick={addToList}
                  type="submit"
                  className="btn btn-primary waves-effect waves-light hoverable accent-3"
                >
                  Add Player
                </button>
                <br></br>
                {players.length >= 6 &&
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  onClick={startDraft}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable green accent-3"
                >
                  Start Draft
                </button>}
                {players.map((player, i) => <p className="playerItem" key={i} ><span className="playerName">{player}</span> <span className="delete" id={i} onClick={removePlayer}>X</span></p>)}

        </div>

    )

}

export default AddPlayer;