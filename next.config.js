/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_DOMAIN: `https://localhost:44358/`,
    // API_DOMAIN: `https://gochatapi-2-0.azurewebsites.net/`,
    CLIENT_DOMAIN: `http://localhost:3000/`,
    // CLIENT_DOMAIN: `https://gochat-tau.vercel.app/`,
    CLIENT_ID: `89db7910-aae7-4b7a-9705-d704ceb8af41`,
    CLIENT_SECRET: `1hnnkiiuwq9`,
    ENCRYPTION_KEY: "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",
    ENCRYPTION_ALGORITHM: "aes-256-ctr",
  },
};
//DUMMY
module.exports = nextConfig;
