import React, {useEffect, useState} from "react"
import "./style.css"
import axios from "axios"
import {useParams} from "react-router-dom"
import Match from "../Match"
import Standings from "../Standings"

function Tournament(){
    const id=useParams().id

    const [playerList, setPlayerList] =useState([])
    const [format, setFormat] =useState("")
    //get the first round working and then we'll get back to this
    // const [currentRound, setCurrentRound] =useState(0)
    const [matches, setMatches] =useState([])
    const [roundNum, setRoundNum] =useState(1)
    const [currentRound, setCurrentRound] = useState([])

    useEffect(() => {
    axios.get("/api/drafts/draft/"+id)
    .then(res =>{
        console.log(res.data)
        const players=JSON.parse(res.data.players)
        console.log(players)
        setPlayerList(players)
        setFormat(res.data.format)
        const playerNames=players.map(item => item.name)
        if(roundNum==1){
        setMatches(firstRoundMatchups(playerNames))
        }
    })
    },[])

    function firstRoundMatchups(list){
        let matches=[]
        let diff=0;
        let len=list.length
        let bye=-1;
        if(len % 2 ==1){
            matches.push({player1: list[len-1], player2: "Bye", complete: true})
            diff=(len-1)/2
            bye=len-1
        }else{
            diff=len/2
        }
        for(let i=0; i<diff; i++){
            matches.push({player1: list[i], player2: list[i+diff], complete: false})
        }
        initRound(list, bye)
        return matches
    }

    function initRound(players, bye){
        let blankStandings= []
        blankStandings=players.map((player) => ({
            points: 0,
            wins: 0,
            losses: 0
        }))
        if(bye !== -1){
            blankStandings[bye].points =3
        }
        console.log(blankStandings)
        setCurrentRound(blankStandings)
    }

    function updateStandings(id, p1, p2, wins1, wins2){
        let matchArray = matches;
        matchArray[id].complete=true;
        matchArray[id].player1="Foo";
        console.log(matchArray)
        setMatches(matchArray)
        let points1=0;
        let points2=0;
        if(wins1 > wins2){
            points1=3;
        }else if(wins1 < wins2){
            points2=3;
        }else{
            points1=1;
            points2=1;
        }
        
        let newRound=currentRound
        
        for(let i=0; i<playerList.length; i++){
            if(playerList[i].name=== p1){
                newRound[i].wins=wins1;
                newRound[i].losses=wins2;
                newRound[i].points=points1;
            }else if(playerList[i].name=== p2){
                newRound[i].wins=wins2;
                newRound[i].losses=wins1;
                newRound[i].points=points2;
            }
        }
        console.log(newRound)
        setCurrentRound(newRound)
    }



    return(
        <div className="container">
            <h4>Draft ID: {id}</h4>
            <h5>format: {format}</h5>
            <div className="row">
            <div className="col-1">
                ID
            </div>
            <div className="playerName col-2">
                Name
            </div>
            <div className="col-1">
                Points
            </div>
            <div className="col-1">
                Match wins
            </div>
            <div className="col-1">
                Match losses
            </div>
            <div className="col-1">
                Match Draws
            </div>
            <div className="col-1">
                Game Wins
            </div>
            <div className="col-1">
                Game losses
            </div>
        </div>
            {playerList.map((player, i) => <Standings 
            playerName={player.name}
            matchWins={player.matchWins}
            matchDraws={player.matchDraws}
            matchLosses={player.matchLosses}
            gameWins={player.gameWins}
            gameLosses={player.gameLosses}
            id={player.id}
            key={i} />)}
            {matches.map((match, i) => <Match key={i} id={i} onClick={updateStandings} complete={match.complete} player1={match.player1} player2={match.player2}/>)}
        </div>

    )

}

export default Tournament