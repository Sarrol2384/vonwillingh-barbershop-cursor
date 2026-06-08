import { normalizePhoneDigits } from "./phone";

type TemplateParameter = {
  type: "text";
  text: string;
};

export function isWhatsAppApiConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

export async function sendWhatsAppTemplate(params: {
  to: string;
  templateName?: string;
  languageCode?: string;
  bodyParameters: string[];
}): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) return false;

  const templateName =
    params.templateName ??
    process.env.WHATSAPP_REMINDER_TEMPLATE ??
    "appointment_reminder";

  const languageCode =
    params.languageCode ?? process.env.WHATSAPP_TEMPLATE_LANG ?? "en";

  const recipient = normalizePhoneDigits(params.to);

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: params.bodyParameters.map(
                (text): TemplateParameter => ({ type: "text", text }),
              ),
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return true;
}
