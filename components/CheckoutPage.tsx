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
    <form onSubmit={handleSubmit} >
      <div>
        <label >Card Details</label>
        <div>
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
      
      {error && <div >{error}</div>}
      
      <div className="button-group">
        <button className="btn btn-primary"
          type="submit" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? 'Processing...' : 'Submit Card'}
        </button>
        <button className="btn btn-secondary"
          type="button"
          onClick={() => window.location.href = '/'}
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
    <div className="confirmation-box">
      <h3 >Confirm Your Payment</h3>
      <p >Your card information has been securely stored. Click below to complete your payment.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="button-group">
        <button className="btn btn-primary"
          onClick={handleConfirmPayment}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm Payment'}
        </button>
        <button className="btn btn-secondary"
          onClick={() => window.location.href = '/'}
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
      <div className="error-state" >
        <div >
          <div className="error-message">Error: {error}</div>
          <button className="btn btn-primary"
            onClick={() => setError(null)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div >
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1 >Complete Your Order</h1>
        
        <div className="order-summary" >
          <h2>Order Summary</h2>
          <div >
            <span>Order ID:</span>
            <span>{orderDetails.orderId}</span>
          </div>
          <div >
            <span>Total:</span>
            <span>${orderDetails.totalPrice.toFixed(2)} {orderDetails.currency.toUpperCase()}</span>
          </div>
          <hr/>
          
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