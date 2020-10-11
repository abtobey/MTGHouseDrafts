import React, {useEffect, useState} from "react"
import "./style.css"
import axios from "axios"
import {useParams} from "react-router-dom"

function Tournament(){
    const id=useParams().id

    const [playerList, setPlayerList] =useState([])
    const [format, setFormat] =useState("")
    useEffect(() => {
    axios.get("/api/drafts/draft/"+id)
    .then(res =>{
        console.log(res.data)
        setPlayerList(JSON.parse(res.data.players))
        setFormat(res.data.format)
    })
    },[])



    return(
        <div className="container">
            <h4>Draft ID: {id}</h4>
            <h5>format: {format}</h5>
            <h5>Players</h5>
            {playerList.map((player, i) => <p key={i}>{player.name}</p>)}
        </div>

    )

}

export default Tournament