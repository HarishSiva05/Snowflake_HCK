import fetch from 'node-fetch';

// You would typically store this in an environment variable
const ALPHA_VANTAGE_API_KEY = 'YOUR_API_KEY_HERE';

async function fetchNews() {
  const response = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_API_KEY}`);
  const data = await response.json();
  return data.feed;
}

async function fetchStockPerformance(symbol) {
  const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
  const data = await response.json();
  return data['Global Quote'];
}

function analyzePerformance(stockData) {
  const changePercent = parseFloat(stockData['10. change percent'].replace('%', ''));
  if (changePercent > 2) return 'high';
  if (changePercent < -2) return 'low';
  return 'neutral';
}

function findRelevantNews(news, symbol) {
  return news.filter(item => 
    item.ticker_sentiment.some(ticker => ticker.ticker === symbol)
  );
}

function generateExplanation(performance, relevantNews) {
  let explanation = `The stock performed ${performance}ly today. `;
  
  if (relevantNews.length > 0) {
    explanation += "This could be due to the following news:\n";
    relevantNews.forEach(item => {
      explanation += `- ${item.title}\n`;
    });
  } else {
    explanation += "There was no specific news that could explain this performance.";
  }
  
  return explanation;
}

async function explainStockPerformance(symbol) {
  const news = await fetchNews();
  const stockData = await fetchStockPerformance(symbol);
  
  const performance = analyzePerformance(stockData);
  const relevantNews = findRelevantNews(news, symbol);
  
  return generateExplanation(performance, relevantNews);
}

// Example usage
async function main() {
  const symbols = ['AAPL', 'GOOGL', 'MSFT'];
  
  for (const symbol of symbols) {
    console.log(`Analyzing ${symbol}...`);
    const explanation = await explainStockPerformance(symbol);
    console.log(explanation);
    console.log('---');
  }
}

main().catch(console.error);