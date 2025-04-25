/**
 * Converts a price from dollars to cents for Stripe API
 * @param dollars Price in dollars (e.g. 10.99)
 * @returns Price in cents (e.g. 1099)
 */
export const dollarsToCents = (dollars: number): number => {
    return Math.round(dollars * 100);
  };
  
  /**
   * Converts a price from cents to dollars
   * @param cents Price in cents (e.g. 1099)
   * @returns Price in dollars (e.g. 10.99)
   */
  export const centsToDollars = (cents: number): number => {
    return cents / 100;
  };
  
  /**
   * Formats a price as a currency string
   * @param amount Price amount
   * @param currency Currency code (e.g. 'usd')
   * @returns Formatted currency string (e.g. $10.99)
   */
  export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };
  
  export default {
    dollarsToCents,
    centsToDollars,
    formatCurrency,
  };