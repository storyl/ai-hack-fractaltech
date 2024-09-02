/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socketio',
      },
    ]
  },
};

export default nextConfig;
