// pages/robots.txt.ts
import type { GetServerSideProps } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

function generateRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain");
  res.write(generateRobots());
  res.end();
  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
