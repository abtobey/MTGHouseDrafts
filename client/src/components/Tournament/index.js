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
    const [matches, setMatches] =useState([])
    const [roundNum, setRoundNum] =useState(1)
    const [currentRound, setCurrentRound] = useState([])
    const [roundComplete, setRoundComplete] = useState(false)
    const [swissRounds, setSwissRounds]=useState(1)
    const [finalists, setFinalists] =useState([])

    useEffect(() => {
    axios.get("/api/drafts/draft/"+id)
    .then(res =>{
        console.log(res.data)
        const players=JSON.parse(res.data.players)
        console.log(players)
        const roundCount=Math.floor(Math.log(players.length-1)/Math.log(2))+1
        setSwissRounds(roundCount)
        const round=res.data.round
        setRoundNum(round)
        let matchList=[]
        if(res.data.matchups.length >0 ){
        matchList=JSON.parse(res.data.matchups)
        }
        // console.log(players)
        setFormat(res.data.format)
        if(round===1){
        setMatches(firstRoundMatchups(players))
        }else if(round === roundCount+1){
            setPlayerList(players)
            pairTop4(players)
        }
        else if(round === roundCount+2){
            setPlayerList(players)
        }
        else{
            setPlayerList(players)
            //set matchups to the last round saved
            setMatches(matchList)
            let bye=-1
            if(matchList[matchList.length-1].player2 ==="Bye"){
                let byePlayer=matchList[matchList.length-1].player1
                for(let i=0; i<players.length; i++){
                    if(players[i].name === byePlayer){
                        bye=i
                    }
                }
            }
            initRound(players, bye)
        }
    })
    },[])

    //first round pairs people who would be sitting across the table from each other.
    function firstRoundMatchups(list){
        const playerNames=list.map(item => item.name)
        console.log("list")
        console.log(list)
        let matches=[]
        let diff=0;
        let len=list.length
        let bye=-1;
        //if there is an odd number, give the person last in the array a bye
        if(len % 2 ===1){
            matches.push({player1: playerNames[len-1], player2: "Bye", complete: true})
            diff=(len-1)/2
            bye=len-1
        }else{
            diff=len/2
        }
        for(let i=0; i<diff; i++){
            matches.push({player1: playerNames[i], player2: playerNames[i+diff], complete: false})
            //do not add to opponents list if we are reloading a draft already created.
            if(list[i].opponents.length===0){
                list[i].opponents.push(playerNames[i+diff])
                list[i+diff].opponents.push(playerNames[i])
            }
        }
        setPlayerList(list)
        initRound(list, bye)
        saveStandings(list, matches, 1)
        return matches
    }

    //reset the round to all zeroes (except for the person with a bye, who gets a match win but no game wins)
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
        // console.log(blankStandings)
        setCurrentRound(blankStandings)
    }

    function saveStandings(players, matchups, roundTemp){
        console.log(players)
        console.log("matches")
        console.log(matchups)
        axios.put("/api/drafts/draft/"+id, {
            players: JSON.stringify(players),
            matchups: JSON.stringify(matchups),
            finalists: JSON.stringify(finalists),
            round: roundTemp
        })
        .then(res => console.log(res.data))
    }

    function checkIfOver(){
        setRoundNum(roundNum +1)    
        if(roundNum === swissRounds){
            pairTop4([])
        }
        else   {
            startNextRound()
        }
    }

    function pairTop4(list){
        let playerArray=[]
        if(playerList.length===0){
            playerArray=list
        }else{
            playerArray=playerList
        }
        let bracket=[]
        //pairs first place with 4th and 2nd place with 3rd
        bracket.push({"player1":playerArray[0].name,  "player2": playerArray[3].name, complete: false})
        bracket.push({"player1":playerArray[1].name,  "player2": playerArray[2].name, complete: false})
        setMatches(bracket)
        //-1 hardcoded into bye since there won'e be bye in top 4
        initRound(playerArray.slice(0,4), -1)
        setRoundComplete(false)
    }


    //this is for starting any round after round 1
    function startNextRound(){
        //due to async issues it's easier to just pass through the next round number here than wait for the state to update.
        setRoundComplete(false)
        //initialize by as -1, if this remains -1 when this function is done, no bye will be assigned.
        let bye=-1;
        //get an array of players and their point totals
        let newRound=[]
        let unmatched=[]
        let newList=playerList;
        for(let i=0; i<playerList.length; i++){
            unmatched.push({name: playerList[i].name, points:(playerList[i].matchWins*3 + playerList[i].matchDraws), opponents: playerList[i].opponents, index: i})
        }
        let nextBatch=[]
        let pushNext=false
        while(unmatched.length >1){
            console.log(unmatched.map(player => player.name))
            pushNext=true
            nextBatch=[]
            let possible=[0];
            let samePoints=0;
            for(let i=1; i< unmatched.length; i++){
                if (unmatched[i].points===unmatched[0].points){
                    if(!unmatched[0].opponents.includes(unmatched[i].name)){
                    possible.push(i)
                }
                samePoints++
                }
            }
            //if this is the last match in the group of players with the same number of points
            if (samePoints<2){
                pushNext=true;
            }
            //select a random player because if we start with pairing player 0, it guarantees the person in the first slot won't get a pair down or bye
            const x=(Math.floor(Math.random() * possible.length))
            const p1index=possible[x]
            const p1=unmatched[p1index]
            possible.splice(x,1)
            console.log(possible)
            if(possible.length >0){
                const partnerIndex=possible[(Math.floor(Math.random() * possible.length))]
                const partner=unmatched[partnerIndex]
                nextBatch.push({"player1": p1.name, index1: p1.index, "player2":partner.name, index2: partner.index})
                if(partnerIndex> p1index){
                unmatched.splice(partnerIndex, 1)
                console.log(unmatched)
                unmatched.splice(p1index,1)
                console.log(unmatched)
                }else{
                    unmatched.splice(p1index,1)
                    unmatched.splice(partnerIndex, 1)
                }
            //this will happen if the last two people have already played each other. In this case we see if there is a match we can switch players with to have a valid group of pairings
            }else if(samePoints >0 && possible.length<=1){
                nextBatch.push({"player1": p1.name, index1: p1.index, "player2":unmatched[1].name, index2: unmatched[1].index})
                unmatched.splice(1, 1)
                unmatched.splice(0,1)
                let last=nextBatch.length-1
                //loop through current matches and see if there are any that can be switched to create valid pairings
                for(let j=0; j< nextBatch.length; j++){
                    //if you can switch player1 in match j with the last match
                    if(!playerList[nextBatch[last].index1].opponents.includes(nextBatch[j].player2) && !playerList[nextBatch[last].index2].opponents.includes(nextBatch[j].player1)){
                        let temp={player1: nextBatch[last].player1, index1:nextBatch[last].index1}
                        nextBatch[last].player1=nextBatch[j].player1
                        nextBatch[last].index1=nextBatch[j].index1
                        nextBatch[j].player1=temp.player1
                        nextBatch[j].index1=temp.index1
                        break;
                        //if you can switch player2 in match j with the last match
                    }else if(!playerList[nextBatch[last].index1].opponents.includes(nextBatch[j].player1) && !playerList[nextBatch[last].index2].opponents.includes(nextBatch[j].player2)){
                        let temp={player1: nextBatch[last].player1, index1:nextBatch[last].index1}
                        nextBatch[last].player1=nextBatch[j].player2
                        nextBatch[last].index1=nextBatch[j].index2
                        nextBatch[j].player2=temp.player1
                        nextBatch[j].index2=temp.index1
                        break;
                    }
                }
            }else{
                //if there are no more people with the same amount of points, we have to pair with someone with the next highest amount
                let nextHighest=unmatched[1].points
                let nextHighestPoints=0
                for(let j=1; j< unmatched.length; j++){
                    if (unmatched[j].points===nextHighest){
                        nextHighestPoints++
                    }
                    let valid=false
                    let tryCount=0
                    let partner=0
                    while(!valid && tryCount <10){
                        console.log(tryCount)
                        partner=(Math.floor(Math.random() * nextHighestPoints))+1
                        if(!unmatched[0].opponents.includes(unmatched[partner].name)){
                            valid=true
                        }
                        tryCount++
                    }
                    nextBatch.push({"player1": unmatched[0].name, index1: unmatched[0].index, "player2":unmatched[partner].name, index2: unmatched[partner].index})
                    unmatched.splice(partner, 1)
                    unmatched.splice(0,1)
                }
            }
            //now add nextBatch to the match list and update opponents
            if(pushNext){
                console.log(nextBatch)
                for(let i=0; i<nextBatch.length; i++){
                    newRound.push({player1: nextBatch[i].player1, player2: nextBatch[i].player2, complete: false})
                    newList[nextBatch[i].index1].opponents.push(nextBatch[i].player2)
                    newList[nextBatch[i].index2].opponents.push(nextBatch[i].player1)
                }
            }
    }
    if(unmatched.length===1){
        newRound.push({"player1": unmatched[0].name, "player2": "Bye"})
        bye=unmatched[0].index
        console.log(bye)
    }
    console.log(newRound)
    setMatches(newRound)
    setPlayerList(newList)
    saveStandings(newList, newRound, roundNum +1)
    initRound(newList, bye)
    }


    function updateStandings(id, p1, p2, wins1, wins2){
        let matchArray = matches;
        matchArray[id].complete=true;
        let completeCheck=true;
        for(let i=0; i< matchArray.length; i++){
            if(matchArray[i].complete===false){
                completeCheck=false;
            }
        }
        setRoundComplete(completeCheck)
        // console.log(matchArray)
        setMatches(matchArray)
        let points1=0;
        let points2=0;
        //calculate the points here instead of having to pass them through as parameters. 3 for a win, 1 for a draw
        if(wins1 > wins2){
            points1=3;
        }else if(wins1 < wins2){
            points2=3;
        }else{
            points1=1;
            points2=1;
        }
        
        let newRound=currentRound
        //match player names to list of players and update wins and losses
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

    function populateFinals(){
        let winners=[]
        for(let i=0; i<currentRound.length; i++){
            if(currentRound[i].points === 3){
                winners.push(playerList[i].name)
            }
        }
        console.log(winners)
        setMatches({"player1":winners[0], "player2":winners[1], "complete": false})
        setFinalists(winners)
    }

    function finishDraft(){
        let finalMatchups=({"player1":finalists[0], "player2":finalists[1]})
        saveStandings(playerList, finalMatchups, roundNum )
    }

    function finishRound(){
        let newStandings=playerList;
        for(let i=0; i<currentRound.length; i++){
            newStandings[i].gameWins += currentRound[i].wins;
            newStandings[i].gameLosses += currentRound[i].losses;
            if(currentRound[i].points === 3){
                newStandings[i].matchWins +=1;
            }else if(currentRound[i].points===1){
                newStandings[i].matchDraws +=1;
            }else if(currentRound[i].points===0){
                newStandings[i].matchLosses+=1;
            }
        }
        for(let i=0; i<currentRound.length; i++){
            newStandings[i].oppWinRate=oppMatchWin(i)
        }
        if(roundNum===swissRounds + 1){
            populateFinals()
        }
        //sort by game win %, opp match win % then points

        newStandings.sort((a, b) => {
            return (a.gameWins/(a.gameWins+a.gameLosses))>(a.gameWins/(a.gameWins+a.gameLosses)) ? -1 : 1
        })
        newStandings.sort((a, b) => {
            return (a.oppWinRate)>(b.oppWinRate) ? -1 : 1
        })
        newStandings.sort((a, b) => {
            return (a.matchWins * 3 + a.matchDraws)>(b.matchWins*3 + b.matchDraws) ? -1 : 1
        })
        // console.log(newStandings)
        setPlayerList([...playerList],newStandings)
        checkIfOver();
    }

    function oppMatchWin(i){
        let oppWins=0;
        let oppMatches=0;
        let thisPlayer=playerList[i]
        if(!thisPlayer.opponents){
            return 0;
        }
        let prevOpps=thisPlayer.opponents
        for(let j=0; j<playerList.length; j++){
            if(prevOpps.includes(playerList[j].name)){
                oppWins += playerList[j].matchWins
                oppMatches += playerList[j].matchWins + playerList[j].matchLosses
            }
        }
        if (oppMatches===0){
            return 0
        }else{
            return oppWins/oppMatches
        }
    }

    return(
        <div className="container">
            <h4>Draft ID: {id}</h4>
            <h5>format: {format}</h5>
            <h5>Round: {roundNum} out of {swissRounds}</h5>
            <div className="row headerRow standingRow">
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
            <div className="col-2">
                Opp. Win %
            </div>
        </div>
            {playerList.map((player, i) => <Standings 
            playerName={player.name}
            matchWins={player.matchWins}
            matchDraws={player.matchDraws}
            matchLosses={player.matchLosses}
            gameWins={player.gameWins}
            gameLosses={player.gameLosses}
            oppWinPercent={player.oppWinRate || 0}
            id={player.id}
            key={player.id} />)}
            {finalists.length===0 && matches.map((match, i) => <Match key={roundNum + " " +i} id={i} onClick={updateStandings} complete={match.complete} player1={match.player1} player2={match.player2}/>)}
            {finalists.length===2 && <Match  id="finals" onClick={finishDraft} player1={finalists[0]} player2={finalists[1]}/>}
            {roundComplete && <button className="btn finishBtn btn-primary waves-effect waves-light hoverable accent-3" onClick={finishRound}>Finish Round</button>}
        </div>

    )

}

export default Tournament