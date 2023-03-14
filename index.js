const fastify = require('fastify')();
const request = require('request');
const crypto = require('crypto');

const apiKey = 'msGbOYON ';

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

  const requestTokenOptions = {
    url: url,
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
      refreshToken: refreshToken,
    },
  };

  request.post(requestTokenOptions, (error, response, data) => {
    if (error) {
      console.error(error);
    } else {
      console.log(data);
      debug = data;
      accessToken = data?.jwtToken;
    }
  });

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
