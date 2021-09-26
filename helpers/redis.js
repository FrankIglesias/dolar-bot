const moment = require('moment');
const redis = require('redis');

const client = redis.createClient({
  host: process.env.NODE_REDIS_HOST,
  port: process.env.NODE_REDIS_PORT,
  password: process.env.NODE_REDIS_PASSWORD,
});

exports.setNewEntry = (value) =>
  client.set(`dolar-blue__${moment().format('DD-MM-YYYY')}`, value);

exports.getPreviuosEntry = () => {
  return new Promise((resolve) => {
    const pastDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
    client.get(`dolar-blue__${pastDate}`, (_, reply) => resolve(reply));
  });
};

exports.setClient = (chatID) => () => {
  client.set(`dolar-blue-client__${chatID}`, value);
};

exports.unsetClient = (chatID) => () => {
  client.del(`dolar-blue-client__${chatID}`);
}

exports.getClients = () => {
  return new Promise((resolve) => {
    client.keys('dolar-blue-client__*', (_, reply) => resolve(reply));
  });
}
