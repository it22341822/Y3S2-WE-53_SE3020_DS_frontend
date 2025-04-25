export default async function PaymentSuccess({
    searchParams,
}: {
    searchParams: { amount: string };
}) {
    const { amount } = searchParams;

    return (
        <main>
            <div className="success-container">
                <div className="success-icon">✓</div>
                <h1>Thankyou!</h1>
                <h2>Your payment has been received successfully.</h2>
                <div>${amount}</div>
                <a href="#" className="go-home-button">
                    Go Home
                </a>
            </div>
        </main>
    );
}