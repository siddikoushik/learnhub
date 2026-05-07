/**
 * Dynamically loads the Razorpay checkout.js script on demand.
 * This avoids loading it globally (which causes preload warnings
 * and 'otp-credentials' feature detection noise on every page).
 *
 * Usage:
 *   const Razorpay = await loadRazorpay();
 *   const rzp = new Razorpay({ ... });
 */
let razorpayPromise = null;

export default function loadRazorpay() {
    if (razorpayPromise) return razorpayPromise;

    razorpayPromise = new Promise((resolve, reject) => {
        // Already loaded (e.g. from a previous call)
        if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(window.Razorpay);
        script.onerror = () => {
            razorpayPromise = null; // allow retry
            reject(new Error("Failed to load Razorpay SDK"));
        };
        document.body.appendChild(script);
    });

    return razorpayPromise;
}
