// const fetch = require("node-fetch"); // if using Node < 18, else built-in in Node 18+
import fetch from "node-fetch";

/**
 * Send SMS via Ping4SMS API
 * @param {string} phone - Recipient mobile number
 * @param {string} details - Payment details text
 * @param {string} dueDate - Due date string
 * @param {string} regards - Sender name or signature
 * @param {object} config - API configuration (AccountKey, Route, Sender, TemplateID)
 */

const AccountKey = process.env.PING4SMS_KEY;
const Route = process.env.PING4SMS_ROUTE;
const Sender = process.env.PING4SMS_SENDER;
const TemplateID = process.env.PING4SMS_TEMPLATE_ID;

const config = {
  AccountKey,
  Route,
  Sender,
  TemplateID,
};

async function sendPaymentSMS(phone, details, dueDate, regards) {
  const { AccountKey, Route, Sender, TemplateID } = config;

  // Message as per DLT template (without ${})
  const msgText = `Dear Sir, This is to inform you regarding your Payment. Details: ${details} due on ${dueDate}. Regards ${regards} -EYE THIRD`;

  console.log("Sending SMS...", config);

  // Build URL
  const url =
    "http://site.ping4sms.com/api/smsapi?key=" +
    encodeURIComponent(AccountKey) +
    "&route=" +
    encodeURIComponent(Route) +
    "&sender=" +
    encodeURIComponent(Sender) +
    "&number=" +
    encodeURIComponent(phone) +
    "&sms=" +
    encodeURIComponent(msgText) +
    "&templateid=" +
    encodeURIComponent(TemplateID);

  try {
    const response = await fetch(url, { method: "GET" });
    const result = await response.text();
    console.log("✅ SMS Sent Successfully!");
    console.log("Response:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    throw error;
  }
}

// // Example usage:
// (async () => {
//   await sendPaymentSMS(
//     "9876543210", // phone
//     "Invoice #1234 amount ₹500", // details
//     "25-Oct-2025", // due date
//     "Accounts Dept", // regards
//     {
//       AccountKey: "YOUR_API_KEY",
//       Route: "default",
//       Sender: "EYETHD",
//       TemplateID: "1234567890123456789",
//     }
//   );
// })();

export default sendPaymentSMS;
