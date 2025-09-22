import SearchResults from '@/components/SearchResults';

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';
  return (
    <>
      <h1 style={{ marginBottom: 12 }}>Search</h1>
      <SearchResults initialQuery={q} />
    </>
  );
}
