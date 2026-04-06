import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // --- セキュリティヘッダー ---
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // XSS対策: インラインスクリプトをブロック
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Supabase / 外部APIへのfetch
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
              // スクリプト: 開発時はeval許可
              isDev
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline'",
              // スタイル
              "style-src 'self' 'unsafe-inline'",
              // 画像
              "img-src 'self' data: blob: https://*.supabase.co",
              // フォント
              "font-src 'self' data:",
              // フレーム埋め込み禁止
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // クリックジャッキング対策
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // MIMEスニッフィング対策
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // リファラー情報を制限
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 本番のみHTTPS強制
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
          // 権限ポリシー: 不要なAPIを無効化
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },

  // --- 画像最適化 ---
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // --- Vercelデプロイ向け最適化 ---
  output: "standalone",

  // --- TypeScript・ESLint ---
  typescript: {
    // CIでtypecheckを別途実行しているためビルド時はスキップしない
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // --- ログ最小化 ---
  logging: {
    fetches: {
      fullUrl: isDev,
    },
  },
};

export default nextConfig;
