
import axios from "axios";
import { getServerSession } from "next-auth";
import { Crypt, RSA } from "hybrid-crypto-js";
import aes from "crypto-js/aes";
import Latin1 from "crypto-js/enc-latin1";
import User from "@/models/users";
import Group from "@/models/group";
import { connect } from "@/dbConfig/dbConfig";

const secret = process.env.SECRET;

export const GET =async(req,res)=>{

    await connect();
    const session = await getServerSession();
    const group = await Group.findOne({userEmails:session.user.email});
    const user = await User.findOne({email:session.user.email});
    console.log("session ",session);
    console.log("group ",group);
    console.log("user ",user);
    console.log("folerid ",group.folderId);
    
    try{
      const res = await axios.get(
        `https://www.googleapis.com/drive/v3/files`,{
          
            q: `'${group.folderId}' in parents`,
          
        },
        {
            headers:{
                authorization: `Bearer ${user.access_token}`,
                Accept:'application/json',
            },
        }

      )
      console.log("res ",res);
      res.status(200).json({ name: group.name, files: res.data.files });
    }catch(error){
      console.log("error occured ",error);
    }


    return Response.json("ok")

};
