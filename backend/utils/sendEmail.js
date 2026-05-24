const sendEmail = async (options) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
        const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL?.trim() || process.env.EMAIL_USER?.trim();

        if (!BREVO_API_KEY) {
            throw new Error("Missing BREVO_API_KEY in environment variables");
        }

        if (!BREVO_SENDER_EMAIL) {
            throw new Error("Missing BREVO_SENDER_EMAIL or EMAIL_USER in environment variables");
        }

        const data = {
            sender: {
                name: "Real Estate Platform",
                email: BREVO_SENDER_EMAIL,
            },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.message,
        };

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        });

        const responseText = await response.text();
        let result = responseText;

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            // Keep the raw body when Brevo returns plain text or an empty body.
        }

        if (response.ok) {
            console.log("Email sent successfully via Brevo:", result.messageId || result);
            return result;
        }

        const errorMessage = typeof result === "object" && result !== null
            ? result.message || result.code || responseText
            : responseText;

        console.error("Brevo API Error:", {
            status: response.status,
            statusText: response.statusText,
            body: result,
        });

        throw new Error(`Brevo API Error (${response.status}): ${errorMessage || "Could not send email via Brevo."}`);
    } catch (error) {
        console.error("Brevo Email Error:", error);
        throw error instanceof Error ? error : new Error("Could not send email via Brevo.");
    }
};

export default sendEmail;