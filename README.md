<a href="https://fusebit.io?utm_source=github.com&utm_medium=referral&utm_campaign=apimeter&utm_content=readme-md-logo"><img width="200" src="https://user-images.githubusercontent.com/822369/154325005-d5576316-6cfd-4190-af02-d62024c5e659.png" alt="Fusebit"></a>

## Simple API metering for Express apps using BigQuery

This project contains an Express middleware that implements a simple HTTP API metering solution for Node.js apps based on Google Cloud's BigQuery. Read more about the background of the project in the [API Metering and Analytics for Early Stage Startups](https://fusebit.io/blog/api-metering-and-analytics-for-early-stage-startups/?utm_source=github.com&utm_medium=referral&utm_campaign=apimeter&utm_content=readme-md-body) blog post. 

If you have an Express app you want to instrument, you can do it in under 10 minutes. Let's go!

## Getting started

First, set up a BigQuery table in Google Cloud using the instructions [here][SETUP.md].

Next, create a Google Cloud service account with permissions to the BigQuery table, add API keys to that account, and export them to a JSON file using the instructions [here](https://cloud.google.com/docs/authentication/production). Set the environment variable to point to the JSON file with those credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS={full-path-to-credentials-file}
```

Next, build the module and run the sample HTTP API server:

```bash
git clone git@github.com:fusebit/apimeter.git
cd apimeter
npm install
npm run build
nmp run sample
```

**NOTE** If you have selected Google Cloud project name, dataset name, or table name different from the ones in the [setup instructions][SETUP.md], make sure to update respective names in [sample/server.js](sample/server.js) before running the sample server.

Lastly, issue some test requests to the sample HTTP API server:

```bash
curl http://localhost:3000/api/cat
curl http://localhost:3000/api/cat/123
curl http://localhost:3000/api/cat -X POST
curl http://localhost:3000/api/cat/456 -X PUT
```

Finally, head over to the Google Cloud Console for BigQuery and query the metering results:

<img width="1164" alt="image" src="https://user-images.githubusercontent.com/822369/158484521-6c4d2505-ca5b-4a21-840f-fbc7462870b7.png">

Once your metering data is in BigQuery, it is easy to create reports and visualizations over it using Google's free [Data Studio](https://datastudio.withgoogle.com/).

## Default configuration

To use the default configuration, add apimeter as the global middleware for all routes of your app:

```javascript
const app = require("express")();
const { apimeter } = require("@fusebit/apimeter");

app.use(apimeter());

```

The default configuation:
1. Logs metering data to the `apimeter` Google Cloud project, `dwh` dataset, and `apicalls` BigQuery table. 
1. Collects events in-memory and uploads them to BigQuery in batches when 500 records accumulate or every 5 seconds, whichever comes first. 
1. The service accounts credentials must be in a JSON file pointed to by the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

## Custom BigQuery dataset and table and Google Cloud projectId

You can customize the Google Cloud projectId and BigQuery dataset and table names where records will be sent:

```javascript
app.use(apimeter({
  projecId: "apimeter",
  dataset: "dwh",
  table: "apicalls",
}));
```

## Credentials

You can provide Google Cloud service account credentials programmatically instead of the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:

```javascript
const credentials = require("./credentials.json");

app.use(apimeter({
  credentials
}));
```

## Batch size and flush frequency

You can adjust the maximum batch size or the frequency of uploads to BigQuery:

```javascript
app.use(apimeter({
  maxBatchSize: 500,
  flushIntervalMilliseconds: 5000,
}));
```

## Customize metering data

You may choose to capture additional information from the request or response to store in the BigQuery table. For example, you could capture the response status code or the request processing time using this mechanism. 

**NOTE** Every field you return must have a corresponding column in the BigQuery table. 

```javascript
const { apimeter, defaultGetApiMeterRecord } = require("@fusebit/apimeter");

app.use(apimeter({
  getApiMeterRecord: (req, res) => ({
    ...defaultGetApiMeterRecord(req, res),
    issuer: req.user.jwt.iss,
    subject: req.user.jwt.sub,
    status: res.status,
  })
}));
```

## Flush callback

You can be called whenever the upload to BigQuery has finished either successfuly or with an error. Useful for logging.

```javascript
app.use(apimeter({
  onFlush: (records, error) => {
    console.log('BigQuery upload finished', records.length, error);
  }
}));
```
