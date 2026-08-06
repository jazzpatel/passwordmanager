export const DB_NAME = "KeyVaultDB";
export const STORE_NAME = "credentials";
export const META_KEY = "meta";
export const VAULT_KEY = "vault_v2";

export const CATEGORIES = {
  Work: "💼",
  Social: "📱",
  Finance: "💰",
  Email: "📧",
  Shopping: "🛒",
  Entertainment: "🎮",
  Other: "📝",
};
export const CAT_ORDER = Object.keys(CATEGORIES);

export const SETTINGS_KEY = "keyvault_settings";
export const TIMEOUT_OPTIONS = [
  { label: "1 minute", value: 1 },
  { label: "5 minutes", value: 5 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "Never", value: 0 },
];
