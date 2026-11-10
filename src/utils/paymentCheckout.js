/**
 * Provider checkout adapters. NONE is registered, because no payment provider has been selected.
 * When one is chosen, register its adapter once (for example in main.jsx):
 *   registerCheckoutAdapter("razorpay", ({ checkout, onSuccess, onDismiss }) => { ...open the provider's checkout widget with
 *     checkout.orderId / checkout.keyId, then call onSuccess({ gatewayPaymentId, signature }) from the widget callback... });
 * onSuccess only REPORTS the result: the server verifies it with the provider before anything is marked paid.
 */
const adapters = {};
export const registerCheckoutAdapter = (provider, adapter) => { adapters[provider] = adapter; };
export const getCheckoutAdapter = (provider) => adapters[provider] || null;