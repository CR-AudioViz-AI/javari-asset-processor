/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kteobfyferrukqeolofj.supabase.co',
      },
    ],
  },
}
module.exports = nextConfig
