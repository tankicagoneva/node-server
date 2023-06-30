import env from env;

var http = require("http");
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "MONGO_CONECTION_URL";
let client;
async function main() {
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await listDatabases(client);
    const note = {
      title: "Shopping list",
      description: "Steak, Pizza, Fries",
    };
    await addTodoNote(client, note);

    // const food = {
    //   type: "Fruit and vegetables",
    //   description:
    //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    // };

    // await addFood(client, food);

    const notes = await client.db("notes").collection("todos").find().toArray();
    console.log(notes);

    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
const dbName = "notes";
async function addFood(client, foodType) {
  const result = await client
    .db("food")
    .collection("foodType")
    .insertOne(foodType);
  console.log(`New note created with id ${result.insertedId}`);
}

async function addTodoNote(client, todoNote) {
  const result = await client
    .db("notes")
    .collection("todos")
    .insertOne(todoNote);
  console.log(`New note created with id ${result.insertedId}`);
}

async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  console.log(databasesList);
}

main();

http
  .createServer(async function (req, res) {
    const client = new MongoClient(uri);

    if (req.url == "/notes") {
      try {
        await client.connect();
        console.log("Connection success!");
        const notesCollection = client.db(dbName).collection("todos");
        const notes = await notesCollection.find().toArray();
        const formattedNotes = notes.map(
          (note) => `Title: ${note.title}\nDescription: ${note.description}`,
        );
        const responseContent = formattedNotes.join("\n");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(responseContent);
      } catch (err) {
        console.error("Error retrieving notes:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      } finally {
        await client.close();
      }
    }
  })
  .listen(8080);

console.log("Server is listening on port 8080....");
