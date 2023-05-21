const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmeadqe.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    // await client.connect();

    const galleryCollection = client.db("toyland").collection("gallery");
    const toyCollection = client.db("toyland").collection("toys");
    const testimonialCollection = client
      .db("toyland")
      .collection("testimonials");

    app.get("/gallery", async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/testimonials", async (req, res) => {
      const cursor = testimonialCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // ascendeing or descending

    app.get("/toys", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email };
        }
        if (req.query?.toyName) {
          query = {
            ...query,
            toyName: { $regex: req.query.toyName, $options: "i" },
          };
        }

        const sortField = req.query.sortField || "price";
        const sortOrder = req.query.sortOrder === "descending" ? -1 : 1;

        const result = await toyCollection
          .find(query)
          .sort({ [sortField]: sortOrder })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    });


    app.get("/toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      console.log(id);
      res.send(result);
    });
    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toys = req.body;
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });
    app.post("/testimonials", async (req, res) => {
      const testimonial = req.body;
      const result = await testimonialCollection.insertOne(testimonial);
      res.send(result);
    });
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;
      const toys = {
        $set: {
          toyName: updatedToys.toyName,
          toyPhoto: updatedToys.toyPhoto,
          sellerEmail: updatedToys.sellerEmail,
          sellerName: updatedToys.sellerName,
          category: updatedToys.category,
          description: updatedToys.description,
          rating: updatedToys.rating,
          price: updatedToys.price,
          availability: updatedToys.availability,
        },
      };
      const result = await toyCollection.updateOne(query, toys, options);
      res.send(result);
    });

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Toyland Treasures!!");
});

app.listen(port, () => {
  console.log(`toyland is running on port ${port}`);
});
