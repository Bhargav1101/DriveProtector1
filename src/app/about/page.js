import React from 'react';
import './About.css';
import collegeLogo from "../../../public/assests/IIITP_logo.jpg";
import Navbar from '../Navbar/Navbar';
import Image from 'next/image';

function about() {
  const developers = [
    { name: 'Brijesh Verma', rollNumber: '112116009',branch:'ECE' },
    { name: 'Chaitrali Shinde', rollNumber: '112115147' ,branch:'CSE'},
    { name: 'Piyush Patel', rollNumber: '112115109' ,branch:'CSE'},
    { name: 'Bhargav Rathod', rollNumber: '112115128',branch:'CSE' },
    // Add more developer details here
  ];

  return (
    <>
    <Navbar></Navbar>
    <div className="about-container">
      <div className="college-info">
        <Image src={collegeLogo} alt="College Logo" className="college-logo" />
        <h1>Indian Institute of Information Technology Pune</h1>
        <h2>Supervisor: Dr. Shruti Taksali</h2>
      </div>
      <div className="developers-section">
        <h2>Developers Detail</h2>
        <ul className="developer-list">
          {developers.map((developer, index) => (
            <li key={index} className="developer">
              <h3>{developer.name}</h3>
              <p>MIS number : {developer.rollNumber}</p>
              <p>Branch     : {developer.branch}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
    
  );
}

export default about;
