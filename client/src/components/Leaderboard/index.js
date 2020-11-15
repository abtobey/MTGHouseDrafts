import React, {useEffect, useState} from "react"
import "./style.css"
import {useParams} from "react-router-dom"
import axios from "axios"
import LeaderboardItem from "../LeaderboardItem"


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
        //pull the relevant info
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
                    playerName: playerName, 
                    matchWins: matchWins, 
                    matchLosses: matchLosses,
                    matchDraws: matchDraws,
                    gameWins: gameWins,
                    gameLosses: gameLosses})
            }
        }
        let standings= combineStandings(playerAmalgam)
        standings.sort((a, b)=>{
            return a.matchWins>b.matchWins ? -1 :1
        })
        setStatsArray(standings)
    }

    function combineStandings(playerAmalgam){
        let combinedStandings=[]
        for(let i=0; i<playerAmalgam.length; i++){
            let found=false
            for(let j=0; j<combinedStandings.length; j++){
                if(combinedStandings[j].playerName===playerAmalgam[i].playerName){
                    combinedStandings[j].matchWins+=playerAmalgam[i].matchWins
                    combinedStandings[j].matchLosses+=playerAmalgam[i].matchLosses
                    combinedStandings[j].matchDraws+=playerAmalgam[i].matchDraws
                    combinedStandings[j].gameLosses+=playerAmalgam[i].gameLosses
                    combinedStandings[j].gameWins+=playerAmalgam[i].gameWins
                    found=true
                }
            }
            if(!found){
                combinedStandings.push({
                    playerName: playerAmalgam[i].playerName,
                    matchWins: playerAmalgam[i].matchWins,
                    matchLosses: playerAmalgam[i].matchLosses,
                    matchDraws: playerAmalgam[i].matchDraws,
                    gameWins: playerAmalgam[i].gameWins,
                    gameLosses: playerAmalgam[i].gameLosses
                })
            }
        }
        return combinedStandings
    }


    return(
        <div className="container">
            <div className="row leaderboardRow">
            <div className="playerName col-2">
                Name
            </div>
            <div className="col-1">
                Points
            </div>
            <div className="col-1">
                Match Wins
            </div>
            <div className="col-1">
                Match Losses
            </div>
            <div className="col-1">
                Draws
            </div>
            <div className="col-1">
                Game Wins
            </div>
            <div className="col-1">
                Game Losses
            </div>

        </div>
           { statsArray.map((player, i) => (
               <LeaderboardItem key={i}
               playerName={player.playerName}
               matchWins={player.matchWins}
               matchLosses={player.matchLosses}
               matchDraws={player.matchDraws}
               gameLosses={player.gameLosses}
               gameWins={player.gameWins}
               />
           )) }
        </div>
    )
}

export default Leaderboard