export const wagmiConfig = {
  chains: [
    {
      id: 80001,
      name: 'Polygon Amoy',
      network: 'amoy',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'] },
        public: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology'] },
      },
      blockExplorers: {
        default: { name: 'Polygonscan', url: 'https://amoy.polygonscan.com' },
      },
    },
  ],
  connectors: [],
  transports: {},
};

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
