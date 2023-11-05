import { connect } from "@/dbConfig/dbConfig";
import axios from "axios";
import User from "@/models/users";
import Group from "@/models/group";



export const POST=async(req)=>{
    const request=await req.json();
    console.log(request);
    try{
        await connect();
        const grpexist=await Group.findOne({name:request.name});
        
        if(grpexist===null || !grpexist.userEmails.includes(request.owner)){
            throw new Error("grp doesnt exists")
        }
        const user=await User.findOne({email:request.email});
        if(user===null){
            throw new Error("user doesnt exists")
        }


        const perms = await axios.get(
            `https://www.googleapis.com/drive/v3/files/${grpexist.folderId}/permissions` ,
            {
                headers:{
                    Authorization:`Bearer ${user.access_token}`, 
                    'Content-Type': 'application/json',
                    Accept:'application/json',
                }
            });
          const permsUser = perms.data.permissions.find((perms) => {
            return perms.emailAddress === req.email;
          });
    
          const deletePerms = await axios.delete(
            `https://www.googleapis.com/drive/v3/files/${grpexist.folderId}/permissions/${permsUser.id}`,
            {
                headers:{
                    Authorization:`Bearer ${user.access_token}`, 
                    'Content-Type': 'application/json',
                    Accept:'application/json',
                }
            }
          );
          
          function notuseremail(userEmails){
            return userEmails!=user.email;
          }
          const updatedEmails=grpexist.userEmails.filter(notuseremail);

          await Group.findOneAndUpdate({name:request.name},{userEmails:updatedEmails});
         
        console.log(grpexist.name);
        let updatedkeys= user.groupprikeys.filter(({id,key})=>{return id!==grpexist.name})
        await User.updateOne({email:request.email},{groupprikeys:updatedkeys});
            
    }
    catch(e){
        console.log(e)
        return Response.json(e,{status:500})
    }
    return Response.json('ok');
    
}