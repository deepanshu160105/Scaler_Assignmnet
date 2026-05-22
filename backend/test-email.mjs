// EmailJS Email Test Script
// Run: node --env-file=.env test-email.mjs

import emailjs from "@emailjs/nodejs";

const SERVICE_ID  = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY  = process.env.EMAILJS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const OTP_TPL     = process.env.EMAILJS_OTP_TEMPLATE_ID;
const ORDER_TPL   = process.env.EMAILJS_ORDER_TEMPLATE_ID;

const TEST_EMAIL  = "deepanshueng16@gmail.com"; // emails will be sent here

console.log("\n" + "═".repeat(50));
console.log("  EmailJS Configuration");
console.log("═".repeat(50));
console.log(`  SERVICE_ID  : ${SERVICE_ID}`);
console.log(`  PUBLIC_KEY  : ${PUBLIC_KEY}`);
console.log(`  PRIVATE_KEY : ${PRIVATE_KEY}`);
console.log(`  OTP_TPL     : ${OTP_TPL}`);
console.log(`  ORDER_TPL   : ${ORDER_TPL}`);
console.log("═".repeat(50) + "\n");

const auth = { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY };

// ── TEST 1: OTP Email ─────────────────────────────────────
console.log("── Test 1: OTP Email ────────────────────────────");
try {
  const expiry = new Date(Date.now() + 15 * 60 * 1000);
  const time = expiry.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const res = await emailjs.send(SERVICE_ID, OTP_TPL, {
    to_email: TEST_EMAIL,
    passcode: "847291",
    time,
  }, auth);

  console.log(`✅ OTP email sent!  Status: ${res.status} — ${res.text}`);
  console.log(`   Sent to  : ${TEST_EMAIL}`);
  console.log(`   OTP code : 847291`);
  console.log(`   Expires  : ${time}`);
} catch (err) {
  console.error(`❌ OTP email FAILED`);
  console.error(`   Reason: ${err?.text || err?.message || JSON.stringify(err)}`);
}

// ── TEST 2: Order Confirmation Email ─────────────────────
console.log("\n── Test 2: Order Confirmation Email ─────────────");
try {
  const res = await emailjs.send(SERVICE_ID, ORDER_TPL, {
    to_email: TEST_EMAIL,
    email: TEST_EMAIL,
    order_id: "ORD-TEST-20260521",
    orders: [
      {
        name: "Apple iPhone 15 (128GB, Black)",
        units: 1,
        price: "79999.00",
        image_url: "https://placehold.co/64x64?text=iPhone",
      },
      {
        name: "USB-C Braided Cable 2m",
        units: 2,
        price: "999.00",
        image_url: "https://placehold.co/64x64?text=Cable",
      },
    ],
    cost: {
      shipping: "0.00",
      tax: "14579.64",
      total: "95577.64",
    },
  }, auth);

  console.log(`✅ Order email sent!  Status: ${res.status} — ${res.text}`);
  console.log(`   Sent to     : ${TEST_EMAIL}`);
  console.log(`   Order ID    : ORD-TEST-20260521`);
  console.log(`   Items       : 2`);
  console.log(`   Order Total : $95577.64`);
} catch (err) {
  console.error(`❌ Order email FAILED`);
  console.error(`   Reason: ${err?.text || err?.message || JSON.stringify(err)}`);
}

console.log("\n" + "═".repeat(50) + "\n");
