import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // experimental: {
  //   instrumentationHook: true,
  // },
};

export default withNextIntl(nextConfig);
