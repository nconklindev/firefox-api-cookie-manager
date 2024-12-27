/* This file is injected into every webpage but only called when the extension is loaded */

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get active tab and check if it's a mykronos.com domain
        const currentTab = await browserAPI.tabs.query({
            active: true,
            currentWindow: true,
        });

        const url = new URL(currentTab[0].url);

        // Need to define the origin of the cookie to get the cookies
        const cookieOrigin = url.origin;

        // Validate if the URL is a mykronos.com domain
        if (!url.hostname.includes("mykronos.com")) {
            document.body.innerHTML =
                '<div class="container"><p>This extension only works on mykronos.com domains</p></div>';
            return;
        }

        // Set the vanity URL in the popup
        // Set the protocol and hostname of the URL
        document.getElementById(
            "vanityUrl"
        ).value = `${url.protocol}//${url.hostname}`;

        // Request Cookies from background script with specific origin
        browserAPI.runtime.sendMessage(
            {
                action: "getCookies",
                url: cookieOrigin,
            },
            (cookies) => {
                console.log("Cookies from background:", cookies);

                console.log("Cookies.cookies in popup", cookies.cookies);
                const authnToken = cookies.cookies.authnToken;
                const authnSsid = cookies.cookies.authnSsid;

                if (cookies && authnToken && authnSsid) {
                    // Set the cookies in the popup
                    document.getElementById("authnToken").value =
                        authnToken.value;
                    document.getElementById("authnSsid").value =
                        authnSsid.value;
                }
            }
        );
        // Copy to clipboard functionality
        const copyToClipboard = (elementId) => {
            const input = document.getElementById(elementId);
            input.select();
            navigator.clipboard.writeText(input.value);
        };

        document
            .getElementById("copyVanityUrl")
            .addEventListener("click", () => {
                copyToClipboard("vanityUrl");
            });

        document
            .getElementById("copyAuthnToken")
            .addEventListener("click", () => {
                copyToClipboard("authnToken");
            });

        document
            .getElementById("copyAuthnSsid")
            .addEventListener("click", () => {
                copyToClipboard("authnSsid");
            });
    } catch (error) {
        console.error("Error:", error);
        document.body.innerHTML = `<div class="container"><p>Error: ${error.message}</p></div>`;
    }
});
