const app = require("express")();
const { apimeter } = require("..");
const port = 3000;

const onFlush = (records, error) => {
  if (error) {
    console.log(
      `ERROR inserting ${records.length} records to Big Query`,
      error
    );
    console.log(
      "ERROR[0]",
      error.errors ? JSON.stringify(error.errors[0], null, 2) : "NA"
    );
  } else {
    console.log(`SUCCESS inserting ${records.length} records to BigQuery.`);
  }
};

app.use(
  apimeter({
    projectId: "apimeter",
    dataset: "dwh",
    table: "apicalls",
    onFlush,
  })
);

app.get("/api/cat", (req, res) => {
  res.send("Meow\n");
});

app.get("/api/cat/:id", (req, res) => {
  res.send("Meow\n");
});

app.post("/api/cat", (req, res) => {
  res.send("Meow\n");
});

app.put("/api/cat/:id", (req, res) => {
  res.send("Meow\n");
});

app.listen(port, () => {
  console.log(
    `Example app listening on port ${port}. Try testing metering with:`
  );
  console.log(`curl http://localhost:${port}/api/cat`);
  console.log(`curl http://localhost:${port}/api/cat/123`);
  console.log(`curl -X POST http://localhost:${port}/api/cat`);
  console.log(`curl -X PUT http://localhost:${port}/api/cat/123`);
});
