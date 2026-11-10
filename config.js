/* Everything you're likely to change lives here. */
window.K9 = {
  // Live ledger API for K9 Rescue's published wallet (same wallet, same neutral Pages project as the K9 site).
  TRACKER_URL: "https://k9rescue-ledger.pages.dev/stats",
  REFRESH_SECONDS: 60,

  // The donate widget builds the transfer in the browser; the donor's own wallet signs and sends it.
  BLOCKHASH_URL: "https://k9rescue-ledger.pages.dev/blockhash",
  RPC_URL: "https://solana-rpc.publicnode.com",

  // K9 Rescue's published Solana wallet for memecoin projects (Trust Wallet, self-custody). Re-check before launch.
  WALLET: "DBcrNadUAmxUXSacsjHSZSeGnUjTPdivZaY8mjwuCbyE",

  // The coin. Name, ticker and image need K9 Rescue's written approval before launch.
  // Until MINT and BUY_URL are set, the contract address and buy button stay hidden.
  COIN_NAME: "Kulya the War Dog",
  TICKER: "KULYA",
  MINT: "",
  BUY_URL: "",
  CHART_URL: "",

  // Optional goal shown as a progress bar (in SOL sent by the coin). 0 hides it.
  GOAL_SOL: 0,
  GOAL_LABEL: "towards the next supply run to Kharkiv",

  // K9 Rescue's own figure: "£8 / $11 buys a 10kg bag" of feed. Used for the "what it buys" line.
  FOOD_BAG_USD: 11,

  // Used in share links.
  SITE_URL: "https://kulyathewardog.com",
  K9_SITE: "",
};
