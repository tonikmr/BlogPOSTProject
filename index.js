const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
var bodyParser = require("body-parser");
const crypto = require("crypto");

// Put these statements before you define any routes.
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
const port = 3002;

var cors = require("cors");
app.use(cors());
const { createPool } = require("mysql");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://toni:FTw18HfqXwuBvzrc@cluster0.gnb9rqy.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to se   t the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/api/getUser", async (req, res) => {
  pool.query(`select * from users`, function (err, result, fields) {
    if (err) {
      res.send(err);
    }
    if (result && result.length > 0) {
      let customer = result.map((item) => {
        return {
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
        };
      });

      return res.send(customer);
    } else {
      res.send([]);
    }
  });
});

app.post("/api/login", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    let db = await client.db("project");
    const collection = db.collection("user");
    let userArray = await collection
      .find({ email: req.body.email }, { $exists: true })
      .toArray();
    if (userArray.length == 1) {
      res.send({ isExist: true, user: userArray });
    } else {
      res.send({ isExist: false });
    }
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    let db = await client.db("project");
    const collection = db.collection("user");
    let userArray = await collection
      .find({ email: req.body.email }, { $exists: true })
      .toArray();
    if (userArray.length == 1) {
      res.send({ isExist: true });
    } else {
      let data = await collection.insertOne({
        ...req.body,
        _id: new ObjectId(),
      });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
      res.send({ ...data, isCreated: true });
    }
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/post", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    let db = await client.db("project");
    const collection = db.collection("post");
    let data = await collection.insertOne({
      ...req.body,
      date: new Date(),
      _id: new ObjectId(),
      id: crypto.randomBytes(16).toString("hex"),
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    res.send({ ...data, isCreated: true });
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/updatePost", async (req, res) => {
  try {
    const result = await (
      await client.connect()
    )
      .db("project")
      .collection("post")
      .updateOne(
        {
          id: req.body.id,
          email: req.body.email,
        },
        {
          $set: {
            post: req.body.post,
            date: new Date(),
          },
        }
      );
    res.send({ isCreated: true, result });
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get("/api/getpost", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    var email = req.query.email;
    await client.connect();
    let db = await client.db("project");
    const collection = await db.collection("post");
    let postArray = await collection
      .find({ email: email }, { $exists: true })
      .sort({ date: -1 })
      .toArray()
      .then((data) => {
        let result = data && data.length ? [...data] : [];
        res.send({ isExist: true, post: result });
      })
      .catch((err) => {
        res.sendStatus(500);
      });
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get("/api/getpostById", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    let email = req.query.email;
    let id = req.query.id;
    let data = await (await client.connect())
      .db("project")
      .collection("post")
      .findOne({
        id: id,
        email: email,
      });
    res.send(data);
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get("/api/getAllPost", async (req, res) => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    let email = req.query.email;
    let id = req.query.id;
    let data = await (await client.connect())
      .db("project")
      .collection("post")
      .find()
      .sort({ date: -1 })
      .toArray();
    res.send(data);
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.delete("/api/deletepost", async (req, res) => {
  try {
    const result = await (await client.connect())
      .db("project")
      .collection("post")
      .deleteOne({
        id: req.body.id,
        email: req.body.email,
      });
    res.send({ isDeleted: true, result });
  } catch (error) {
    res.send(error);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get("/", (req, res) => {
  res.send("Hello World, from express");
});

app.listen(port, () =>
  console.log(`Hello world app listening on port ${port}!`)
);
