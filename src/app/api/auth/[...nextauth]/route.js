import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { connect } from "@/dbConfig/dbConfig";
import { RSA } from "hybrid-crypto-js";
import aes from "crypto-js/aes";

import axios from "axios";
import User from "@/models/users";

import Latin1 from "crypto-js/enc-latin1";

const rsa = new RSA();

const authOptions = {
  
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      
      authorization:{
        params: {
          scope:"openid https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.appfolder https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.resource https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
  ],
  session:{
    strategy: "jwt",
  },
  callbacks:{
 
      
    async signIn({token,user,account,profile}){
      

        
        try {
          
            connect();
            const currUser= await User.exists({
              email:user.email
            });
            
            if(currUser===null){

            const folder= await axios.post(`https:www.googleapis.com/drive/v3/files?access_token=${account.access_token}`,
            {
                name: "SECURE",
                mimeType: 'application/vnd.google-apps.folder'
            },{

                headers:{
                    Authorization:`Bearer ${account.access_token}`, 
                    'Content-Type': 'application/json',
                    Accept:'application/json',
                }
            });
            const foldrid=folder.data.id;

            rsa.generateKeyPair(async function (keyPair){
              
              

              const userpublickey=keyPair.publicKey.toString();
              

              const userprivatekey=aes.encrypt(keyPair.privateKey,process.env.NEXTAUTH_SECRET).toString();
            //  console.log(mppk,"ko");
            //  console.log(aes.decrypt(userprivatekey,process.env.NEXTAUTH_SECRET).toString(Latin1)===mppk);
              const newUser=User.create({
                email:user.email,
                name:user.name,
                id:user.id,
                image:user.image,
                publickey:userpublickey,
                encryptedprivatekey:userprivatekey,
                groupprikeys:[],
                folderId:foldrid.toString(),
                access_token:account.access_token
              })
              

            })
            
          }
          else{
            
            
            await User.findOneAndUpdate(
              {email:user.email},
              {access_token:account.access_token})
            }
            
        } catch (error) {
            console.log(error);
            console.log("Couldn't create folder");
          }
        return true
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      return token
    },
    async session({ session, user, token }) {
      return session
    },
    
  },
  events:{
    async signOut({token,session}){
      
    //   session={};
    //   token={};
      
    
      
    }
  }
  
}
const handler=NextAuth(authOptions);
export {handler as GET ,handler as POST}