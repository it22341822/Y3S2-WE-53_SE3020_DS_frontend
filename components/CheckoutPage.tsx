"use client"

import React, { useEffect, useState } from "react";
import {
    useStripe,
    useElements,
    PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "../lib/convertToSubcurrency";

const CheckoutPage = ({ amount }: { amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setCientSecret] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/api/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
        })
            .then((res) => res.json())
            .then((data) => setCientSecret(data.clientSecret));
    }, [amount]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message);
            setLoading(false);
            return;
        }

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `http://www.localhost:3000/payment-success?amount=${amount}`,
            },
        });

        if (error) {
            setErrorMessage(error.message);
        } else {
            setLoading(false)
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    if (!clientSecret || !stripe || !elements) {
        return (
            <div>
                <div className="loading-message">
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} >
            {clientSecret && <PaymentElement />}
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="cancelbtn"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="paybtn"
                >
                    {!loading ? `Pay ${amount}` : "Processing..."}
                </button>
            </div>
        </form>
    );
};

export default CheckoutPage;
