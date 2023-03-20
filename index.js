const fastify = require('fastify')();
const request = require('request');
const crypto = require('crypto');
const axios = require('axios');
const finnhub = require('finnhub');
const moment = require('moment');




const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.finnhubKey;
const finnhubClient = new finnhub.DefaultApi();

const apiKey = process.env.angelKey;

async function getQuote(symbol) {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(symbol, (error, data) => {
      if (error) {
        reject(error);
      } else {
        console.log(data); // Add this line
        resolve(data);
      }
    });
  });
}

fastify.get('/stock/hist/:symbol', async (request, reply) => {
  const symbol = request.params.symbol;

  try {
    // Retrieve historical data from Yahoo Finance
    const yahooData = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          range: 'max',
          includePrePost: false,
          interval: '1d',
          region: 'US',
          lang: 'en-US',
          includeAdjustedClose: true,
        },
      }
    );
    const yahooTimeSeriesData = yahooData.data.chart.result[0].indicators.adjclose[0].adjclose;

    // Retrieve historical data from Alpha Vantage
    const alphaData = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol,
        outputsize: 'full',
        apikey: process.env.alphaKey,
      },
    });
    const alphaTimeSeriesData = Object.values(alphaData.data['Time Series (Daily)']).map((data) =>
      parseFloat(data['4. close'])
    );

    // Retrieve historical data from Finnhub
    const finnData = await axios.get('https://finnhub.io/api/v1/stock/candle', {
      params: {
        symbol: symbol,
        resolution: 'D',
        from: moment().subtract(5, 'years').unix(),
        to: moment().unix(),
        token: process.env.finnhubKey,
      },
    });
    const finnTimeSeriesData = finnData.data.c;

    // Combine the data arrays and average the values for each data point
    const combinedData = [];
    let yahooIndex = 0;
    let alphaIndex = 0;
    let finnIndex = 0;
    while (
      yahooIndex < yahooTimeSeriesData.length ||
      alphaIndex < alphaTimeSeriesData.length ||
      finnIndex < finnTimeSeriesData.length
    ) {
      const yahooValue = yahooTimeSeriesData[yahooIndex];
      const alphaValue = alphaTimeSeriesData[alphaIndex];
      const finnValue = finnTimeSeriesData[finnIndex];
      if (yahooValue && alphaValue && finnValue) {
        combinedData.push((yahooValue + alphaValue + finnValue) / 3);
        yahooIndex++;
        alphaIndex++;
        finnIndex++;
      } else if (yahooValue && alphaValue) {
        combinedData.push((yahooValue + alphaValue) / 2);
        yahooIndex++;
        alphaIndex++;
      } else if (yahooValue && finnValue) {
        combinedData.push((yahooValue + finnValue) / 2);
        yahooIndex++;
        finnIndex++;
      } else if (alphaValue && finnValue) {
        combinedData.push((alphaValue + finnValue) / 2);
        alphaIndex++;
        finnIndex++;
      } else if (yahooValue) {
        combinedData.push(yahooValue);
        yahooIndex++;
      } else if (alphaValue) {
        combinedData.push(alphaValue);
        alphaIndex++;
      } else if (finnValue) {
        combinedData.push(finnValue);
        finnIndex++;
      }
    }

    reply.send(combinedData);
  } catch (error) {
    console.log(error);
    reply.status(500).send('Error retrieving stock data');
  }
});

fastify.get('/stock/prices/:symbol', async (request, reply) => {
  const symbol = request.params.symbol;

  try {
    const yahooData = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          range: '1d',
          includePrePost: false,
          interval: '5m',
          region: 'US',
          lang: 'en-US',
          includeAdjustedClose: true,
        },
      }
    );
    const yahooLivePrice = yahooData.data.chart.result[0].meta.regularMarketPrice;

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: process.env.alphaKey,
      },
    });

    const alphaLiveData = response.data['Global Quote'];
    if (!alphaLiveData) {
      throw new Error('Error retrieving Alpha Vantage data');
    }

    const alphaLivePrice = parseFloat(alphaLiveData['05. price']);

    const alphaData = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol,
        apikey: process.env.alphaKey,
      },
    });
    const alphaMetaData = alphaData.data['Meta Data'];
    const alphaTimeSeriesData = alphaData.data['Time Series (Daily)'];
    if (!alphaMetaData || !alphaTimeSeriesData) {
      throw new Error('Error retrieving Alpha Vantage data');
    }
    const alphaLastRefreshed = alphaMetaData['3. Last Refreshed'];
    const alphaEodPrice = alphaTimeSeriesData[alphaLastRefreshed]['4. close'];

    const endOfDayData = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          range: '1d',
          includePrePost: false,
          interval: '1d',
          region: 'US',
          lang: 'en-US',
          includeAdjustedClose: true,
        },
      }
    );
    const endOfDayPriceData = endOfDayData.data.chart.result[0].indicators.adjclose[0].adjclose;
    if (!endOfDayPriceData || endOfDayPriceData.length === 0) {
      throw new Error('Error retrieving Yahoo Finance end-of-day data');
    }

    const data = await getQuote(symbol);
    const finnLivePrice = data.c;
    const finnEodPrice = data.pc;

    const endOfDayPrice =
      (endOfDayPriceData[endOfDayPriceData.length - 1] +
        parseFloat(finnEodPrice) +
        parseFloat(alphaEodPrice)) /
      3;

    const livePrice =
      (parseFloat(yahooLivePrice) + parseFloat(finnLivePrice) + parseFloat(alphaLivePrice)) / 3;

    reply.send({livePrice, endOfDayPrice});

    // Finnhub
  } catch (error) {
    console.log(error);
    reply.status(500).send('Error retrieving stock data');
  }
});

// Define the endpoint to place a buy order
const endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/placeOrder';

fastify.post('/buy', async (req, reply) => {
  const orderDetails = req.body;
  let accessToken;
  let debug;

  accessToken =
    'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6Ik01MDY5NDE2MyIsInJvbGVzIjowLCJ1c2VydHlwZSI6IlVTRVIiLCJpYXQiOjE2NzkxMzU1ODEsImV4cCI6MTc2NTUzNTU4MX0.FeHDLd6flQiydHwyu9w4JlZ9kXp0nq8pcI-n3BrrV5Qv0vLjY9jsdlowNWcPoEfd6tt3JxhGdyvcWGhsD-tUTg';

  // Define the request options
  const requestOptions = {
    url: endpoint,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      'X-ClientLocalIP': '192.168.1.13',
      'X-ClientPublicIP': '182.70.79.125',
      'X-MACAddress': '2C-F0-5D-D0-62-AA',
      'X-PrivateKey': `${apiKey}`,
    },
    json: true,
    body: {
      variety: 'NORMAL',
      tradingsymbol: orderDetails.tradingsymbol,
      quantity: orderDetails.quantity,
      exchange: orderDetails.exchange,
      transaction_type: 'BUY',
      order_type: 'MARKET',
      producttype: 'DELIVERY',
      validity: 'DAY',
      disclosed_quantity: 0,
      tag: 'MY_ORDER',
    },
  };

  // Make the request to place the buy order
  request.post(requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
      reply.code(500).send(error);
    } else {
      console.log(body);
      reply.send(debug);
    }
  });
});

fastify.post('/sell', async (req, reply) => {
  // Get the order details from the request body
  const orderDetails = req.body;

  // Define the request options
  const requestOptions = {
    url: endpoint,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      // 'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
      // 'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
      // 'X-MACAddress': 'MAC_ADDRESS',
      'X-PrivateKey': `${apiKey}`,
    },
    json: true,
    body: {
      variety: 'NORMAL',
      tradingsymbol: orderDetails.tradingsymbol,
      quantity: orderDetails.quantity,
      exchange: orderDetails.exchange,
      transaction_type: 'SELL',
      order_type: 'MARKET',
      producttype: 'DELIVERY',
      validity: 'DAY',
      disclosed_quantity: 0,
      tag: 'MY_ORDER',
    },
  };
  // Make the request to place the buy order
  request.post(requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
      reply.code(500).send(error);
    } else {
      console.log(body);
      reply.send(body);
    }
  });
});

// Start the server
fastify.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
