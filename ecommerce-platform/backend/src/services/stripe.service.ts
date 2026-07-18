import { ApiError } from '../utils/ApiError';

interface PaymentIntentInput {
  amount: number;
  currency?: string;
  orderId: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  status: 'succeeded' | 'requires_action' | 'requires_payment_method';
  clientSecret?: string;
}

export const stripeService = {
  async createPaymentIntent(input: PaymentIntentInput): Promise<PaymentResult> {
    // SIMULACIÓN: En producción, usar Stripe SDK
    // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({...});

    console.log(`[STRIPE SIM] Creando PaymentIntent por $${input.amount} para orden ${input.orderId}`);

    // Simulamos un delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulación exitosa
    const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    return {
      success: true,
      paymentIntentId: mockPaymentIntentId,
      status: 'succeeded',
      clientSecret: `${mockPaymentIntentId}_secret`,
    };
  },

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    console.log(`[STRIPE SIM] Confirmando PaymentIntent ${paymentIntentId}`);

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      paymentIntentId,
      status: 'succeeded',
    };
  },

  async refundPayment(paymentIntentId: string, amount?: number): Promise<{ success: boolean; refundId: string }> {
    console.log(`[STRIPE SIM] Reembolsando PaymentIntent ${paymentIntentId} ${amount ? `por $${amount}` : '(total)'}`);

    return {
      success: true,
      refundId: `re_${Date.now()}`,
    };
  },

  // Webhook handler simulado
  async handleWebhook(payload: any, signature: string): Promise<any> {
    // En producción: stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    console.log('[STRIPE SIM] Webhook recibido:', payload.type);
    return payload;
  },
};
