/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/podcasts/:path*.mp3',
        headers: [
          { key: 'Content-Type', value: 'audio/mpeg' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
      {
        source: '/podcasts/:path*.m4a',
        headers: [
          { key: 'Content-Type', value: 'audio/mp4' },
          { key: 'Accept-Ranges', value: 'bytes' },
        ],
      },
    ];
  },
};

export default nextConfig;
