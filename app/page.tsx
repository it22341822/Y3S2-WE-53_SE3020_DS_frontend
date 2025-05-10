// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1> Ready to order from BYTEats ? </h1>
        <h3>Your favorite food delivery service</h3>
        
        <div className="cta-box">
          <p>Proceed to checkout to place your order and make payment.</p>
          
          <Link href="/checkout" className="btn">
            Go to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}