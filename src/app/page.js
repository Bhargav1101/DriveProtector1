"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation";
import axios from "axios"
import Link from "next/link";
import { useState } from "react";
import { redirect } from "next/dist/server/api-utils";

// function Ho() {
//   async function func(){
//     const req=await axios.get("/app/api/req");
//     console.log(req);
//   }
//   return (
//     <button onClick={func}>send</button>
//   )
// }



export default function Home() {
   
   const session=useSession();
   const router=useRouter();
   
   // console.log(session.user.access_token);
   function signout(){
      // router.push("/api/login");
      // router.push("https://accounts.google.com/Logout")
      signOut();
      
      
   }
   if(session.status==="authenticated"){

      return(<div>
        u r authenticated
        {session.data.user.email}
        
        <button onClick={()=>signout()}>logout</button>
        
        
   </div>)}
   else return(
   <div>
    not authenticated

    <button onClick={()=>signIn("google")}>login</button>
    </div>
   )

}