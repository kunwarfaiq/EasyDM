import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  exchangeForLongLivedToken,
  getInstagramBusinessAccount,
  subscribePageToWebhooks,
} from "@/lib/meta/messages";
import { auth } from "@/lib/auth";
import { encryptToken } from "@/lib/encryption";

/**
 * GET /api/meta/callback
 * Handles the Meta OAuth redirect after user authorizes.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Meta OAuth error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=meta_auth_failed", request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Exchange for long-lived token
    const { accessToken, expiresIn } = await exchangeForLongLivedToken(
      tokenData.access_token
    );

    // Get user's Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();
    const page = pagesData.data?.[0];

    if (!page) {
      throw new Error("No Facebook Page found");
    }

    // Get Instagram Business Account linked to the page
    const { igUserId, igUsername } = await getInstagramBusinessAccount(
      page.id,
      accessToken
    );

    // Get workspace
    const membership = await db.workspaceMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      throw new Error("No workspace found");
    }

    // Store the connection
    await db.metaConnection.upsert({
      where: {
        id: `${membership.workspaceId}-${igUserId}`,
      },
      update: {
        accessToken: encryptToken(accessToken),
        accessTokenExpiry: new Date(Date.now() + expiresIn * 1000),
        igUsername,
        updatedAt: new Date(),
      },
      create: {
        workspaceId: membership.workspaceId,
        igUserId,
        igUsername,
        pageId: page.id,
        accessToken: encryptToken(accessToken),
        accessTokenExpiry: new Date(Date.now() + expiresIn * 1000),
      },
    });

    // Subscribe page to webhook notifications
    await subscribePageToWebhooks(page.id, page.access_token || accessToken);

    // Update webhook subscription status
    await db.metaConnection.updateMany({
      where: { igUserId, workspaceId: membership.workspaceId },
      data: { webhookSubscribed: true },
    });

    return NextResponse.redirect(
      new URL("/settings?success=instagram_connected", request.url)
    );
  } catch (error) {
    console.error("Meta OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings?error=connection_failed", request.url)
    );
  }
}
