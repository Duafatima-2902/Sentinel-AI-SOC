const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Simple rule-based classification as fallback
function classifyWithRules(log) {
  const message = log.message.toLowerCase();
  
  // Critical patterns
  if (message.includes('critical') || 
      message.includes('breach') || 
      message.includes('unauthorized') ||
      message.includes('malware') ||
      message.includes('injection')) {
    return {
      severity: 'Critical',
      confidence: 0.9,
      message: 'Critical security event detected',
      category: 'Security'
    };
  }
  
  // High patterns
  if (message.includes('error') || 
      message.includes('failed') ||
      message.includes('memory leak') ||
      message.includes('connection failed')) {
    return {
      severity: 'High',
      confidence: 0.8,
      message: 'High priority system error',
      category: 'System'
    };
  }
  
  // Medium patterns
  if (message.includes('warn') || 
      message.includes('high cpu') ||
      message.includes('disk space') ||
      message.includes('failed login')) {
    return {
      severity: 'Medium',
      confidence: 0.7,
      message: 'Medium priority warning',
      category: 'Performance'
    };
  }
  
  // Default to Low
  return {
    severity: 'Low',
    confidence: 0.6,
    message: 'Low priority informational event',
    category: 'Info'
  };
}

async function classifyWithLLM(log) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    const prompt = `Analyze this log entry and classify its severity level (Low, Medium, High, Critical) and provide a brief explanation:

Log: ${log.message}

Respond in JSON format:
{
  "severity": "Low|Medium|High|Critical",
  "confidence": 0.0-1.0,
  "message": "Brief explanation",
  "category": "Security|System|Performance|Info"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });
    
    const content = response.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content);
      return classifyWithRules(log);
    }
  } catch (error) {
    console.error('LLM classification error:', error);
    return classifyWithRules(log);
  }
}

async function classifyLog(log, useLLM = false) {
  if (useLLM && openai) {
    return await classifyWithLLM(log);
  } else {
    return classifyWithRules(log);
  }
}

module.exports = {
  classifyLog,
  classifyWithRules,
  classifyWithLLM
};
