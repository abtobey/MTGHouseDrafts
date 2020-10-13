import React, {useState} from "react"
import "./style.css"
import {Redirect} from "react-router"
import axios from "axios"

function AddPlayer(props){

    const [players, setPlayers] =useState([])
    const [formObject, setFormObject] =useState({})
    const [errorMessage, setErrorMessage]=useState("")
    const [redirect, setRedirect] =useState({
        start: false,
        id: ""
    })
    

    function handleInputChange(e){
        const { name, value } = e.target;
        setFormObject({ ...formObject, [name]: value })
    }
    function addToList(e){
        e.preventDefault();
        setErrorMessage("")
        if(players.includes(formObject.player)){
            setErrorMessage(formObject.player +" already added")
        }
        else if(players.length >=10){
            setErrorMessage("Maximum is 10 players")

        }
        else{
        setPlayers([...players, formObject.player])
        }
        setFormObject({...formObject, player: ""})
    }
    function removePlayer(e){
        let i=e.target.id
        let array=[...players];
        array.splice(i,1);
        setFormObject({...formObject, player: ""})
        setPlayers(array)
    }
    //shuffle list of players to randomize round 1 pairings
    function shuffle(array){
        let newArray=[]
        while(newArray.length < array.length){
            let next=Math.round(Math.random()*(array.length-1))
            if(!newArray.includes(array[next])){
                newArray.push(array[next])
            }
    
        }
        //now initialize player objects
        let playerObjects=[]
        for(let i=0; i<newArray.length; i++){
            playerObjects.push({
                id: i+1,
                name: newArray[i],
                matchWins: 0,
                gameWins: 0,
                matchLosses: 0,
                gameLosses: 0,
                matchDraws: 0,
                opponents:[]
            })
        }
        return JSON.stringify(playerObjects)
    }

    function startDraft(e){
        e.preventDefault();
        //randomizing order of players before submitting to database so they are not re-ordered if the page is realoded
        let randomized=shuffle(players);
        const newDraft={
            format: formObject.format,
            players: randomized,
            userId: props.user
        }
        axios.post("/api/drafts/draft", newDraft)
        .then((res) => {
            console.log(res)
            setRedirect({
                start: true,
                id: res.data
            })
        })
        .catch((err) => console.log(err))
    }


    return(
        <>
        {redirect.start ? <Redirect to={"/tournament/"+redirect.id}/>:
        <div className="playerEntry">
            <label htmlFor="Format">Format</label>
            <input
                  onChange={handleInputChange}
                  value={formObject.format || ""}
                  id="format"
                  name="format"
                  type="text"
                />
            <label htmlFor="PlayerForm">Enter Player Name</label>
            <input
                  onChange={handleInputChange}
                  value={formObject.player || ""}
                  id="player"
                  name="player"
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

        </div>}
        </>

    )

}

export default AddPlayer;