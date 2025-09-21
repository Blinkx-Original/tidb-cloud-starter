// pages/index.tsx  ← REEMPLAZAR (archivo completo)
import * as React from "react";
import Head from "next/head";
import CommonLayout from "components/v2/Layout";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import CategoryGrid from "components/v2/CategoryGrid";
import fs from "fs";
import path from "path";

const ProductList = dynamic(
  () => import("components/v2/Cards/ShoppingItemCardList"),
  { ssr: false }
);

type Site = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroText: string | null;
};

type Props = {
  site: Site;
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "content", "site", "index.json");
  let site: Site = {
    heroTitle: null,
    heroSubtitle: null,
    heroText: null,
  };

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw || "{}");
    site = {
      heroTitle: json.heroTitle ?? null,
      heroSubtitle: json.heroSubtitle ?? null,
      heroText: json.heroText ?? null,
    };
  } catch {
    // If the file doesn't exist yet, render with defaults.
  }

  return { props: { site } };
}

export default function HomePage({ site }: Props) {
  const [page, set]()
