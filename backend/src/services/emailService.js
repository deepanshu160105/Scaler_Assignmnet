import emailjs from "@emailjs/nodejs";

/**
 * EmailJS Service
 *
 * Uses EmailJS REST API to send emails from the backend.
 * No SMTP configuration needed — just create a free EmailJS account:
 *   1. Go to https://www.emailjs.com and sign up
 *   2. Add an Email Service (Gmail, Outlook, etc.)
 *   3. Create two Email Templates:
 *      - OTP template (with {{to_email}}, {{otp_code}} variables)
 *      - Order confirmation template (with {{to_email}}, {{order_id}}, {{#orders}}{{name}}{{units}}{{price}}{{/orders}}, {{cost.shipping}}, {{cost.tax}}, {{cost.total}} variables)
 *   4. Get your Public Key and Private Key from Account → API Keys
 *   5. Set the env variables: EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY,
 *      EMAILJS_OTP_TEMPLATE_ID, EMAILJS_ORDER_TEMPLATE_ID
 */

const isConfigured = () => {
  return !!(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY
  );
};

/**
 * Sends an OTP verification email using EmailJS.
 */
export const sendOtpEmail = async (email, otp) => {
  if (!isConfigured()) {
    console.log(`📧 [EmailJS not configured] OTP for ${email}: ${otp}`);
    return;
  }

  try {
    // Compute expiry time (15 minutes from now) for display in the email
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    const time = expiry.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_OTP_TEMPLATE_ID,
      {
        to_email: email,
        passcode: otp,   // matches {{passcode}} in template
        time,            // matches {{time}} in template  e.g. "04:35 PM IST"
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log(`📧 OTP email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error?.text || error?.message || error);
  }
};

/**
 * Sends an order confirmation email using EmailJS.
 *
 * Template variables used:
 *   {{order_id}}          — order number shown in subject & body
 *   {{#orders}}           — Mustache loop over line items
 *     {{name}}            — product name
 *     {{units}}           — quantity ordered
 *     {{price}}           — line total (quantity × unit price)
 *   {{/orders}}
 *   {{cost.shipping}}     — shipping cost
 *   {{cost.tax}}          — tax amount
 *   {{cost.total}}        — grand total
 */
export const sendOrderConfirmationEmail = async (email, order) => {
  if (!isConfigured()) {
    console.log(`📧 [EmailJS not configured] Order confirmation for ${email}: ${order.orderNumber}`);
    return;
  }

  // Build per-item array for the {{#orders}} Mustache loop in the template
  const orders = order.items.map((item) => ({
    name: item.product.name,
    units: item.quantity,
    price: (item.priceAtPurchase * item.quantity).toFixed(2),
    image_url: item.product.images?.[0] ?? "",  // matches {{image_url}} in template
  }));

  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_ORDER_TEMPLATE_ID,
      {
        to_email: email,
        email,                         // matches {{email}} in footer
        order_id: order.orderNumber,   // matches {{order_id}} in subject & body
        orders,                        // matches {{#orders}}...{{/orders}} loop
        cost: {
          shipping: order.shippingCost.toFixed(2),  // matches {{cost.shipping}}
          tax:      order.tax.toFixed(2),            // matches {{cost.tax}}
          total:    order.totalAmount.toFixed(2),    // matches {{cost.total}}
        },
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    console.log(`📧 Order confirmation sent to ${email} for ${order.orderNumber}`);
  } catch (error) {
    // Don't block the order if email fails
    console.error("Failed to send order confirmation:", error?.text || error?.message || error);
  }
};
