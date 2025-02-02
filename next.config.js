/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    LASTFM_API_KEY: process.env.LASTFM_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
}

module.exports = nextConfig
