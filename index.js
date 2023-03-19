const fastify = require('fastify')();
const request = require('request');
const crypto = require('crypto');
const axios = require('axios');
const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = 'cgbb04pr01ql0m8rmongcgbb04pr01ql0m8rmoo0';
const finnhubClient = new finnhub.DefaultApi();

const apiKey = 'YqVt3xq7';

fastify.get('/:symbol', async (request, reply) => {
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

    const alphaData = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol,
        apikey: '1VN2CUGWAIJ24W28',
      },
    });
    const alphaMetaData = alphaData.data['Meta Data'];
    const alphaTimeSeriesData = alphaData.data['Time Series (Daily)'];
    if (!alphaMetaData || !alphaTimeSeriesData) {
      throw new Error('Error retrieving Alpha Vantage data');
    }
    const alphaLastRefreshed = alphaMetaData['3. Last Refreshed'];
    const alphaLivePrice = alphaTimeSeriesData[alphaLastRefreshed]['4. close'];

    const intradayData = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: '5min',
        apikey: '1VN2CUGWAIJ24W28',
      },
    });
    const intradayMetaData = intradayData.data['Meta Data'];
    const intradayTimeSeriesData = intradayData.data['Time Series (5min)'];
    if (!intradayMetaData || !intradayTimeSeriesData) {
      throw new Error('Error retrieving Alpha Vantage intraday data');
    }
    const intradayLastRefreshed = intradayMetaData['3. Last Refreshed'];
    const intradayLivePrice = intradayTimeSeriesData[intradayLastRefreshed]['4. close'];

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

    let finnLivePrice;
    let finnEODPrice;

    // Live prices
    finnhubClient.quote('AAPL', (error, data, response) => {
      if (error) {
        console.error(error);
      } else {
        finnLivePrice = data.c;
        finnEODPrice = data.pc;
        console.log('Live price:', finnLivePrice);
        console.log('EOD price:', finnEODPrice);
      }
    });

    const endOfDayPrice =
      (endOfDayPriceData[endOfDayPriceData.length - 1] +
        parseFloat(alphaLastRefreshed) +
        parseFloat(intradayLastRefreshed) +
        parseFloat(finnEODPrice)) /
      4;

    const livePrice =
      (parseFloat(yahooLivePrice) +
        parseFloat(alphaLivePrice) +
        parseFloat(intradayLivePrice) +
        parseFloat(finnLivePrice)) /
      4;

    reply.send({
      livePrice: livePrice,
      endOfDayPrice: endOfDayPrice,
      finnLive: finnLivePrice,
      finnEod: finnEODPrice,
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send('Error retrieving stock data');
  }
});

async function fetchPrices(api, symbol) {
  try {
    const {
      url,
      params = {},
      headers = {},
      livePricePath,
      endOfDayPricePath,
      endOfDayParams,
      transformResponse,
    } = api;

    // Build the request URL
    let requestUrl = url;
    if (livePricePath) {
      requestUrl += `/${symbol}?fields=${livePricePath}`;
    } else {
      Object.keys(params).forEach((key, index) => {
        requestUrl += `${index === 0 ? '?' : '&'}${key}=${params[key]}`;
      });
    }

    // Fetch the live price
    const livePriceResponse = await axios.get(requestUrl, {headers});
    const livePriceData = livePriceResponse.data;
    const livePrice = livePricePath
      ? eval(`livePriceData.${livePricePath}`)
      : eval(transformResponse)(livePriceData);

    // Fetch the end-of-day price
    let endOfDayPrice;
    if (endOfDayPricePath) {
      const endOfDayRequestUrl = `${url}/${symbol}/history`;
      const endOfDayParamsWithSymbol = {...endOfDayParams, symbol};
      const endOfDayResponse = await axios.get(endOfDayRequestUrl, {
        headers,
        params: endOfDayParamsWithSymbol,
      });
      const endOfDayData = endOfDayResponse.data;
      endOfDayPrice = eval(`endOfDayData.${endOfDayPricePath}`);
    }

    return {api: api.name, livePrice, endOfDayPrice};
  } catch (error) {
    console.error(`Error fetching prices from ${api.name}:`, error.message);
    return {api: api.name, error: error.message};
  }
}

// Define the endpoint to place a buy order
const endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/placeOrder';

fastify.post('/buy', async (req, reply) => {
  const orderDetails = req.body;
  let accessToken;
  let debug;

  const url = 'https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateTokens';

  function generateRefreshToken() {
    const buffer = crypto.randomBytes(64);
    return buffer.toString('hex');
  }

  const refreshToken = generateRefreshToken();

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

// fastify.get('/:symbol', async (request, reply) => {
//   const symbol = request.params.symbol.toUpperCase();
//   const promises = APIS.map((api) => fetchPrices(api, symbol));
//   const responses = await Promise.all(promises);
//   const validResponses = responses.filter((response) => !response.error);

//   if (validResponses.length === 0) {
//     reply.status(400).send({message: `Unable to fetch prices for symbol ${symbol}`});
//     return;
//   }

//   const totalLivePrice = validResponses.reduce((total, response) => total + response.livePrice, 0);
//   const totalEndOfDayPrice = validResponses.reduce(
//     (total, response) => total + (response.endOfDayPrice || 0),
//     0
//   );
//   const averageLivePrice = totalLivePrice / validResponses.length;
//   const averageEndOfDayPrice = totalEndOfDayPrice / validResponses.length;
//   const livePrices = validResponses.map((response) => response.livePrice);

//   reply.send({
//     symbol,
//     averageLivePrice,
//     averageEndOfDayPrice,
//     livePrices,
//     validResponses,
//     invalidResponses: responses.filter((response) => response.error),
//   });
// });

// Start the server
fastify.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
