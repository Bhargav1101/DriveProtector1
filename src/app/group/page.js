"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";



export default function grp() {
    const [grpname,setgrpname]=useState("");

    const session=useSession();
     
    async function send(){
        const res=axios.post('/api/group/create',{
            name:grpname,
            ownerEmail:session.data.user.email
        })
        console.log(res);
    }
    if(session.status==="unauthenticated"){
        return(<div>pls authenticate</div>)
    }
    if(session.status==="authenticated"){
        console.log(session.data.user.email)
        return (
    <div>
        <input type="text" placeholder="enter name of grp" onChange={(e)=>setgrpname(e.target.value)}/>
        <button onClick={()=>send()}>send</button>
    </div>
    )}
  
}
