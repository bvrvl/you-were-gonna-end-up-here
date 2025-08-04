import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- Core UI Components ---
const Header = ({ cause, isActive }) => (
  <div className={`chain-node fade-in ${isActive ? 'active' : 'inactive'}`}>
    <h2>You are here because:</h2>
  </div>
);

const ChainNode = ({ cause, isActive }) => (
  <div className={`chain-node fade-in ${isActive ? 'active' : 'inactive'}`}>
    <p>{cause}</p>
  </div>
);

const Connector = () => <div className="connector"></div>;

const InteractionZone = ({ nextChoices, onNext, isLoading, error }) => {
  const [userInput, setUserInput] = useState('');

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      onNext(userInput);
      setUserInput('');
    }
  };

  if (isLoading) {
    return <p className="prompt-text">Analyzing causal pathways...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="interaction-zone fade-in">
      <p className="prompt-text">Which was an inevitable outcome of:</p>
      <div className="button-group">
        {nextChoices.map((choice) => {
          const cleanChoice = choice.replace(/^\d+\.\s*/, '').trim();
          return <button key={cleanChoice} onClick={() => onNext(cleanChoice)}>{cleanChoice}</button>;
        })}
      </div>
      <form onSubmit={handleUserSubmit} className="user-input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Or assert your own cause..."
          disabled={isLoading}
        />
        <button type="submit" disabled={!userInput.trim() || isLoading}>Assert</button>
      </form>
    </div>
  );
};

const FinalScreen = ({ chain, onRestart }) => {
    const finalCause = chain[chain.length - 1];
    const history = chain.slice(0, -1);

    return (
        <div className="final-screen fade-in">
            <div className="causal-chain">
                {history.map((cause, index) => (
                    <React.Fragment key={index}>
                        <ChainNode cause={cause} isActive={false} />
                        <Connector />
                    </React.Fragment>
                ))}
                <ChainNode cause={finalCause} isActive={true} />
            </div>
            <h2>And You Didn't Even Have a Choice in That.</h2>
            <p className="final-text">
            Every step, every choice, a link in a chain forged long before you arrived. You were always gonna end up here.
            </p>
            <button onClick={onRestart} className="restart-button">Observe Another Sequence</button>
        </div>
    );
};


// --- Main App Component ---

function App() {
  const [causalChain, setCausalChain] = useState([]);
  const [nextChoices, setNextChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);
  const interactionRef = useRef(null);

  useEffect(() => {
    if (interactionRef.current) {
      interactionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [causalChain, isLoading]);

  const processNewCause = (cause) => {
    setIsLoading(true);
    setNextChoices([]);
    setError(null);
    setCausalChain(prev => [...prev, cause]);

    const updatedChain = [...causalChain, cause];

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: updatedChain }),
    })
      .then(res => {
        if (!res.ok) throw new Error('The connection to the causal stream was lost.');
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.is_finished) {
          setCausalChain(prev => [...prev, data.final_cause]);
          setIsFinished(true);
        } else {
          setNextChoices(data.next_choices || []);
        }
      })
      .catch(err => {
        console.error("Error processing cause:", err);
        setError(err.message || "An unknown anomaly occurred. The path is lost.");
      })
      .finally(() => setIsLoading(false));
  };

  const handleRestart = () => {
    setCausalChain([]);
    setNextChoices([]);
    setIsFinished(false);
    setError(null);
  };

  const InitialView = () => {
    const [userInput, setUserInput] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if(userInput.trim()) processNewCause(userInput);
    }
    return (
        <div className="fade-in" style={{width: '100%', textAlign: 'center'}}>
            <h1 style={{fontSize: '2.5rem', marginBottom: '2rem'}}>You were always gonna end up here.</h1>
            <p className="prompt-text">The present is a conclusion. Define the first premise.</p>
            <form onSubmit={handleSubmit} style={{width: '100%'}}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="It started when..."
                    autoFocus
                />
                <button type="submit" disabled={!userInput.trim()} style={{marginTop: '1rem'}}>Begin Analysis</button>
            </form>
        </div>
    )
  }

  return (
    <div className='container'>
      <main>
        {isFinished ? (
            <FinalScreen chain={causalChain} onRestart={handleRestart} />
        ) : causalChain.length === 0 ? (
            <InitialView />
        ) : (
            <>
                <div className="causal-chain">
                    {causalChain.map((cause, index) => (
                        <React.Fragment key={index}>
                            <ChainNode cause={cause} isActive={index === causalChain.length - 1} />
                            {index < causalChain.length - 1 && <Connector />}
                        </React.Fragment>
                    ))}
                </div>
                <div ref={interactionRef}>
                    <InteractionZone
                        nextChoices={nextChoices}
                        onNext={processNewCause}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </>
        )}
      </main>
    </div>
  );
}

export default App;