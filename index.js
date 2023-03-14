const fastify = require('fastify')();
const request = require('request');

const apiKey = process.env.apiKey;
const accessToken = process.env.accessToken;

// Define the endpoint to place a buy order
const endpoint = 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/placeOrder';

fastify.post('/buy', async (request, reply) => {
  // To hardcode all order details except buy and sell

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
      tradingsymbol: 'SBIN-EQ',
      quantity: 10,
      exchange: 'NSE',
      transaction_type: 'BUY',
      order_type: 'LIMIT',
      product: 'MIS',
      price: 420.0,
      validity: 'DAY',
      disclosed_quantity: 0,
      trigger_price: 0,
      squareoff: 0,
      stoploss: 0,
      trailing_stoploss: 0,
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

fastify.post('/sell', async (request, reply) => {
  const apiKey = 'YOUR_API_KEY';
  const accessToken = 'YOUR_ACCESS_TOKEN';

  // Get the order details from the request body
  const orderDetails = request.body;

  // Define the request options
  const requestOptions = {
    url: endpoint,
    headers: {
      'X-UserType': 'USER',
      'X-SourceID': 'WEB',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    json: true,
    body: {
      variety: 'NORMAL',
      tradingsymbol: orderDetails.tradingsymbol,
      quantity: orderDetails.quantity,
      exchange: 'NSE',
      transaction_type: 'SELL',
      order_type: 'LIMIT',
      product: 'MIS',
      price: orderDetails.price,
      validity: 'DAY',
      disclosed_quantity: 0,
      trigger_price: 0,
      squareoff: 0,
      stoploss: 0,
      trailing_stoploss: 0,
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
