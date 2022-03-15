<a href="https://fusebit.io?utm_source=github.com&utm_medium=referral&utm_campaign=apimeter&utm_content=setup-md-logo"><img width="200" src="https://user-images.githubusercontent.com/822369/154325005-d5576316-6cfd-4190-af02-d62024c5e659.png" alt="Fusebit"></a>

## Setup BigQuery metering database

This project contains an Express middleware that logs HTTP API metering data to a BigQuery table. Before using the middleware, you must set up the BigQuery dataset and a table in a Google Cloud project. This walkthrough assumes you have to create the project, dataset, and table - but you can reuse an existing project or dataset if that works better for you.

## Create a Google Cloud project and Big Query dataset

Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new `apimeter` Google Cloud project to host your BigQuery dataset. Once the project is created, open it in the BigQuery section of the console and add a new dataset to it: 

<img width="464" alt="Screen Shot 2022-03-15 at 1 43 13 PM" src="https://user-images.githubusercontent.com/822369/158487464-110a6afb-c824-49cc-b28b-23449a189a90.png">

Call the dataset `dwh` and select a region for it, then click *Create dataset*:

<img width="1160" alt="Screen Shot 2022-03-15 at 1 44 20 PM" src="https://user-images.githubusercontent.com/822369/158487670-d443e231-6383-4058-9f78-3a6887642378.png">

## Create BigQuery table

Next, start creating a new table in the `dwh` dataset:

<img width="451" alt="Screen Shot 2022-03-15 at 1 44 42 PM" src="https://user-images.githubusercontent.com/822369/158487784-24bf2d89-57fd-4d05-9970-1d79fd4f5e7e.png">

Name the table `apicalls`: 

<img width="1160" alt="Screen Shot 2022-03-15 at 1 48 01 PM" src="https://user-images.githubusercontent.com/822369/158487883-b9caf1a5-9388-4ab1-ba8c-b2ccec96c799.png">

Then, specify the table schema with the columns listed below: 

<img width="1160" alt="Screen Shot 2022-03-15 at 1 49 34 PM" src="https://user-images.githubusercontent.com/822369/158487962-a8b62bd3-36cf-42b7-8aaf-cb90638cf502.png">

Set the partitioning by the `ts` column, and leave the default partitioning type of `by day`. Click *Create table* - you are all set up. 

## Create service account and generate API keys

For the middleware to write data to BigQuery, you need to create a Google Cloud service account and generate API keys for it. Follow the instructions [here](https://cloud.google.com/docs/authentication/production).
