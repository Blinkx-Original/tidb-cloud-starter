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
  export function connectStateResults<TProps = any>(...args: any[]): any;
}
