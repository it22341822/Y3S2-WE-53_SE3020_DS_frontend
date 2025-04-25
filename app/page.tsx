'use client'
import "./globals.css";

import CheckoutPage from "@/components/CheckoutPage"
import convertToSubcurrency from "@/lib/convertToSubcurrency"
import {Elements} from "@stripe/react-stripe-js";
import {loadStripe} from "@stripe/stripe-js";
import { error } from "console";

if(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY=== undefined){
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY id not defined")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
  const amount = 49.48;
  return <main>
      <div>
        <h1> Sonny</h1>
        <h2>has requested: 
        <span> ${amount}</span>
        </h2>
      </div>
      <Elements stripe={stripePromise}
         options={{
          mode:"payment",
          amount:convertToSubcurrency(amount),
          currency:"usd"
         }} >
        <CheckoutPage amount={amount}/>

      </Elements>
    </main>
}
