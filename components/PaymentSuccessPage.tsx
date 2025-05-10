'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentDetails {
  paymentId?: string;
  orderId?: string;
  status?: string;
  amount?: number;
  currency?: string;
}

const PaymentSuccessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the payment_intent from URL
        const payment_intent = searchParams.get('payment_intent');
        const order_id = searchParams.get('order_id');
        
        if (!payment_intent) {
          setError('Payment information is missing');
          setIsLoading(false);
          return;
        }

        // Call our API to verify the payment status in our backend
        const response = await fetch(`/api/verify-payment?payment_intent=${payment_intent}`);
        
        if (!response.ok) {
          throw new Error('Failed to verify payment status');
        }
        
        const data = await response.json();
        
        // Clear payment session from storage since payment is complete
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('paymentSession');
        }
        
        setPaymentDetails({
          paymentId: payment_intent,
          orderId: order_id || 'Unknown order',
          status: data.status,
          amount: data.amount ? data.amount / 100 : undefined, // Convert from cents to dollars
          currency: data.currency
        });
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Error verifying payment status. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div >
          <div className="error-state">
            <div className="error-icon">
              <svg  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <h2 className="error-title">Payment Verification Failed</h2>
            <p className="error-message">{error}</p>
            
            <div>
              <Link href="/" className="home-link">
                <span>
                  Return to Home
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <div>
        <div className="success-container">
          <div className="success-icon">
            <svg  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="success-title">Payment Successful!</h2>
          <p className="success-message">
            Thank you for your payment. Your transaction was successful.
          </p>
          
          <div className="payment-details" >
            <h3 >Payment Details:</h3>
            
            {paymentDetails.paymentId && (
              <div className="detail-row">
                <span>Payment ID:</span> {paymentDetails.paymentId}
              </div>
            )}
            
            {paymentDetails.orderId && (
              <div className="detail-row">
                <span >Order ID:</span> {paymentDetails.orderId}
              </div>
            )}
            
            {paymentDetails.status && (
              <div className="detail-row">
                <span >Status:</span> {paymentDetails.status}
              </div>
            )}
            
            {paymentDetails.amount && paymentDetails.currency && (
              <div className="detail-row" >
                <span >Amount:</span> {paymentDetails.amount.toFixed(2)} {paymentDetails.currency.toUpperCase()}
              </div>
            )}
          </div>
          
          <div >
            <Link href="/" className="home-link">
              <span >
                Return to Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;