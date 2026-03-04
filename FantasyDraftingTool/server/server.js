// username: yufanghsu_db_user
// pw: W4vjg2MjSnHWEdjK
// run these commands to see if it connects: npm install mongodb -> node server.js
// success => "Pinged your deployment. You successfully connected to MongoDB!" in the terminal

import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://yufanghsu_db_user:W4vjg2MjSnHWEdjK@cluster0.72vft27.mongodb.net/?appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);