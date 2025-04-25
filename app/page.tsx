// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to BYTEats</h1>
        <p>Your favorite food delivery service</p>
        
        <div className="cta-box">
          <h2>Ready to order?</h2>
          <p>Proceed to checkout to place your order and make payment.</p>
          
          <Link href="/checkout" className="btn">
            Go to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}