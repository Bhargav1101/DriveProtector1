
// import jwt from "next-auth/jwt";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { Crypt, RSA } from "hybrid-crypto-js";
import aes from "crypto-js/aes";
import Utf16 from "crypto-js/enc-utf16";
import Latin1 from "crypto-js/enc-latin1";
import os from "os";
import User from "@/models/users";
import Group from "@/models/group";
import path from "path";
import { NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";

const secret = process.env.SECRET;

export const config = {
    api: {
      bodyParser: false,
    },
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

const crypt = new Crypt({
  md: 'sha512',
});

export const GET = async(req,res)=>{
  var url = new URL(req.url);
  const groupname = url.searchParams.get("groupname");
  const fileid = url.searchParams.get("fileid");
  console.log("groupname ",groupname);
  console.log("fileid ",fileid);

    await connect();
    const session = await getServerSession();
    const group = await Group.findOne({name:groupname,userEmails:session.user.email});
    console.log("group ",group);
    console.log("session ",session);

    try{
        const grpencryptedprivatekey = group.privatekey;
        console.log("encgrppk ",grpencryptedprivatekey);

        const currentuser = await User.findOne({email:session.user.email});
        console.log("currentuser ",currentuser);

        const bytes = aes.decrypt(
          currentuser.encryptedprivatekey.toString(),
          process.env.NEXTAUTH_SECRET
        );

        console.log("bytes ",bytes);
        const decryptedUserPrivateKey = bytes.toString(Latin1);
        console.log("decryptedUserPrivateKey ",decryptedUserPrivateKey);

        const byte = aes.decrypt(
          grpencryptedprivatekey,
          decryptedUserPrivateKey,
        )
        const privateKeyDecrypted =byte.toString(Latin1);

        console.log("aaa ",privateKeyDecrypted);

        const fileInfo = await axios.get(
          "https://www.googleapis.com/drive/v3/files/" + fileid,
          {
            headers: {
              authorization: `Bearer ${currentuser.access_token}`,
            },
          }
        );

        console.log("filedata ",fileInfo.data);

        const downloadPath = path.join(
          os.tmpdir(),
          fileInfo.data.name + ".encrypted"
        );

        console.log("download Path ",downloadPath);

        const location = fs.createWriteStream(downloadPath);
        console.log("location ",location);
        const file = await axios.get(
          "https://www.googleapis.com/drive/v3/files/" + fileid + "?alt=media",

          {
            headers: {
              authorization: `Bearer ${currentuser.access_token}`,
            },
            responseType: "stream",
          }
        );
        // console.log("file!! ",file);

        await new Promise(function (resolve) {
          file.data.pipe(location);
          file.data.on("end", resolve);
        });
  
        const encryptedFile = await fs.promises.readFile(downloadPath);
        const encryptedFileString = encryptedFile.toString();
        console.log("encrypted file ",encryptedFile);
  
        const fileDecrypted = crypt.decrypt(
          privateKeyDecrypted.toString(),
          encryptedFileString.toString()
        );

        console.log("file decrypted ",fileDecrypted);
  
        const verify = crypt.verify(
          group.publickey.toString(),
          fileDecrypted.signature,
          fileDecrypted.message
        );

        if (!verify) {
          // If the file isn't signed, respond with an unauthorized request and do not send back the file.
  
          // Delete File
          fs.unlink(downloadPath, (err) => {
            if (err) {
              console.error(err);
              return;
            }
            // File removed
          });
  
          // res.status(401);
        } else {
          const decryptedFilePath = path.join(os.tmpdir(), fileInfo.data.name);
  
          await fs.promises.writeFile(
            decryptedFilePath,
            fileDecrypted.message,
            "hex"
          );
          console.log("decryptedfilepath ",decryptedFilePath);
  
          // Response.setHeader("Content-Type", fileInfo.data.mimeType);
          // Response.setHeader("Name", fileInfo.data.name);
          const decryptedBuffer = await fs.promises.readFile(decryptedFilePath);
          const data = {
            data:{
              data:decryptedBuffer
            },
            headers:{
              "Content-Type": fileInfo.data.mimeType,
              "Name": fileInfo.data.name

            }

          }
          console.log("decrypted buffer ",decryptedBuffer)
          return Response.json(data);
  
          // Delete File
          // fs.unlink(downloadPath, (err) => {
          //   if (err) {
          //     console.error(err);
          //     return;
          //   }
          //   // File removed
          // });
  
          // Delete File
          // fs.unlink(decryptedFilePath, (err) => {
          //   if (err) {
          //     console.error(err);
          //     return;
          //   }
          //   // File removed
          // });
       
      };

    }catch(error){
      console.log("error occured ",error);
    }


    return Response.json("ok")

};
