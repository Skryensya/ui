import { resolve } from "node:path";
import {
  createClassifier,
  jevBoundary,
  type ReferenceClassifier,
} from "@skryensya/reference-classifier";
import {
  createPublisher,
  gitRepository,
  githubPublisher,
} from "@skryensya/reference-publisher";
import type { ReferencePublisher } from "@skryensya/reference-model";
import { StoreError } from "./store.js";

/** Collection remains available without either external integration. */
export function createIntegrations(env: Record<string, string | undefined>): {
  classifier: ReferenceClassifier;
  publisher: ReferencePublisher;
} {
  const unavailableClassifier = async (): Promise<never> => {
    throw new StoreError(
      503,
      "Automatic classification is not configured. Classify manually or configure TYPESAFE_API_KEY.",
    );
  };
  const unavailablePublisher = async (): Promise<never> => {
    throw new StoreError(
      503,
      "GitHub publication is not configured. Collection and review remain available; configure REFERENCE_GITHUB_TOKEN, REFERENCE_GITHUB_OWNER and REFERENCE_GITHUB_REPO to publish.",
    );
  };
  const required = (name: string) => {
    const value = env[name];
    if (!value)
      throw new Error(`${name} is required when GitHub publication is enabled`);
    return value;
  };
  return {
    classifier: env.TYPESAFE_API_KEY
      ? createClassifier(
          jevBoundary(
            env.TYPESAFE_API_KEY,
            env.REFERENCE_JEV_MODEL ?? "jev-1.13",
          ),
        )
      : { classify: unavailableClassifier },
    publisher: env.REFERENCE_GITHUB_TOKEN
      ? createPublisher(
          gitRepository(resolve(env.REFERENCE_REPO_ROOT ?? "../..")),
          githubPublisher({
            owner: required("REFERENCE_GITHUB_OWNER"),
            repo: required("REFERENCE_GITHUB_REPO"),
            token: env.REFERENCE_GITHUB_TOKEN,
            base: env.REFERENCE_GITHUB_BASE ?? "main",
          }),
        )
      : {
          preview: unavailablePublisher,
          validate: unavailablePublisher,
          publish: unavailablePublisher,
          merged: unavailablePublisher,
          reconcile: unavailablePublisher,
        },
  };
}
