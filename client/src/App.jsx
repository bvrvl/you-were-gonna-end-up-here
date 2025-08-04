import { useState } from 'react';
import './App.css';

function App() {
  //State to hold the full chain of causes
  const [causalChain, setCausalChain] = useState([]);
  //State to hold the next set of choices from the AI
  const [nextChoices, setNextChoices] = useState([]);
  //State for the user's text input
  const [userInput, setUserInput] = useState('');
  //State to manage the loading spinner
  const [isLoading, setIsLoading] = useState(false);
  //State to manage the final screen
  const [isFinished, setIsFinished] = useState(false);

  // Function that processes any new cause from the user
  const processNewCause = (cause) => {
    const cleanedCause = cause.includes('. ') ? cause.substring(cause.indexOf('. ') + 2).trim() : cause.trim();
    if (!cleanedCause) return;

    const updatedChain = [...causalChain, cleanedCause];
    setCausalChain(updatedChain);
    setUserInput('');
    setIsLoading(true);
    setNextChoices([]);

    // Call the backend and wait for its instructions
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      //Send the entire history
      body: JSON.stringify({ history: updatedChain }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      // The backend tells us if the game is over
      if (data.is_finished) {
        // If it's over, add the AI's final cause to our chain and end
        setCausalChain(prevChain => [...prevChain, data.final_cause]);
        setIsFinished(true);
      } else {
        // If not over, just display the next choices
        setNextChoices(data.next_choices || []);
      }
    })
    .catch(error => console.error("Error processing server response:", error))
    .finally(() => setIsLoading(false));
  };

  //Function to reset the entire experience
  const handleRestart = () => {
    setCausalChain([]);
    setNextChoices([]);
    setUserInput('');
    setIsFinished(false);
  };

  return (
    <div className='container'>
      <header>
      <h1>You Were Going to End Up Here</h1>
      </header>
      <main>
      {/* The Final Screen */}
      {isFinished ? (
        <div className='final-screen'>
          <h2>The chain has reached its foundational cause:</h2>
          <div className='chain-history-finished'>
            {causalChain.map((cause, index) => (
              <p key={index}>
                <span>{causalChain.length - index}.
                </span> {cause}
              </p>
            ))}
          </div>
            <button onClick={handleRestart} className="restart-button">Trace Another Path</button>
        </div>
      ):(
        <>
        {/* The interactive part*/}
        {causalChain.length === 0 ? (
          // Initial form
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
          // Main interactive loop
          <div className='current-cause'>
            <p> You are here because:</p>
            <h2>{causalChain[causalChain.length - 1]}</h2>
          </div>
        )}

        {isLoading && <p>Thinking...</p>}

        {!isLoading && causalChain.length > 0 && !isFinished && (
          <div className='choices'>
            <p>... and that was because?</p>
            {/* AI Generated Buttons */}
            {nextChoices.map((choice, index) => {
              // Remove any leading numbering (e.g., "1. ") but leave full text otherwise
              const displayText = choice.replace(/^\d+\.\s*/, '').trim();
              return (
                <button key={index} onClick={() => processNewCause(choice)}>
                  {displayText}
                </button>
              );
            })}
            {/* The user's hybrid text input form */}
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
    </div>
  );
}
      
export default App;