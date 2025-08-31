/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil'
      });
    }
    return config;
  },
  // Configuración adicional para evitar errores de webpack
  transpilePackages: ['qrcode'],
  compiler: {
    removeConsole: false,
  },
}

module.exports = nextConfig
