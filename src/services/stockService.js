const STOCK_API_URL = 'https://bsfvnv4r60.execute-api.us-west-2.amazonaws.com/default/getStockQuote';

async function getStockQuote(symbol) {
  try {
    const response = await fetch(STOCK_API_URL + `?symbol=${symbol}`);
    const data = await response.json();
    return data;
  } catch (errors) {
    console.log('API Request for stock quote failed: ' + errors);
    throw errors;
  }
}

export default getStockQuote;