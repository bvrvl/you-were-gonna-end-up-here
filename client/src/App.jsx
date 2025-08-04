import { useState, useEffect } from 'react';
import './App.css';

//The end condition logic lives on the frontend.
//This allows both button clicks and custom text input to end the chain.
const END_KEYWORDS = ['born', 'birth', 'existed', 'conceived', 'created', 'genetics', 'dna'];

function App() {
  //State to hold the full chain of causes
  const [causalChain, setCausalChain] = useState([]);
  //State to hold the next set of choices from the AI
  const [nextChoices, setNextChoices] = useState([]);
  //State for the user's text input (used for both initial and subsequent steps)
  const [userInput, setUserInput] = useState('');
  //State to manage the loading spinner
  const [isLoading, setIsLoading] = useState(false);
  //State to manage the final screen
  const [isFinished, setIsFinished] = useState(false);
  const [finalMessage, setFinalMessage] = useState("Which was the one event you had no choice in."); // Final message is now constant

  //Function that handles any new cause whether from a button or the text field.
  const processNewCause = (cause) => {
    //Sanitize the cause by removing any list numbering (e.g., "1. ")
    const cleanedCause = cause.includes('. ') ? cause.substring(cause.indexOf('. ') + 2).trim() : cause.trim();
    if (!cleanedCause) return; // Do nothing if the cause is empty

    //Add the sanitized cause to history.
    const updatedChain = [...causalChain, cleanedCause];
    setCausalChain(updatedChain);
    setUserInput(''); // Reset the input field for the next step.

    //Check if this new cause triggers the end condition.
    const isEnd = END_KEYWORDS.some(keyword => cleanedCause.toLowerCase().includes(keyword));
    if (isEnd) {
      setIsFinished(true);
      return; // Stop the process and trigger the final screen render.
    }

    //If the chain is not finished, fetch the next set of choices from the backend.
    setIsLoading(true);
    setNextChoices([]);

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cause: cleanedCause, chainLength: updatedChain.length }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      setNextChoices(data.next_choices || []); // Ensure there is always an array
    })
    .catch(error => console.error("Error generating next causes:", error))
    .finally(() => setIsLoading(false));
  };

  //Function to reset the entire experience
  const handleRestart = () => {
    setCausalChain([]);
    setNextChoices([]);
    setUserInput('');
    setIsFinished(false);
    setFinalMessage("Which was the one event you had no choice in.");
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
        {causalChain.length === 0 ? (
          // This form handles the very first input
          <form onSubmit={(e) => { e.preventDefault(); processNewCause(userInput); }} className='initial-form'>
            <p> How did you get here?</p>
            <input type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., I was browsing GitHub..."
            autoFocus/>
            <button type="submit" disabled={isLoading}>Begin</button>
          </form>
        ) : (
          // This is the main interactive loop after the first step
          <div className='current-cause'>
            <p> You are here because:</p>
            <h2>{causalChain[causalChain.length - 1]}</h2>
          </div>
        )}

        {isLoading && <p>Thinking...</p>}

        {/* This section appears when not loading and after the first step */}
        {!isLoading && causalChain.length > 0 && (
          <div className='choices'>
            <p>... and that was because?</p>
            {/* AI Generated Buttons */}
            {nextChoices.map((choice, index) => (
              <button key={index} onClick={() => processNewCause(choice)}>
                {choice.substring(choice.indexOf('.') + 1).trim()}
              </button>
            ))}
            {/* The user's hybrid text input field */}
            <form onSubmit={(e) => { e.preventDefault(); processNewCause(userInput); }} className="hybrid-input-form">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Or enter your own reason..."
                />
                <button type="submit" disabled={!userInput.trim()}>Submit</button>
            </form>
          </div>
        )}
      </>
      )}
      </main>
    </>
  );
}
      
export default App;