import { createServer } from "node:http";
import { resolve } from "node:path";
import {
  postgresStore,
  memoryStore,
  filesystemAssets,
  s3Assets,
  ReferenceService,
  createReferenceApi,
} from "./index.js";
import { createIntegrations } from "./integrations.js";
const env = process.env;
const required = (name: string) => {
  const value = env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const { classifier, classifyOnCapture, publisher } = createIntegrations(env);
const store =
  env.REFERENCE_STORE === "memory"
    ? memoryStore()
    : await postgresStore(required("REFERENCE_DATABASE_URL"));
const assets = env.REFERENCE_S3_ENDPOINT
  ? s3Assets({
      endpoint: env.REFERENCE_S3_ENDPOINT,
      bucket: required("REFERENCE_S3_BUCKET"),
      region: env.REFERENCE_S3_REGION ?? "auto",
      accessKeyId: required("REFERENCE_S3_ACCESS_KEY_ID"),
      secretAccessKey: required("REFERENCE_S3_SECRET_ACCESS_KEY"),
    })
  : filesystemAssets(
      resolve(env.REFERENCE_ASSETS_DIR ?? "../../tmp/reference-assets"),
    );
const service = new ReferenceService(store, assets, classifier, publisher, {
  classifyOnCapture,
});
const server = createServer(
  createReferenceApi(service, {
    token: required("REFERENCE_API_TOKEN"),
    origins: (env.REFERENCE_ALLOWED_ORIGINS ?? "http://localhost:5174")
      .split(",")
      .map((s) => s.trim()),
  }),
);
server.listen(
  Number(env.REFERENCE_PORT ?? 4318),
  env.REFERENCE_HOST ?? "127.0.0.1",
  () => console.log("Reference Server listening"),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    server.close(() => {
      void store.close().then(() => process.exit());
    });
    server.closeAllConnections();
  });
