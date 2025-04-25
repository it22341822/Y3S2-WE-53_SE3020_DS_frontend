import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements,
  CardElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RGc4WB6bKZJO4VXpj8nuNoVLKQKTTVgJfp2Yzx6nUaNRCSWanWtv8hQzZcBQCkDDv8IJLBBxI4KX2vdL9XbEbQb004eHh1LTJ');

// Interface for order details
interface OrderDetails {
  orderId: string;
  totalPrice: number;
  currency: string;
}

// Cart-First Approach: Show card entry fields before creating payment intent
const CardEntryForm = ({ orderDetails, onPaymentSubmit }: { 
  orderDetails: OrderDetails, 
  onPaymentSubmit: (paymentMethod: any) => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentMethod) {
        // Pass the payment method back to the parent component
        onPaymentSubmit(paymentMethod);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Card Details</label>
        <div className="p-3 border rounded-md">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
            // Hide the postal code field
            hidePostalCode: true
          }} />
        </div>
      </div>
      
      {error && <div className="text-red-500 mt-4">{error}</div>}
      
      <div className="checkout-form button">
        <button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="flex-grow paybtn"
        >
          {isLoading ? 'Processing...' : 'Submit Card'}
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="flex-grow cancelbtn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Payment confirmation form that shows after payment intent is created
const PaymentConfirmation = ({ 
  clientSecret, 
  orderDetails 
}: { 
  clientSecret: string, 
  orderDetails: OrderDetails 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?order_id=${encodeURIComponent(orderDetails.orderId)}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Verify payment in our backend
        const verifyResponse = await fetch(`/api/verify-payment?payment_intent=${paymentIntent.id}`);
        
        if (!verifyResponse.ok) {
          throw new Error('Failed to verify payment status');
        }
        
        // Redirect to success page
        router.push(`/payment-success?payment_intent=${paymentIntent.id}&order_id=${orderDetails.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h3 className="text-lg font-medium mb-4">Confirm Your Payment</h3>
      <p className="mb-6">Your card information has been securely stored. Click below to complete your payment.</p>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="checkout-form button">
        <button 
          onClick={handleConfirmPayment}
          disabled={isLoading}
          className="flex-grow paybtn"
        >
          {isLoading ? 'Processing...' : 'Confirm Payment'}
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="flex-grow cancelbtn"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a random order ID and set demo order details
  const orderDetails: OrderDetails = {
    orderId: 'order_' + Math.random().toString(36).substring(2, 9),
    totalPrice: 123.99,
    currency: 'usd'
  };

  // This function is called after the user submits their card details
  const handlePaymentMethodCreated = async (paymentMethod: any) => {
    setIsLoading(true);
    
    try {
      // Now create the payment intent with the payment method
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderDetails.orderId,
          totalPrice: orderDetails.totalPrice,
          currency: orderDetails.currency,
          paymentMethodId: paymentMethod.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating payment intent:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Options for Stripe Elements - simple version for card entry
  // Options for Stripe Elements - simple version for card entry
  const cardOptions: StripeElementsOptions = {
    appearance: { theme: 'stripe' }
  };
  
  // Options for payment confirmation
  const confirmOptions: StripeElementsOptions = clientSecret 
    ? {
        clientSecret,
        appearance: { theme: 'stripe' },
      }
    : { appearance: { theme: 'stripe' } };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-red-500 text-center mb-4">Error: {error}</div>
          <button 
            onClick={() => setError(null)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Complete Your Order</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Order ID:</span>
            <span>{orderDetails.orderId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Total:</span>
            <span>${orderDetails.totalPrice.toFixed(2)} {orderDetails.currency.toUpperCase()}</span>
          </div>
          <hr className="my-4" />
          
          {!clientSecret ? (
            <Elements stripe={stripePromise} options={cardOptions}>
              <CardEntryForm 
                orderDetails={orderDetails} 
                onPaymentSubmit={handlePaymentMethodCreated} 
              />
            </Elements>
          ) : (
            <Elements stripe={stripePromise} options={confirmOptions}>
              <PaymentConfirmation 
                clientSecret={clientSecret} 
                orderDetails={orderDetails} 
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;