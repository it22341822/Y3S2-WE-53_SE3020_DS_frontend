// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Payment Processing App',
  description: 'A simple payment processing application using Stripe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">BYTEats Payment System</h1>
          </div>
        </header>
        <main className="container mx-auto py-8 px-4">{children}</main>
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} BYTEats. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}