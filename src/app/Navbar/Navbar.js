"use client"
import React from 'react';
import { useState } from "react";
import { Link } from 'react-router-dom'; // If you're using React Router
import './Navbar.css';
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation";
import logo from "../../../public/logo.png";
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import axios from "axios";
import Image from 'next/image';
import styles from "../Home/Home.css";
import About from "../about/page.js"



const Navbar = () => {
  const session = useSession();
  console.log(session);

  const handleclick=()=>{
    <About/>
  }

  return (
    <div className="navbar">
      <div className='container'>
        <div className='logoo'>
          <a href="/"><Image src={logo}/></a>
        </div>
        <ul className='nav-links'>
          <li>
            <a href="/about">About</a>
          </li>
          <li>
            <a href="/approach">Approach</a>
          </li>
        </ul>
        <div className='action-buttons'>
          {session.status=="authenticated"&&<a href="/group"><button type="submit" className='btn login'>Group</button></a>}
          {session.status=="authenticated"?<button type="submit" onClick={()=>signOut()}className="btn login">Logout</button>:<button type="submit" onClick={()=>signIn("google")} className="btn login">Login/Signin</button>}
          {session.status=="authenticated"&&<h3>{session.data.user.name}</h3>}
        </div>
      </div>
    </div>
  )
};

export default Navbar;