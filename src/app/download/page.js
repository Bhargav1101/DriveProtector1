"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";


export default function download() {

    const session=useSession();
    const [grpname,setgrpname]=useState("");
    const [files,setfiles]=useState([]);

    console.log("Download Page.js ",session);

    const handlechange =(e)=>{
        setgrpname(e.target.value);
    }

    const download = (e)=>{

    }

    const getfiles = async()=>{
        try{
            console.log("/api/getfiles/");
            const res = await axios.get("/api/getfiles/"+grpname);
            setfiles(res.data.files);
            console.log("files ",files);
        }catch(error){
            console.log("cant get files ",err);
        }

    }
    
    console.log(grpname);
    
    if(session.status==="unauthenticated"){
        return(<div>pls authenticate</div>)
    }
    if(session.status==="authenticated"){
        console.log(session.data.user.email)
        // setmail(session.data.user.email);
        return (
    <div>
        <label for="grpname">Enter Group Name</label>
        <input type="text" id="grpname" onChange={handlechange}/>
        <button type="submit" onClick={()=>getfiles()}>Get Files</button>
        <button type="submit" onClick={()=>download()}>Download</button>
    </div>
    )}
  
}
