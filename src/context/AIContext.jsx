
import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pollinations.ai Free API endpoints
  const POLLINATIONS_API = 'https://image.pollinations.ai/prompt';
  const TEXT_API = 'https://text.pollinations.ai';

  // Generate AI suggestions based on user data
  const generateSuggestions = useCallback(async (userData, context = 'productivity') => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `As a productivity AI assistant, analyze this user data and provide specific, actionable suggestions to improve productivity and reduce expenses:

User Context: ${context}
User Data: ${JSON.stringify(userData)}

Provide suggestions in this JSON format:
{
  "suggestions": [
    {
      "category": "Time Management",
      "title": "Specific suggestion title",
      "description": "Detailed explanation of the suggestion",
      "impact": "High/Medium/Low",
      "estimatedSavings": "hours per week or $ amount",
      "actionSteps": ["Step 1", "Step 2", "Step 3"],
      "tools": ["Recommended tool 1", "Recommended tool 2"]
    }
  ],
  "summary": "Brief overall summary",
  "confidenceScore": 0.85
}`;

      const response = await axios.post(`${TEXT_API}/text`, {
        prompt,
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1500
      });

      // Parse the response
      let suggestions;
      try {
        suggestions = JSON.parse(response.data);
      } catch (e) {
        // If not JSON, try to extract JSON from text
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response');
        }
      }

      return suggestions;
    } catch (error) {
      setError(error.message);
      console.error('AI suggestion error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // AI Chat function
  const chatWithAI = useCallback(async (message, history = []) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${TEXT_API}/chat`, {
        messages: [
          {
            role: 'system',
            content: `You are HiSuru AI Assistant, a productivity expert. Help users optimize their workflow, reduce costs, and improve efficiency. Always respond in this structured format:

# [Main Heading]

## Key Insights
- Insight 1
- Insight 2

## Recommendations
1. **Recommendation 1**: Description
2. **Recommendation 2**: Description

## Action Steps
✅ Step 1
✅ Step 2

## Estimated Impact
📊 Metric: Value
💰 Cost Savings: Amount
⏰ Time Saved: Hours

Keep responses concise, actionable, and professional.`
          },
          ...history,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.data;
    } catch (error) {
      setError(error.message);
      console.error('AI chat error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate productivity report
  const generateProductivityReport = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate a comprehensive productivity report based on this data:

${JSON.stringify(data, null, 2)}

Format the report using these exact markdown patterns:

# Executive Summary
[Brief overview of productivity status]

## 📊 Performance Metrics
| Metric | Current | Target | Trend |
|--------|---------|--------|-------|
| [Metric 1] | [Value] | [Target] | 📈/📉 |
| [Metric 2] | [Value] | [Target] | 📈/📉 |

## 🎯 Key Findings
### Strengths
- [Strength 1]
- [Strength 2]

### Areas for Improvement
1. **[Area 1]**: Description
2. **[Area 2]**: Description

## 💡 Optimization Recommendations
### High Priority
🔴 **[Recommendation 1]**
- Impact: [High/Medium/Low]
- Estimated Savings: [Amount]
- Implementation: [Easy/Medium/Hard]

### Medium Priority
🟡 **[Recommendation 2]**
- Impact: [Medium]
- Estimated Savings: [Amount]
- Implementation: [Easy/Medium/Hard]

## 📅 Action Plan
### Week 1-2
- [ ] Task 1
- [ ] Task 2

### Week 3-4
- [ ] Task 1
- [ ] Task 2

## 📈 Projected Outcomes
- **Time Savings**: [X] hours/week
- **Cost Reduction**: $[Amount]/month
- **Productivity Increase**: [X]%`;

      const response = await axios.post(`${TEXT_API}/text`, {
        prompt,
        model: 'gpt-4',
        temperature: 0.5,
        max_tokens: 2000
      });

      return response.data;
    } catch (error) {
      setError(error.message);
      console.error('Report generation error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate expense reduction tips
  const generateExpenseTips = useCallback(async (expenseData) => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Analyze these expenses and provide cost reduction tips:

${JSON.stringify(expenseData, null, 2)}

Provide specific, actionable cost-saving suggestions in this format:

## 💰 Expense Analysis

### 📋 Current Spending Breakdown
| Category | Amount | % of Total | Status |
|----------|--------|------------|--------|
| [Category] | $[Amount] | [Percentage] | 🔴/🟡/🟢 |

### 🎯 Top Cost Reduction Opportunities
#### 1. **[Opportunity 1]**
- **Current Cost**: $[Amount]/month
- **Potential Savings**: $[Amount]/month (X%)
- **Action Steps**:
  - Step 1: [Action]
  - Step 2: [Action]
- **Difficulty**: [Easy/Medium/Hard]
- **Timeline**: [Timeframe]

#### 2. **[Opportunity 2]**
- **Current Cost**: $[Amount]/month
- **Potential Savings**: $[Amount]/month (X%)
- **Action Steps**:
  - Step 1: [Action]
  - Step 2: [Action]

### 📊 Monthly Savings Projection
- **Immediate (Month 1)**: $[Amount]
- **Short-term (3 months)**: $[Amount]
- **Long-term (12 months)**: $[Amount]

### 🛠️ Recommended Tools
- **Tool 1**: [Name] - [Purpose]
- **Tool 2**: [Name] - [Purpose]

### ⚠️ Risk Considerations
- Risk 1: [Description]
- Risk 2: [Description]`;

      const response = await axios.post(`${TEXT_API}/text`, {
        prompt,
        model: 'gpt-3.5-turbo',
        temperature: 0.6,
        max_tokens: 1500
      });

      return response.data;
    } catch (error) {
      setError(error.message);
      console.error('Expense tips error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate meeting optimization suggestions
  const optimizeMeetings = useCallback(async (meetingData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${TEXT_API}/text`, {
        prompt: `Optimize these meetings for productivity:

${JSON.stringify(meetingData, null, 2)}

Provide specific suggestions in JSON format:
{
  "analysis": {
    "totalMeetingHours": number,
    "productivePercentage": number,
    "wastedTime": number
  },
  "recommendations": [
    {
      "type": "Eliminate/Combine/Shorten",
      "meetingName": "string",
      "currentDuration": "string",
      "suggestedDuration": "string",
      "savings": "string",
      "reason": "string"
    }
  ],
  "estimatedSavings": {
    "weeklyHours": number,
    "monthlyHours": number,
    "annualValue": "string"
  },
  "bestPractices": ["string"],
  "automationOpportunities": ["string"]
}`,
        temperature: 0.5,
        max_tokens: 1000
      });

      return JSON.parse(response.data);
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isLoading,
    error,
    generateSuggestions,
    chatWithAI,
    generateProductivityReport,
    generateExpenseTips,
    optimizeMeetings,
    clearError: () => setError(null)
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};