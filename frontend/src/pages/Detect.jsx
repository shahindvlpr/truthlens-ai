import React, { useState } from 'react';

const Detect = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetect = async () => {
    if (!text.trim()) {
      setError('Please enter some news text');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Mock prediction
      setTimeout(() => {
        const mockResult = {
          prediction: Math.random() > 0.5 ? 'Fake' : 'Real',
          confidence: Math.floor(Math.random() * 30) + 70,
          toxicity_score: Math.floor(Math.random() * 50),
          sentiment: ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)]
        };
        setResult(mockResult);
        setLoading(false);
        
        // Save to backend
        fetch('http://localhost:5000/api/news/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            news_text: text,
            prediction: mockResult.prediction,
            confidence: mockResult.confidence,
            toxicity_score: mockResult.toxicity_score,
            sentiment: mockResult.sentiment
          })
        }).catch(console.error);
      }, 1500);
    } catch (err) {
      setError('Detection failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px', fontSize: '28px' }}>Detect Fake News</h1>
        <p style={{ color: '#6b7280', marginBottom: '25px' }}>Enter a news article or social media post to analyze</p>
        
        <textarea
          rows={6}
          placeholder="Paste news article or social media post here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '15px', 
            border: '1px solid #d1d5db', 
            borderRadius: '12px', 
            fontSize: '14px', 
            boxSizing: 'border-box', 
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        
        <button
          onClick={handleDetect}
          disabled={loading}
          style={{ 
            width: '100%', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '14px', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '16px', 
            fontWeight: '600',
            cursor: 'pointer', 
            marginTop: '20px',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze News'}
        </button>
        
        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '10px', 
            marginTop: '20px', 
            textAlign: 'center' 
          }}>
            {error}
          </div>
        )}
        
        {result && (
          <div style={{ 
            marginTop: '25px', 
            padding: '20px', 
            borderRadius: '12px', 
            backgroundColor: result.prediction === 'Fake' ? '#fef2f2' : '#f0fdf4', 
            border: `2px solid ${result.prediction === 'Fake' ? '#ef4444' : '#22c55e'}` 
          }}>
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>
              Result: <span style={{ color: result.prediction === 'Fake' ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>{result.prediction}</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Confidence</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{result.confidence}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Toxicity</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{result.toxicity_score}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Sentiment</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{result.sentiment}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Detect;