/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  env: {
    LASTFM_API_KEY: process.env.LASTFM_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
