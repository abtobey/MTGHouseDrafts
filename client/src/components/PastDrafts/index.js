import React, {useEffect, useState} from "react"
import "./style.css"
import { Link } from "react-router-dom";
import {useParams} from "react-router-dom"
import axios from "axios"
import moment from "moment"



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
                <div className="row pastDraft">
                    <div className="col-3">
                        ID
                    </div>
                    <div className="col-2">
                        Date
                    </div>
                    <div className="col-2">
                        Format
                    </div>
                    <div className="col-3">
                        Finalists
                    </div>
                    <div className="col-2">
                        Winner
                    </div>
                </div>
            {draftList.map((draft, i) =>(
                <div className="row pastDraft" key={i}>
                    <div className="col-3">
                        <Link to={"/tournament/"+draft.id}>{draft.id}</Link>
                    </div>
                    <div className="col-2">
                        {moment(draft.date).format("MM/DD/YYYY h:mm")}
                    </div>
                    <div className="col-2">
                        {draft.format}
                    </div>
                    <div className="col-3">
                        {draft.finalists ? draft.finalists : ""}
                    </div>
                    <div className="col-2">
                        {draft.winner ? draft.winner : ""}
                    </div>
                </div>
            ))}
        </div>
    )

}

export default PastDrafts