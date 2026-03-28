export type AppEnv = "demo" | "staging" | "production";

export const ENV: AppEnv =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) || "demo";

export const IS_DEMO = ENV === "demo";
export const IS_STAGING = ENV === "staging";
export const IS_PRODUCTION = ENV === "production";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const DEMO_BANNER_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_BANNER === "true" || IS_DEMO;
