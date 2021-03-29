import React, {useEffect, useState} from "react"
import "./style.css"
import axios from "axios"
import {useParams} from "react-router-dom"
import Match from "../Match"
import Standings from "../Standings"
import BackWarning from "../backWarning"

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
    const [backWarning, setBackWarning] = useState(false)
    const [pastRounds, setPastRounds]= useState([])

    useEffect(() => {
    axios.get("/api/drafts/draft/"+id)
    .then(res =>{
        // console.log(res.data)
        const players=JSON.parse(res.data.players)
        // console.log(players)
        const roundCount=Math.floor(Math.log(players.length-1)/Math.log(2))+1
        setSwissRounds(roundCount)
        const round=res.data.round
        setRoundNum(round)
        if(res.data.roundSnapshots.length >0){
            let pastTemp=JSON.parse(res.data.roundSnapshots)
            setPastRounds(pastTemp)
        }
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
        const newList=list.map(item => item)
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

    function addPastRound(matchups, list, n, current){
        let thisRound={
            matches: matchups,
            playerListSnap: list,
            currentRound: current,
            roundNum: n,
        }
        console.log(thisRound)
        let pastTemp=pastRounds
        pastTemp.push(thisRound)
        setPastRounds( pastTemp)
        console.log(pastRounds)
    }

    //reset the round to all zeroes (except for the person with a bye, who gets a match win but no game wins)
    function initRound(players, bye){
        let blankStandings= []
        blankStandings=players.map((player) => ({
            name: player.name,
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
        // console.log(players)
        // console.log("matches")
        // console.log(matchups)
        //need to use parameters and not state here to solve synchronicity issues

        axios.put("/api/drafts/draft/"+id, {
            players: JSON.stringify(players),
            matchups: JSON.stringify(matchups),
            finalists: JSON.stringify(finalists),
            round: roundTemp,
            roundSnapshots: JSON.stringify(pastRounds)
        })
        .then(res => console.log(res.data))
    }

    function checkIfOver(){
        setRoundNum(roundNum +1)    
        if(roundNum === swissRounds){
            pairTop4(playerList)
        }
        else   {
            startNextRound()
        }
    }

    function pairTop4(list){
        let playerArray=[]
        if(playerList.length===0){
            playerArray=sortStandings(list)
        }else{
            playerArray=sortStandings(playerList)
        }
        console.log(playerArray)
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
        let newList=playerList.filter(player => !player.dropped);
        newList=sortStandings(newList)
        for(let i=0; i<newList.length; i++){
            unmatched.push({name: newList[i].name, points:(newList[i].matchWins*3 + newList[i].matchDraws), opponents: newList[i].opponents, index: i})
        }
        let nextBatch=[]
        let pushNext=false
        while(unmatched.length >1){
            // console.log(unmatched.map(player => player.name))
            pushNext=true
            nextBatch=[]
            let possible=[0];
            let samePoints=0;
            for(let i=1; i< unmatched.length; i++){
                if (unmatched[i].points===unmatched[0].points){
                    if(!unmatched[0].opponents.includes(unmatched[i].name.toString())){
                    possible.push(i)
                }
                samePoints++
                }
            }
            console.log(possible)
            //if this is the last match in the group of players with the same number of points
            if (samePoints<2){
                pushNext=true;
            }
            //select a random player because if we start with pairing player 0, it guarantees the person in the first slot won't get a pair down or bye
            // const x=(Math.floor(Math.random() * possible.length))
            const p1index=possible[0]
            const p1=unmatched[p1index]
            possible.splice(0,1)
            // console.log(possible)
            if(possible.length >0){
                const partnerIndex=possible[(Math.floor(Math.random() * possible.length))]
                const partner=unmatched[partnerIndex]
                nextBatch.push({"player1": p1.name, index1: p1.index, "player2":partner.name, index2: partner.index})
                if(partnerIndex> p1index){
                unmatched.splice(partnerIndex, 1)
                // console.log(unmatched)
                unmatched.splice(p1index,1)
                // console.log(unmatched)
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
                        // console.log(tryCount)
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
                // console.log(nextBatch)
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
        // console.log(bye)
    }
    // console.log(newRound)
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
        // console.log(newRound)
        setCurrentRound(newRound)
    }

    function populateFinals(){
        let winners=[]
        for(let i=0; i<currentRound.length; i++){
            if(currentRound[i].points === 3){
                winners.push(playerList[i].name)
            }
        }
        // console.log(winners)
        setMatches({"player1":winners[0], "player2":winners[1], "complete": false})
        setFinalists(winners)
    }

    function finishDraft(){
        let finalMatchups=({"player1":finalists[0], "player2":finalists[1]})
        saveStandings(playerList, finalMatchups, roundNum )
    }

    function compileStandings(player, back){
        //this function will work for either starting a new round or going back to a previous round. If going back, the back parameter should be true
        player.points=0; 
        player.matchWins=0;
        player.matchLosses=0;
        player.matchDraws=0;
        player.gameWins=0;
        player.gameLosses=0;
        let x= pastRounds.length
        if(back){
            x--
            player.opponents.pop()
        }
        for(let i=0; i<x; i++){
            for(let j=0; j<pastRounds[i].currentRound.length; j++){
                if(pastRounds[i].currentRound[j].name===player.name){
                    let element=pastRounds[i].currentRound[j]
                    player.points+= element.points
                    player.gameLosses+= element.losses
                    player.gameWins+= element.wins
                    if(element.points===3){
                        player.matchWins++
                    }else if(element.points==1){
                        player.matchDraws++
                    }else{
                        player.matchLosses++
                    }
                }
            }
        }
        if(!back){
            for(let i=0; i<currentRound.length; i++){
                if(currentRound[i].name===player.name){
                    let element=currentRound[i]
                    player.points+= element.points
                    player.gameLosses+= element.losses
                    player.gameWins+= element.wins
                    if(element.points===3){
                        player.matchWins++
                    }else if(element.points==1){
                        player.matchDraws++
                    }else{
                        player.matchLosses++
                    }
                }
            }
        }
        return player
    }

    function finishRound(){
        let newStandings=playerList.map(player => compileStandings(player, false));
        addPastRound(matches, playerList, roundNum, currentRound)

        for(let i=0; i<newStandings.length; i++){
            newStandings[i].oppWinRate=oppMatchWin(i, newStandings)
        }
        // console.log(newStandings)
        if(roundNum===swissRounds + 1){
            populateFinals()
        }
        //sort by game win %, opp match win % then points
        newStandings=sortStandings(newStandings)

        setPlayerList(newStandings)
        checkIfOver();
    }

    function sortStandings(standings){
        standings.sort((a, b) => {
            return (a.gameWins/(a.gameWins+a.gameLosses))>(b.gameWins/(b.gameWins+b.gameLosses)) ? -1 : 1
        })
        standings.sort((a, b) => {
            return (a.oppWinRate)>(b.oppWinRate) ? -1 : 1
        })
        standings.sort((a, b) => {
            return (a.matchWins * 3 + a.matchDraws)>(b.matchWins*3 + b.matchDraws) ? -1 : 1
        })
        return(standings)
    }

    function oppMatchWin(i, standings){

        let oppWins=0;
        let oppMatches=0;
        let thisPlayer=standings[i]
        if(!thisPlayer.opponents){
            return 0;
        }
        let prevOpps=thisPlayer.opponents
        for(let j=0; j<standings.length; j++){
            if(prevOpps.includes(standings[j].name)){
                oppWins += standings[j].matchWins
                oppMatches += standings[j].matchWins + standings[j].matchLosses
            }
        }
        if (oppMatches===0){
            return 0
        }else{
            return oppWins/oppMatches
        }
    }

    function toggleDrop(i){
        let newList=playerList
        if(!newList[i].dropped){
            newList[i].dropped=true
        }else{
            newList[i].dropped=false
        }
        setPlayerList(newList)
    }

    function clickBack(){
        if(backWarning){
            setBackWarning(false)
        }else{
            setBackWarning(true)
        }
    }

    function goBack(){
        // console.log(pastRounds)
        //it's -2 and not -1 because last is not the round number of the previous, but rather the position in the array of the previous round
        const last=roundNum-2;
        let byePlayer=""
        let byeIndex=-1
        console.log(pastRounds[last])
        let newStandings=playerList.map(player => compileStandings(player, true));
        let newMatchList=pastRounds[last].matches
        let newCurrentRound=pastRounds[last].currentRound
        for(let i=0; i< newMatchList.length; i++){
            if(newMatchList[i].player2==="Bye"){
                byePlayer=newMatchList[i].player1
            }else{
            newMatchList[i].complete=false
            }
        }
        for(let i=0; i< newStandings.length; i++){
            if(newStandings[i].name===byePlayer){
                byeIndex=i
            }
        }
        console.log(newStandings)
        setMatches(newMatchList)
        setPlayerList(newStandings)
        console.log(newCurrentRound)
        setRoundNum(roundNum-1)
        //delete current round
        pastRounds.pop()
        initRound(newStandings, byeIndex)
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
            <div className="col-1">
                Drop
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
            key={player.id}
            index={i}
            dropped={player.dropped || false} 
            toggleDrop={toggleDrop}/>)}
            {finalists.length===0 && matches.map((match, i) => <Match key={roundNum + " " +i} id={i} onClick={updateStandings} complete={match.complete} player1={match.player1} player2={match.player2}/>)}
            {finalists.length===2 && <Match  id="finals" onClick={finishDraft} player1={finalists[0]} player2={finalists[1]}/>}
            {roundComplete && <button className="btn finishBtn btn-primary waves-effect waves-light hoverable accent-3" onClick={finishRound}>Finish Round</button>}
            {roundNum >1 && <button className="btn finishBtn btn-primary waves-effect waves-light hoverable accent-3" onClick={clickBack}>Go Back</button>}
            {backWarning && <BackWarning roundNum={roundNum} goBack={goBack} clickBack={clickBack}/>}
        </div>

    )

}

export default Tournament