import React, {useEffect, useState} from "react"
import "./style.css"
import { Link } from "react-router-dom";
import {useParams} from "react-router-dom"
import axios from "axios"



function PastDrafts(){
    const id=useParams().id

    const [draftList, setDraftList]=useState([])

    useEffect(() => {
    axios.get("/api/drafts/saveddrafts/"+id)
    .then(res => {
        setDraftList(res.data)
    })
    },[])
    return(
        <div className="container">
                <div className="row">
                    <div className="col-4">
                        ID
                    </div>
                    <div className="col-4">
                        Date
                    </div>
                    <div className="col-4">
                        Format
                    </div>
                </div>
            {draftList.map((draft, i) =>(
                <div className="row" key={i}>
                    <div className="col-4">
                        <Link to={"/tournament/"+draft.id}>{draft.id}</Link>
                    </div>
                    <div className="col-4">
                        {draft.date}
                    </div>
                    <div className="col-4">
                        {draft.format}
                    </div>
                </div>
            ))}
        </div>
    )

}

export default PastDrafts