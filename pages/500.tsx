import NextLink from 'next/link';

export default function ServerError() {
  return (
    <main className="max-w-3xl mx-auto px-4 mt-12">
      <div className="bg-white shadow-sm border rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600">Please try again in a moment.</p>
        <NextLink href="/" className="btn mt-6">Go to homepage</NextLink>
      </div>
    </main>
  );
}
