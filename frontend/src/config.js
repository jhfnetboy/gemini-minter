import MyNFT_ABI from "./abis/MyNFT.json";
import MySBT_ABI from "./abis/MySBT.json";
import GasToken_ABI from "./abis/GasToken.json";

// --- CONFIGURATION ---
// Sync with backend/.env
const OWNER_ADDRESS = "0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA";

// --- DEPLOYED CONTRACT ADDRESSES ---
const addresses = {
  nft: "0xC9fB3Fe98442A23a0CA5884dC114989FF7b3d97a",
  sbt: "0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f",
  // Old PNTS (simple ERC20): 0x3e7B771d4541eC85c8137e950598Ac97553a337a
  // New PNTS (with Settlement pre-approval): 0xf2996D81b264d071f99FD13d76D15A9258f4cFa9
  pnts: "0xf2996D81b264d071f99FD13d76D15A9258f4cFa9",
  gasTokenFactory: "0xEb7F4a417690c8E3479928C5406770e3cdAA2E58",
};

// --- ABIs ---
const abis = {
  nft: MyNFT_ABI.abi,
  sbt: MySBT_ABI.abi,
  pnts: GasToken_ABI.abi, // Use GasToken ABI (ERC20 + pre-approval)
};

export const config = {
  OWNER_ADDRESS,
  addresses,
  abis,
};
