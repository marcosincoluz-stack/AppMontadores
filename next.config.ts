import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const mkPWA = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ["/custom-sw.js"],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default mkPWA(nextConfig);
