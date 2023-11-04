import { connect } from "@/dbConfig/dbConfig";
import { RSA } from "hybrid-crypto-js";
import aes from "crypto-js/aes";

import axios from "axios";
import User from "@/models/users";
import Group from "@/models/group";



const rsa = new RSA();

export const POST=async(req)=>{
    const request=await req.json();
    console.log(request);
    try{
        await connect();
        const grpexist=await Group.findOne({name:request.name});
        if(grpexist===null){
            throw new Error("grp doesnt exists")
        }
        const user=await User.findOne({email:request.email});
        if(user===null){
            throw new Error("grp doesnt exists")
        }

        const folder= await axios.post( `https://www.googleapis.com/drive/v3/files/${grpexist.folderId}/permissions`,
            {
                "requests":[{
                    type: "user",
                    role: "writer",
                emailAddress: request.email,}]
            },{

                headers:{
                    Authorization:`Bearer ${user.access_token}`, 
                    'Content-Type': 'application/json',
                    Accept:'application/json',
                }
            })
            await Group.findOneAndUpdate({name:request.name},{$push:{userIds:user.id},$push:{userEmails:user.email}});
            
            // get owner private key
            const owner=await User.findOne({id:grpexist.ownerId});
            const keypri=aes.encrypt(aes.decrypt(grpexist.privatekey,aes.decrypt(owner.encryptedprivatekey,process.env.NEXTAUTH_SECRET).toString()).toString(),aes.decrypt(user.encryptedprivatekey,process.env.NEXTAUTH_SECRET).toString()).toString();

            await User.findOneAndUpdate({email:request.email},{$push:{groupprikeys:{id:grpexist._id,key:keypri}}})
            
    }
    catch(e){
        console.log(e)
        return Response.json('err',{status:500})
    }
    return Response.json('ok');
    
}