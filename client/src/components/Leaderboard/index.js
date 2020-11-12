import React, {useEffect, useState} from "react"
import "./style.css"
import {useParams} from "react-router-dom"
import axios from "axios"


function Leaderboard(){
    const id=useParams().id

    const [statsArray, setStatsArray] = useState([])
    
    
    useEffect(() => {
        axios.get("/api/drafts/stats/"+id)
        .then(res => {
            console.log(res.data)
            parseAPI(res.data)
        })
    },[])

    function parseAPI(data){
        let playerAmalgam=[]
        for(let i=0; i<data.length; i++){
            for(let j=0; j<data[i].players.length; j++){
                let players=data[i].players
                let format=data[i].format;
                let date=data[i].date;
                let playerName=players[j].name;
                let matchWins=players[j].matchWins
                let matchLosses=players[j].matchLosses
                let matchDraws=players[j].matchDraws
                let gameWins=players[j].gameWins
                let gameLosses=players[j].gameLosses
                playerAmalgam.push({
                    format: format, 
                    date: date, 
                    playername: playerName, 
                    matchWins: matchWins, 
                    matchLosses: matchLosses,
                    matchDraws: matchDraws,
                    gameWins: gameWins,
                    gameLosses: gameLosses})
            }
        }
        console.log(playerAmalgam)
    }


    return(
        <>
        </>
    )
}

export default Leaderboard