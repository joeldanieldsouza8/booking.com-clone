/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //   domains: ['static1.squarespace.com', 'r-xx.bstatic.com', 'cf.bstatic.com'], // Add the domain here
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static1.squarespace.com",
      },
      {
        protocol: "https",
        hostname: "r-xx.bstatic.com",
      },
      {
        protocol: "https",
        hostname: "cf.bstatic.com",
      },
    ]
  }
};

export default nextConfig;
