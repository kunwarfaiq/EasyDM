import type { MetaSendMessageResponse } from "@/types";

const META_API_VERSION = process.env.META_API_VERSION || "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface SendTextMessageParams {
  igUserId: string;
  recipientId: string;
  text: string;
  accessToken: string;
}

interface SendQuickReplyParams {
  igUserId: string;
  recipientId: string;
  text: string;
  buttons: { title: string; payload: string }[];
  accessToken: string;
}

/**
 * Send a text DM via the Instagram Graph API.
 * Endpoint: POST /{ig-user-id}/messages
 */
export async function sendTextMessage({
  igUserId,
  recipientId,
  text,
  accessToken,
}: SendTextMessageParams): Promise<MetaSendMessageResponse> {
  const response = await fetch(`${BASE_URL}/${igUserId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Meta API Error: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Send a quick-reply message with buttons.
 */
export async function sendQuickReplyMessage({
  igUserId,
  recipientId,
  text,
  buttons,
  accessToken,
}: SendQuickReplyParams): Promise<MetaSendMessageResponse> {
  const response = await fetch(`${BASE_URL}/${igUserId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: buttons.map((btn) => ({
          content_type: "text",
          title: btn.title,
          payload: btn.payload,
        })),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Meta API Error: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Exchange a short-lived token for a long-lived token.
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${BASE_URL}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Token exchange failed: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // Default 60 days
  };
}

/**
 * Get Instagram Business Account ID from a Facebook Page.
 */
export async function getInstagramBusinessAccount(
  pageId: string,
  accessToken: string
): Promise<{ igUserId: string; igUsername: string }> {
  const response = await fetch(
    `${BASE_URL}/${pageId}?fields=instagram_business_account{id,username}&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Instagram business account");
  }

  const data = await response.json();
  const igAccount = data.instagram_business_account;

  if (!igAccount) {
    throw new Error("No Instagram Business Account linked to this Page");
  }

  return {
    igUserId: igAccount.id,
    igUsername: igAccount.username,
  };
}

/**
 * Subscribe a page to webhook notifications.
 */
export async function subscribePageToWebhooks(
  pageId: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(
    `${BASE_URL}/${pageId}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subscribed_fields: ["messages", "messaging_postbacks"],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Webhook subscription failed: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.success === true;
}
