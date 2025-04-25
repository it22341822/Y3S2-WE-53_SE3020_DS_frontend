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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Verification Failed</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            
            <div className="mt-6">
              <Link href="/">
                <span className="inline-block w-full bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for your payment. Your transaction was successful.
          </p>
          
          <div className="mt-6 text-left bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Payment Details:</h3>
            
            {paymentDetails.paymentId && (
              <div className="text-sm mb-1">
                <span className="font-medium">Payment ID:</span> {paymentDetails.paymentId}
              </div>
            )}
            
            {paymentDetails.orderId && (
              <div className="text-sm mb-1">
                <span className="font-medium">Order ID:</span> {paymentDetails.orderId}
              </div>
            )}
            
            {paymentDetails.status && (
              <div className="text-sm mb-1">
                <span className="font-medium">Status:</span> {paymentDetails.status}
              </div>
            )}
            
            {paymentDetails.amount && paymentDetails.currency && (
              <div className="text-sm mb-1">
                <span className="font-medium">Amount:</span> {paymentDetails.amount.toFixed(2)} {paymentDetails.currency.toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Link href="/">
              <span className="inline-block w-full bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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