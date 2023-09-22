const { MongoClient, ServerApiVersion } = require('mongodb');
const password = encodeURIComponent('');
const uri = `mongodb+srv://bbkloud:${password}@static-shop.scohgsx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
let _db;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    console.log('connected to db');
    _db = client.db('shop');

    // Send a ping to confirm a successful connection
  } catch (err) {
    console.log(err);
  }
}

function getDb() {
  if (_db) {
    return _db;
  }
  throw new Error('No Database Found!');
}
// run().catch(console.dir);

module.exports.mongoConnect = run;
module.exports.getDb = getDb;
