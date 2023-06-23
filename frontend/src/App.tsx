import React, {useState, ChangeEvent, FormEvent} from 'react';
import logo from './logo.png';
import './App.css';
import QRCode from 'react-qr-code';
import {get } from 'http';
import { error} from 'console';
import reclaim_logo from './reclaim_logo.png';
// const reclaim_logo = require('./reclaim_logo.png');

function App() {
  const [blockedId, setBlockedId] = useState('');
  const [template, setTemplate] = useState('');
  const [proofData, setProofData] = useState('');

  console.log('Change the backend Base to appropriate url')
  const backendBase = 'http://localhost:3000';
  const backendUrl = `${backendBase}/block-profile/`;
  // const backendProofUrl = `${backendBase}/get-proof`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      console.log(backendUrl + blockedId)
      const response = await fetch(backendUrl+blockedId);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data.reclaimUrl);
        console.log("The template generated: " + template);
      }
      else {
        setTemplate('Error: Unable to receive a valid template from the backend. Check if it is up and running');
      }
    }
    catch (error) {
      setTemplate('Caught an error' + error);
      console.log(error);
    }
  }

  const handleBlockedIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBlockedId(e.target.value);
  }; 

  return (
    <div className="App">
      <h1>Quora Cancellors</h1>
      <h2>An anonymous space to prove that you have cancelled an infidel.</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Infidel's Username:
          <input
            type='text'
            onChange={handleBlockedIdChange}
            required
          />
        </label>
      </form>

      {template && <div>
      <div style={{ backgroundColor: "#030320", display: "flex", justifyContent: "center", alignItems: "center", padding:"20px"}}>
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px" }}>
        <a href={template} target="_blank" rel="noopener noreferrer" title={template}>
          <QRCode
            size={256}
            value={template}
            fgColor="#000"
            bgColor="#fff"
          />
        </a>
        </div>
      </div>
      <div>Scan the QR code or click on it to be redirected.</div>
      </div>
      }
    </div>
  );
}

export default App;
