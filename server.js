const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4200;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, 'dist/code-analyser')));

// API proxy endpoint for OpenAI
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'OpenAI API key not configured on server' 
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to OpenAI API' 
    });
  }
});

// Handle Angular routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/code-analyser/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving Angular app from dist/code-analyser`);
  console.log(`🔐 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'NOT SET'}`);
});

