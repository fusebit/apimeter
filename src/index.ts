import { BigQuery } from "@google-cloud/bigquery";

export interface IApiMeterRecord {
  ts: string;
  action: string;
  resource: string;
  [key: string]: string;
}

export interface IBigQueryApiMeterRecord {
  insertId: string;
  json: IApiMeterRecord;
}

export type GetApiMeterRecord = (req: any, res: any) => IApiMeterRecord;

export type OnFlush = (
  records: IBigQueryApiMeterRecord[],
  error?: Error
) => void;

export interface IBigQueryOptions {
  dataset: string;
  table: string;
  credentials?: any;
}

export interface IApiMeterOptions {
  maxBatchSize?: number;
  flushIntervalMilliseconds?: number;
  getApiMeterRecord?: GetApiMeterRecord;
  onFlush?: OnFlush;
  dataset?: string;
  table?: string;
  projectId?: string;
  credentials?: any;
}

export const defaultGetApiMeterRecord: GetApiMeterRecord = (req, res) => ({
  ts: new Date().toISOString(),
  action: req.method,
  resource: req.path,
  userAgent: req.headers["user-agent"],
});

const defaultApiMeterOptions: IApiMeterOptions = {
  maxBatchSize: 500,
  flushIntervalMilliseconds: 5000,
  getApiMeterRecord: defaultGetApiMeterRecord,
  dataset: "dwh",
  table: "apicalls",
};

export function apimeter(options?: IApiMeterOptions) {
  const effectiveOptions = { ...defaultApiMeterOptions, ...options };
  if (
    !effectiveOptions.credentials &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    throw new Error(
      "Google Cloud credentials must be specified as options.credentials or via the GOOGLE_APPLICATION_CREDENTIALS environment variable."
    );
  }
  if (
    !effectiveOptions.projectId &&
    (!effectiveOptions.credentials || !effectiveOptions.credentials.project_id)
  ) {
    throw new Error(
      "Google Cloud projectId must be specified through options.projectId or options.credentials must be specified."
    );
  }

  const bq = new BigQuery({
    projectId:
      effectiveOptions.projectId || effectiveOptions.credentials.project_id,
    credentials: effectiveOptions.credentials,
  });

  let records: {
    json: IApiMeterRecord;
    insertId: string;
  }[] = [];

  const flushOne = async () => {
    if (records.length === 0) {
      return;
    }
    const toFlush = records;
    records = [];
    let error: Error | undefined = undefined;
    try {
      await bq
        .dataset(effectiveOptions.dataset as string)
        .table(effectiveOptions.table as string)
        .insert(toFlush, { raw: true });
    } catch (e) {
      error = e;
      if (!effectiveOptions.onFlush) {
        console.log(
          `ERROR inserting ${toFlush.length} records to ${effectiveOptions.dataset}.${effectiveOptions.table} table in Big Query`,
          e
        );
        console.log(
          "ERROR[0]",
          e.errors ? JSON.stringify(e.errors[0], null, 2) : "NA"
        );
      }
    } finally {
      effectiveOptions.onFlush && effectiveOptions.onFlush(toFlush, error);
    }
  };

  setInterval(flushOne, effectiveOptions.flushIntervalMilliseconds).unref();

  return function apimeterMiddleware(req: any, res: any, next: any) {
    res.once("close", () => {
      const json = (effectiveOptions.getApiMeterRecord as GetApiMeterRecord)(
        req,
        res
      );
      records.push({
        json,
        insertId: `${json.ts}/${json.action}/${json.resource}`,
      });
      if (records.length >= (effectiveOptions.maxBatchSize as number)) {
        flushOne();
      }
    });
    next();
  };
}
