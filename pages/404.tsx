import NextLink from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 mt-12">
      <div className="bg-white shadow-sm border rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
        <NextLink href="/" className="btn">Go to homepage</NextLink>
      </div>
    </main>
  );
}
