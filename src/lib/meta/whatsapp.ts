/**
 * WhatsApp Cloud API Client
 */

export interface WhatsAppMessagePayload {
  messaging_product: "whatsapp";
  recipient_type?: "individual";
  to: string;
  type: "text" | "template" | "interactive" | "image";
  text?: {
    preview_url?: boolean;
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: any;
  image?: {
    link: string;
  };
}

export class WhatsAppClient {
  private apiVersion = "v21.0";
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

  constructor(
    private phoneNumberId: string,
    private accessToken: string
  ) {}

  /**
   * Send a WhatsApp message
   */
  async sendMessage(payload: Omit<WhatsAppMessagePayload, "messaging_product">) {
    const fullPayload: WhatsAppMessagePayload = {
      ...payload,
      messaging_product: "whatsapp",
    };

    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API Error Response:", errorText);
      throw new Error(`WhatsApp API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send a simple text message
   */
  async sendText(to: string, text: string) {
    return this.sendMessage({
      to,
      type: "text",
      text: { body: text },
    });
  }

  /**
   * Send a template message
   */
  async sendTemplate(to: string, templateName: string, languageCode: string = "en_US", components: any[] = []) {
    return this.sendMessage({
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }
}
