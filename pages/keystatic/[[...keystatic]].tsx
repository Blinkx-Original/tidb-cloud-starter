// pages/keystatic/[[...keystatic]].tsx  ← REEMPLAZAR (archivo completo)
// Admin UI de Keystatic (Pages Router) con SSR forzado para evitar prerender en build.
import type { GetServerSideProps } from 'next';
import { makePage } from '@keystatic/next/ui/pages';
import config from '../../keystatic.config';

// Forzamos SSR para que Next no intente SSG de esta ruta (evita "Invalid repo config" en build).
export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default makePage(config);
