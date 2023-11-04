"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import FormData from "form-data";


export const config = {
    api: {
      bodyParser: false,
    },
  };

export default function file() {

    const session=useSession();
    const [grpname,setgrpname]=useState("");
    const [file,setfile]=useState(null);
    const[mail,setmail]=useState("");

    console.log("Uploadfile page.js ",session);

    async function upload(){
        const formData = new FormData();
        formData.append("file", file);
        formData.append("groupname",grpname);
        console.log("formdata ",formData);
        console.log("grpname ",grpname);
        try{
        //     const res = await axios.post("/api/file/createfile",formData,
        //         {
        //             headers: {
        //                 "Content-Type":"multipart/form-data",
        //             },

        //         }
        //     );

            const res = await fetch("/api/file/createfile",{
                method:"POST",
                body:formData,
                redirect:"follow",
            })
            console.log(res);

        }catch(err){
            console.log("Couldnt Upload File ",err);
        }

    }

    const handlechange = (e)=>{
        console.log(e.target);
        setgrpname(e.target.value);
    }

    const handlefile= (e)=>{
        console.log("file ",e.target.files[0]);
        setfile(e.target.files[0]);
        // console.log("file id",file.id);
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
        <input type="file" id="myfile" name="myfile" onChange={handlefile}/>
        <label for="groupname">Enter Group Name</label>
        <input type="text" id="groupname" onChange={handlechange}/>
        <button type="submit" onClick={()=>upload()}>Upload File</button>

    </div>
    )}
  
}
