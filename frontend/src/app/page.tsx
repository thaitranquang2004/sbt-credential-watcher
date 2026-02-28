import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Credential Core</h1>
      <p className="text-xl text-gray-600 mb-8">
        Blockchain-based Credential Management System
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Admin Portal
        </Link>
        <Link
          href="/student"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Student Portal
        </Link>
        <Link
          href="/verify/demo"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Public Verify
        </Link>
      </div>
    </main>
  );
}
