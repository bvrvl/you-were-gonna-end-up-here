import { useState, useEffect } from 'react';
import './App.css';


// --- Helper Components ---

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
    <path d="M12 21V3M12 21L17 16M12 21L7 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThemeToggle = ({ theme, onToggle }) => (
  <button onClick={onToggle} className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path className="moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      <g className="sun">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </g>
    </svg>
  </button>
);


// --- Screen Components ---

const InitialScreen = ({ onBegin }) => {
  const [userInput, setUserInput] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) onBegin(userInput);
  };
  return (
    <div className="initial-screen fade-in">
      <p className="subtitle">Let's trace the path that was laid out for you.</p>
      <form onSubmit={handleSubmit} className="initial-form">
        <label htmlFor="initial-cause">It started when you...</label>
        <input id="initial-cause" type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="e.g., opened your laptop" autoFocus/>
        <button type="submit" disabled={!userInput.trim()}>Begin the unraveling</button>
      </form>
    </div>
  );
};

const InteractionLoop = ({ cause, nextChoices, onNext, isLoading }) => {
  const [userInput, setUserInput] = useState('');
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if(userInput.trim()) {
      onNext(userInput);
      setUserInput('');
    }
  };
  return (
    <div className="interaction-loop">
      <div className="current-cause fade-in">
        <p className="because">You are here because:</p>
        <h2>{cause}</h2>
      </div>
      {isLoading ? (
        <div className="loader"><p>The next step reveals itself...</p><div className="spinner"></div></div>
      ) : (
        <div className="choices fade-in">
          <p className="inevitable">Which was an inevitable consequence of...</p>
          <div className="button-group">
            {nextChoices.map((choice, index) => {
                const cleanChoice = choice.replace(/^\d+\.\s*/, '').trim();
                return <button key={index} onClick={() => onNext(cleanChoice)}>{cleanChoice}</button>
            })}
          </div>
          <form onSubmit={handleFormSubmit} className="hybrid-input-form">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Or was there another reason?"/>
            <button type="submit" disabled={!userInput.trim()}>Assert Choice</button>
          </form>
        </div>
      )}
    </div>
  );
};

const FinalScreen = ({ chain, onRestart }) => {
  const reversedChain = [...chain].reverse();
  return (
    <div className="final-screen fade-in">
      <h2>The final cause... and you had no choice in that.</h2>
      <div className="chain-history-finished">
        {reversedChain.map((cause, index) => (
          <div key={index} className="chain-item" style={{ animationDelay: `${index * 0.3}s` }}>
            <p>{cause}</p>
            {index < reversedChain.length - 1 && <ArrowIcon />}
          </div>
        ))}
      </div>
      <p className="final-text">Every step, every choice, a link in a chain forged long before you arrived.</p>
      <button onClick={onRestart} className="restart-button">Witness Another Inevitability</button>
    </div>
  );
};


// --- Main App Component ---

function App() {
  const [theme, setTheme] = useState('dark');
  const [causalChain, setCausalChain] = useState([]);
  const [nextChoices, setNextChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState(null); 

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const processNewCause = (cause) => {
    setIsLoading(true);
    setNextChoices([]);
    //CLEAR previous errors on a new request
    setError(null);
    const updatedChain = [...causalChain, cause];
    setCausalChain(updatedChain);

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: updatedChain }),
    })
    .then(res => {
      //check if the response itself is not ok (e.g., status 500)
      if (!res.ok) {
          throw new Error('Something went wrong with the server.');
      }
      return res.json();
  })
    .then(data => {
      if (data.error) throw new Error(data.error);
      if (data.is_finished) {
        setCausalChain(prevChain => [...prevChain, data.final_cause]);
        setIsFinished(true);
      } else {
        setNextChoices(data.next_choices || []);
      }
    })
    .catch(error => {
      console.error("Error processing server response:", error);
      //set the error state if something goes wrong
      setError("The chain has been broken. The path is lost. Please try again.");
  })
  .finally(() => setIsLoading(false));
};

  const handleStart = (initialCause) => {
    setHasStarted(true);
    setError(null); //clear errors on start
    processNewCause(initialCause);
  };
  
  const handleRestart = () => {
    setCausalChain([]);
    setNextChoices([]);
    setIsFinished(false);
    setHasStarted(false);
    setError(null); //clear errors on restart
  };

  return (
    <div className='container'>
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <header className="main-header">
          <h1 className="main-title">You were always gonna end up here.</h1>
          <ThemeToggle theme={theme} onToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} />
      </header>

      <main>
        {!hasStarted && <InitialScreen onBegin={handleStart} />}
        {hasStarted && !isFinished && (
          <InteractionLoop
            cause={causalChain[causalChain.length - 1]}
            nextChoices={nextChoices}
            onNext={processNewCause}
            isLoading={isLoading}
          />
        )}
        {isFinished && <FinalScreen chain={causalChain} onRestart={handleRestart} />}
      </main>
    </div>
  );
}
      
export default App;