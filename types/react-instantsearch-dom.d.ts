// Tipos mínimos para compilar con react-instantsearch-dom v6
declare module 'react-instantsearch-dom' {
  export const InstantSearch: any;
  export const SearchBox: any;
  export const Hits: any;
  export const Highlight: any;
  export const RefinementList: any;
  export const Pagination: any;
  export const Configure: any;
  export const Stats: any;
  export const Index: any;

  // 👉 añadidos para tu código:
  export const SortBy: any;
  export const InfiniteHits: any;

  // Conector que a veces usan los ejemplos
  export function connectStateResults<TProps = any>(...args: any[]): any;
}
