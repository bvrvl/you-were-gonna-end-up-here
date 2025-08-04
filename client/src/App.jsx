import { useState, useEffect } from 'react';
import './App.css';

function App() {
  //State to hold the full chain of causes
  const [causalChain, setCausalChain] = useState([]);
  //State to hold the next set of choices from the AI
  const [nextChoices, setNextChoices] = useState([]);
  //State for the user's initial input
  const [initialReason, setInitialReason] = useState('');
  //State to manage the loading spinner
  const [isLoading, setIsLoading] = useState(false);

  //State to manage the final screen
  const [isFinished, setIsFinished] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');

  //Function to call the backend with a given cause
  const generateNextCauses = (cause) => {
    setIsLoading(true);
    setNextChoices([]); //Clear Old choices

    fetch ('/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      //Send the chain length to the backend
      body: JSON.stringify({ cause:cause, chainLength: causalChain.length }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      //Handle the end signal from the server
      if (data.is_end) {
        setIsFinished(true);
        setFinalMessage(data.final_message);
      } else {
      setNextChoices(data.next_choices);
    }
  })
    .catch(error => console.error("Error generating next causes:", error))
    .finally(() => setIsLoading(false));
  };

  //Handler for when a user selects one of the AI's choices
  const handleChoiceClick = (choice) => {
    const cleanedChoice =
    choice.substring(choice.indexOf('.') + 1).trim();
    //Add the selected choice to history
    setCausalChain(prevChain => [...prevChain, cleanedChoice]);
    //Ask the AI for the next set of causes based on this new choice
    generateNextCauses(cleanedChoice);
  };

  //Handler for intial submission
  const handleInitialSubmit = (e) => {
    e.preventDefault(); //Prevent form from reloading the page
    if (!initialReason.trim()) return; //Don't submit if empty
    setCausalChain([initialReason]);
    generateNextCauses(initialReason);
  }

  //Function to reset the entire experience
  const handleRestart = () => {
    setCausalChain([]);
    setNextChoices([]);
    setInitialReason('');
    setIsFinished(false);
    setFinalMessage('');
  };

  return (
    <>
      <header>
      <h1>You Were Going to End Up Here</h1>
      </header>
      <main>
      {/* The Final Screen */}
      {isFinished ? (
        <div className='final-screen'>
          <h2>The chain of causality:</h2>
          <div className='chain-history-finished'>
            {causalChain.map((cause, index) => (
              <p key={index}>
                <span>{causalChain.length - index}.
                </span> {cause}
              </p>
            ))}
          </div>
          <p className="final-message">{finalMessage}</p>
            <button onClick={handleRestart} className="restart-button">Start Again</button>
        </div>
      ):(
        <>
        {/* The interactive part*/}
        {causalChain.length ===0 ? (
          <form onSubmit={handleInitialSubmit} className='initial-form'>
            <p> How did you get here?</p>
            <input type="text"
            value={initialReason}
            onChange={(e) =>
            setInitialReason(e.target.value)}
            placeholder="e.g., I was browsing GitHub..."
            autoFocus/>
            <button type="submit" disabled={isLoading}>Begin</button>
          </form>
        ) : (
          //Display the last thing the user clicked
          <div className='current-cause'>
            <p> You are here because:</p>
            <h2>{causalChain[causalChain.length - 1]}</h2>
            </div>
        )}
        {isLoading && <p>Thinking...</p>}

        {!isLoading && nextChoices.length > 0 && (
          <div className='choices'>
            <p>... and that was because?</p>
            {nextChoices.map((choice, index) => (
              <button key={index} onClick={() =>
              handleChoiceClick(choice)}>
                {choice.substring(choice.indexOf('.') +1).trim()}
              </button>
            ))}
          </div>
        )}
      </>
      )}
    </main>
    </>
  );
}
      
export default App;