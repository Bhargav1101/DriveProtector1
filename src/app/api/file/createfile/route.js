
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

export const POST =async(req,res)=>{
    const data = await req.formData();
    const file = data.get('file');
    const groupname = data.get('groupname');

    console.log("file ",file);
    console.log("groupname ",groupname);

    await connect();
    const session = await getServerSession();
    const group = await Group.findOne({name:groupname,userEmails:session.user.email});
    console.log("group ",group);
    console.log("session ",session);

    try{
      upload.single("file")(req, {}, async (err) => {

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

        const file1 = await fs.promises.readFile(file.name);
        console.log("file ",file1);
        const hexFile = file1.toString("hex");
        console.log("hexfile ",hexFile);
        const signature = crypt.signature(privateKeyDecrypted, hexFile);
        console.log("sign ",signature);


        console.log("group public key ",group.publickey);
        
        const encfile = crypt.encrypt(
          group.publickey.toString(),
          hexFile,
          signature
        );

        const encryptedFileBuffer = Buffer.from(encfile);
        console.log("!! ",encryptedFileBuffer);

        // Upload Metadata
        const metadata = await axios.post(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
          {
            name: file.name,
            parents: [group.folderId],
          },
          {
            headers: {
              authorization: `Bearer ${currentuser.access_token}`,
              "X-Upload-Content-Type": "application/octet-stream",
              "X-Upload-Content-Length": encryptedFileBuffer.byteLength,
              "Content-Type": "application/json;charset=UTF-8",
            },
          }
        );

        console.log("metadata ",metadata);

        // Upload files to the metadata location
        const resp = await axios.post(
          metadata.headers.location,
          encryptedFileBuffer,
          { 
            headers: {
              authorization: `Bearer ${currentuser.access_token}`,
              "Content-Type": "application/octet-stream",
              "Content-Length": encryptedFileBuffer.byteLength,
            },
          }
        );

        console.log("last step! ",resp);

        // Delete File
        // fs.unlink(req.file.path, (err) => {
        //   if (err) {
        //     console.error(err);
        //     return;
        //   }
        // });
      });

    }catch(error){
      console.log("error occured ",error);
    }


    return Response.json("ok")

};
