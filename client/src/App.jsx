import { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [generatedCause, setGeneratedCause] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  //Function called when the button is clicked
  const handleGenerateClick = () => {
    setIsLoading(true);
    setGeneratedCause(''); //clear previous cause

    //make a POST request to backend endpoint
    fetch('api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Will later send data here in the body but not needed now for testing
      // body: JSON.stringify({ prompt: "some user input"})
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      setGeneratedCause(data.generated_text);
    })
    .catch(error => {
      console.error("Error generating cause:", error);
      setGeneratedCause(`Error: ${error.message}`);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <>
      <h1>You Were Going to End Up Here</h1>
      <div className="card">
        <button onClick={handleGenerateClick} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Why did I end up here?'}
        </button>
      </div>
      {/* Display message from the AI */}
      {generatedCause && (
        <div className="result">
          <p><strong>A possible reason:</strong></p>
          <blockquote>{generatedCause}</blockquote>
        </div>
      )}
    </>
  )
}


  export default App;