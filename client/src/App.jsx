import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() =>{

    fetch('api/test')
    .then(response => response.json)
    .then(data => {
      setServerMessage(data.message);
    })
    .catch(error => {
      console.error("Error fetching from the server:", error);
      setServerMessage("Could not connect to the server. Check running status.");

    });

  }, [])

  return(
    <>
      <h1>You Were Gonna End Up Here</h1>
      <div className="card">
        <p>
          {/*Display Message from the server*/}
          <strong>BackendStatus:</strong>
          {serverMessage || "Loading..."}
          </p>
          </div> 
    </>
  )
  }

  export default App;