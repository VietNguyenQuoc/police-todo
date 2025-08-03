/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  productionBrowserSourceMaps: true,
  env: {
    CUSTOM_KEY: "my-value",
  },
};

module.exports = nextConfig;
