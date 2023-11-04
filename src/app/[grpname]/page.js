"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";



export default function grp(child) {

    const session=useSession();
    const router=useRouter();
    // const grpname=router.query
    console.log(child.params.grpname)
    // const currUser=session.user.email;
     
    async function getusers(){
        const res=axios.post('/api/group/showuser',{
            name:child.params.grpname,
            email:session.user.email
        })
        console.log(res);
        
    }

    
    if(session.status==="unauthenticated" ){
        return(<div>pls authenticate</div>)
    }
    if(session.status==="authenticated"){
        return (
        <div>
            <button onClick={()=>getusers()}>send</button>
        </div>
    
    )
    }
}
