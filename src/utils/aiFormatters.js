// src/utils/aiFormatters.js

export const markdownRegex = {
  // Headers
  h1: /^#\s+(.+)$/gm,
  h2: /^##\s+(.+)$/gm,
  h3: /^###\s+(.+)$/gm,
  h4: /^####\s+(.+)$/gm,
  
  // Lists
  unorderedList: /^-\s+(.+)$/gm,
  orderedList: /^\d+\.\s+(.+)$/gm,
  taskList: /^-\s+\[(\s|x)\]\s+(.+)$/gm,
  
  // Tables
  table: /^\|(.+)\|$/gm,
  tableRow: /\|([^|]+)\|/g,
  tableHeader: /^\|(.+)\|\n\|[-:|]+\|/gm,
  
  // Code blocks
  codeBlock: /```([\s\S]*?)```/g,
  inlineCode: /`([^`]+)`/g,
  
  // Text formatting
  bold: /\*\*([^*]+)\*\*/g,
  italic: /\*([^*]+)\*/g,
  boldItalic: /\*\*\*([^*]+)\*\*\*/g,
  strikethrough: /~~([^~]+)~~/g,
  
  // Links and images
  link: /\[([^\]]+)\]\(([^)]+)\)/g,
  image: /!\[([^\]]*)\]\(([^)]+)\)/g,
  
  // Blocks and quotes
  blockquote: /^>\s+(.+)$/gm,
  horizontalRule: /^---$/gm,
  
  // Special patterns for AI responses
  insight: /^🎯\s+(.+)$/gm,
  recommendation: /^💡\s+(.+)$/gm,
  warning: /^⚠️\s+(.+)$/gm,
  success: /^✅\s+(.+)$/gm,
  metric: /^📊\s+(.+)$/gm,
  cost: /^💰\s+(.+)$/gm,
  time: /^⏰\s+(.+)$/gm,
  
  // Arrays and data structures
  jsonArray: /\[\s*([\s\S]*?)\s*\]/g,
  jsonObject: /\{\s*([\s\S]*?)\s*\}/g,
  keyValue: /"([^"]+)":\s*("[^"]*"|\d+|true|false|null)/g,
  
  // Productivity specific patterns
  impactLevel: /Impact:\s*(High|Medium|Low)/gi,
  savingsAmount: /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
  timeAmount: /(\d+)\s*(hours?|days?|weeks?|months?)/gi,
  percentage: /(\d+(?:\.\d+)?%)/g,
  
  // Priority indicators
  priority: /Priority:\s*(\d+|High|Medium|Low)/gi,
  difficulty: /Difficulty:\s*(Easy|Medium|Hard)/gi,
  
  // Action items
  actionItem: /^(\[ \]|\[x\])\s+(.+)$/gm,
  step: /^(\d+\.|\-|\*)\s+(.+)$/gm,
  
  // Metrics and KPIs
  kpi: /([A-Z][A-Za-z\s]+):\s*([\d,]+(?:\.\d+)?)(?:\s*\(([^)]+)\))?/g,
  
  // Date patterns
  date: /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g,
  timeRange: /(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi,
};

export const formatAIResponse = (text) => {
  if (!text) return '';
  
  let formatted = text;
  
  // Replace markdown with styled HTML components
  formatted = formatted.replace(markdownRegex.h1, '<h1 class="text-3xl font-bold text-gray-900 mt-6 mb-4">$1</h1>');
  formatted = formatted.replace(markdownRegex.h2, '<h2 class="text-2xl font-bold text-gray-800 mt-5 mb-3">$1</h2>');
  formatted = formatted.replace(markdownRegex.h3, '<h3 class="text-xl font-semibold text-gray-700 mt-4 mb-2">$1</h3>');
  
  // Lists
  formatted = formatted.replace(markdownRegex.unorderedList, '<li class="ml-4 mb-2">• $1</li>');
  formatted = formatted.replace(markdownRegex.orderedList, '<li class="ml-4 mb-2">$1</li>');
  formatted = formatted.replace(markdownRegex.taskList, (match, checked, content) => {
    const isChecked = checked === 'x';
    return `<li class="flex items-center ml-4 mb-2">
      <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-2" disabled />
      <span>${content}</span>
    </li>`;
  });
  
  // Format special patterns
  formatted = formatted.replace(markdownRegex.insight, '<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-3">🎯 $1</div>');
  formatted = formatted.replace(markdownRegex.recommendation, '<div class="bg-blue-50 border-l-4 border-blue-400 p-4 my-3">💡 $1</div>');
  formatted = formatted.replace(markdownRegex.warning, '<div class="bg-red-50 border-l-4 border-red-400 p-4 my-3">⚠️ $1</div>');
  formatted = formatted.replace(markdownRegex.success, '<div class="bg-green-50 border-l-4 border-green-400 p-4 my-3">✅ $1</div>');
  
  // Format metrics
  formatted = formatted.replace(markdownRegex.metric, '<div class="font-semibold text-gray-700 mt-2">📊 $1</div>');
  formatted = formatted.replace(markdownRegex.cost, '<div class="font-semibold text-green-600 mt-2">💰 $1</div>');
  formatted = formatted.replace(markdownRegex.time, '<div class="font-semibold text-blue-600 mt-2">⏰ $1</div>');
  
  // Format tables
  if (markdownRegex.tableHeader.test(formatted)) {
    formatted = formatted.replace(markdownRegex.tableHeader, (match, headers) => {
      const headerCells = headers.split('|').map(cell => 
        `<th class="px-4 py-2 text-left font-semibold text-gray-700">${cell.trim()}</th>`
      ).join('');
      
      return `<table class="min-w-full divide-y divide-gray-200 my-4">
        <thead class="bg-gray-50">
          <tr>${headerCells}</tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">`;
    });
    
    formatted = formatted.replace(/\|\n\|/g, '</tr></tbody></table>');
    formatted = formatted.replace(markdownRegex.tableRow, (match, cells) => {
      const rowCells = cells.split('|').map(cell => 
        `<td class="px-4 py-2 text-gray-600">${cell.trim()}</td>`
      ).join('');
      return `<tr>${rowCells}</tr>`;
    });
  }
  
  // Format bold and italic
  formatted = formatted.replace(markdownRegex.bold, '<strong class="font-bold">$1</strong>');
  formatted = formatted.replace(markdownRegex.italic, '<em class="italic">$1</em>');
  
  return formatted;
};

export const extractJSONFromText = (text) => {
  try {
    // Try direct JSON parse first
    return JSON.parse(text);
  } catch {
    // Extract JSON from text using regex
    const jsonMatch = text.match(markdownRegex.jsonObject);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // If still fails, try to clean and parse
        const cleaned = jsonMatch[0]
          .replace(/\n/g, '')
          .replace(/\t/g, '')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        return JSON.parse(cleaned);
      }
    }
  }
  return null;
};

export const parseAIResponse = (response) => {
  const patterns = {
    suggestions: /## Suggestions\s*([\s\S]*?)(?=\n##|\n#|$)/,
    recommendations: /## Recommendations\s*([\s\S]*?)(?=\n##|\n#|$)/,
    actionItems: /## Action Items\s*([\s\S]*?)(?=\n##|\n#|$)/,
    metrics: /## Metrics\s*([\s\S]*?)(?=\n##|\n#|$)/,
    tables: /\|([^|\n]+)\|([^|\n]+)\|([^|\n]+)\|/g,
    lists: /^\s*[-*]\s+(.+)$/gm,
    numberedLists: /^\s*\d+\.\s+(.+)$/gm,
    keyPoints: /🎯\s+(.+)$/gm,
    warnings: /⚠️\s+(.+)$/gm,
    tips: /💡\s+(.+)$/gm
  };

  const result = {};
  
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = response.match(pattern);
    if (match) {
      result[key] = key.includes('table') || key.includes('list') 
        ? match 
        : match[1].trim();
    }
  });
  
  return result;
};