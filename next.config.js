/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  env: {
    LASTFM_API_KEY: process.env.LASTFM_API_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },
}

console.log('Loading next.config.js with env:', {
  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
})

module.exports = nextConfig
