// background.js

// Initialize browser API
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

console.log("Background script running");

// Get Cookies
async function getCookies(url) {
    console.log("Getting cookies for domain:", url);
    try {
        const cookies = await browserAPI.cookies.getAll({ url });

        console.log("Cookies Found:", cookies);

        return cookies;
    } catch (error) {
        console.error("Error:", error);
        return Promise.reject(error);
    }
}

// Message Handler
// ! This cannot be an async function
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message Received:", message);

    if (message.action === "getCookies") {
        getCookies(message.url) // The origin is being passed in so this should work
            .then((cookies) => {
                // Filter for relevant cookies
                const authnTokenCookie = cookies.find(
                    (cookie) => cookie.name === "AUTHN_TOKEN"
                );
                const authnSsidCookie = cookies.find(
                    (cookie) => cookie.name === "authn_ssid"
                );
                sendResponse({
                    cookies: {
                        authnToken: authnTokenCookie,
                        authnSsid: authnSsidCookie,
                    },
                });

                console.log("Cookies in background is:", cookies);
            })
            .catch((error) => {
                console.error("Error from background:", error);
                sendResponse({ error: error.message });
            });

        return true; // Keep messaging channel open for async response
    }
});

console.log("Background script loaded and listening for messages");
