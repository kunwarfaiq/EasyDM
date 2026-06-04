"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { MessageCircle, LogOut, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<any>(null);
  
  // Unwrap searchParams using React.use()
  const params = use(searchParams);
  const success = params?.success;
  const error = params?.error;

  useEffect(() => {
    fetch("/api/meta/status")
      .then((r) => r.json())
      .then((data) => {
        setConnection(data.connection);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleConnectInstagram = () => {
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`;
    const scopes = [
      "instagram_basic",
      "instagram_manage_messages",
      "pages_show_list",
      "pages_manage_metadata",
      "pages_read_engagement",
    ].join(",");

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&display=page&extras={"setup":{"channel":"IG_API_ONBOARDING"}}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;

    window.location.href = authUrl;
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your integrations and account preferences.
        </p>
      </motion.div>

      {success === "instagram_connected" && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">Instagram connected successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">
            {error === "meta_auth_failed"
              ? "Instagram connection was cancelled or failed."
              : "An error occurred while connecting Instagram."}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Integration Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Integrations</h2>

          <div className="glass rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white flex items-center gap-2">
                  Instagram Professional Account
                  {connection && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      Connected
                    </span>
                  )}
                </h3>
                <p className="text-sm text-white/40 mt-1">
                  Required to send and receive automated DMs.
                </p>
                {connection && (
                  <p className="text-xs text-white/60 mt-2">
                    Connected as <strong className="text-white">@{connection.igUsername}</strong>
                  </p>
                )}
              </div>
            </div>

            {loading ? (
              <div className="px-5 py-2.5 rounded-xl bg-white/5 w-24 h-10 animate-pulse" />
            ) : connection ? (
              <button
                onClick={handleConnectInstagram}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </button>
            ) : (
              <button
                onClick={handleConnectInstagram}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 transition-all shadow-lg whitespace-nowrap"
              >
                Connect Account
              </button>
            )}
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
