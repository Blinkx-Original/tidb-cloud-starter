import * as React from 'react';
import Head from 'next/head';
import CommonLayout from 'components/v2/Layout';
import dynamic from 'next/dynamic';

const ProductList = dynamic(() => import('components/v2/Cards/ShoppingItemCardList'), { ssr: false });

export default function HomePage() {
  // paginación simple local
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  return (
    <

