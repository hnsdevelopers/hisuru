// src/components/dashboard/AISuggestions.jsx
import React, { useState, useEffect } from 'react';
import { useAI } from '../../contexts/AIContext';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  RefreshCw
} from 'lucide-react';

const AISuggestions = ({ userData }) => {
  const { generateSuggestions, isLoading } = useAI();
  const [suggestions, setSuggestions] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (userData) {
      fetchSuggestions();
    }
  }, [userData]);

  const fetchSuggestions = async () => {
    const data = await generateSuggestions(userData, 'dashboard');
    if (data && data.suggestions) {
      setSuggestions(data);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'time management':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'cost reduction':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'productivity':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'automation':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = suggestions 
    ? [...new Set(suggestions.suggestions.map(s => s.category))]
    : [];

  const filteredSuggestions = suggestions?.suggestions.filter(suggestion => 
    selectedCategory === 'all' || suggestion.category === selectedCategory
  ) || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Productivity Suggestions</h3>
            <p className="text-sm text-gray-600">Personalized recommendations to boost efficiency</p>
          </div>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary */}
      {suggestions?.summary && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">AI Analysis Summary</h4>
          </div>
          <p className="text-gray-700">{suggestions.summary}</p>
          {suggestions.confidenceScore && (
            <div className="mt-2 text-sm text-gray-600">
              Confidence score: {(suggestions.confidenceScore * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Suggestions
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryIcon(category)}
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">AI is analyzing your data...</p>
          </div>
        ) : filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  {getCategoryIcon(suggestion.category)}
                  <div>
                    <h4 className="font-bold text-gray-900">{suggestion.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                  {suggestion.impact} Impact
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                {suggestion.estimatedSavings && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Savings:</span> {suggestion.estimatedSavings}
                    </span>
                  </div>
                )}
                {suggestion.tools && suggestion.tools.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-semibold">Tools:</span> {suggestion.tools.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Steps */}
              {suggestion.actionSteps && suggestion.actionSteps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Action Steps:</h5>
                  <ul className="space-y-1">
                    {suggestion.actionSteps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No suggestions available. Try refreshing or check back later.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          💡 Suggestions powered by Pollinations.ai • Updates every 4 hours • Free forever
        </p>
      </div>
    </div>
  );
};

export default AISuggestions;