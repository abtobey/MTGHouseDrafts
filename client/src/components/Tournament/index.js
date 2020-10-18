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
        setPlayerList(players)
        setFormat(res.data.format)
        const playerNames=players.map(item => item.name)
        setMatches(firstRoundMatchups(playerNames))
        initRound(players)
    })
    },[])

    function firstRoundMatchups(list){
        let matches=[]
        let diff=0;
        let len=list.length
        if(len % 2 ==1){
            matches.push([list[len-1], "Bye"])
            diff=(len-1)/2
        }else{
            diff=len/2
        }
        for(let i=0; i<diff; i++){
            matches.push([list[i], list[i+diff]])
        }
        return matches
    }

    function initRound(players){
        let blankStandings= []
        blankStandings=players.map((player) => ({
            points: 0,
            wins: 0,
            losses: 0
        }))
        setCurrentRound(blankStandings)
    }

    function updateStandings(p1, p2, wins1, wins2){
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
            {matches.map((match, i) => <Match key={i} onClick={updateStandings} player1={match[0]} player2={match[1]}/>)}
        </div>

    )

}

export default Tournament