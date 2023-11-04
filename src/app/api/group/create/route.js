import { connect } from "@/dbConfig/dbConfig";
import { RSA } from "hybrid-crypto-js";
import aes from "crypto-js/aes";

import axios from "axios";
import User from "@/models/users";
import Group from "@/models/group";
import Latin1 from "crypto-js/enc-latin1";



const rsa = new RSA();

export const POST=async(req)=>{
    const request=await req.json();
    console.log(request);
    try{
        await connect();
        const grpexist=await Group.exists({name:request.name});
        if(grpexist){
            throw new Error("grp exists")
        }
        const user=await User.findOne({email:request.ownerEmail});
        console.log(user);
        const folder= await axios.post(`https:www.googleapis.com/drive/v3/files?access_token=${user.access_token}`,
            {
                name: request.name,
                mimeType: 'application/vnd.google-apps.folder',
                parents:[user.folderId]
            },{

                headers:{
                    Authorization:`Bearer ${user.access_token}`, 
                    'Content-Type': 'application/json',
                    Accept:'application/json',
                }
            })
            rsa.generateKeyPair(async function (keyPair){
              
                // const pk = keyPair.publicKey.split('\n');
                // pk.shift();pk.pop();pk.pop();
                // const mpk  =pk.join('\n');
  
                // console.log("public key ",mpk);
                
                // const grppublickey=keyPair.publickey;
                console.log("Grp Private key ",keyPair.privateKey);
                const bytes = aes.decrypt(
                    user.encryptedprivatekey.toString(),
                    process.env.NEXTAUTH_SECRET
                  );
          
                  console.log("bytes ",bytes);
                  const decryptedUserPrivateKey = bytes.toString(Latin1);
                console.log("decrypted user private key ",decryptedUserPrivateKey); 
                const grpprivatekey=aes.encrypt(keyPair.privateKey.toString(),decryptedUserPrivateKey).toString();

                const newGrpr=Group.create({
                  name:request.name,
                  folderId:folder.data.id,
                  publickey:keyPair.publicKey,
                  privatekey:grpprivatekey,
                  userIds:user.id,
                  userEmails:user.email,
                  ownerId:user.id
                })
                const userupdate=User.findOneAndUpdate(
                    {email:user.email},
                    {$push:{groupprikeys:{id:newGrpr._id,key:grpprivatekey}}})
              })
    }
    catch(e){
        console.log(e)
        return Response.json('err',{status:500})
    }
    return Response.json('ok');
    
}