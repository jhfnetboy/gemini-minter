import MyNFT_ABI from './abis/MyNFT.json';
import MySBT_ABI from './abis/MySBT.json';
import PNTs_ABI from './abis/PNTs.json';

// --- CONFIGURATION ---
// Sync with backend/.env
const OWNER_ADDRESS = '0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA';

// --- DEPLOYED CONTRACT ADDRESSES ---
const addresses = {
    nft: "0xC9fB3Fe98442A23a0CA5884dC114989FF7b3d97a",
    sbt: "0xBfde68c232F2248114429DDD9a7c3Adbff74bD7f", 
    pnts: "0x3e7B771d4541eC85c8137e950598Ac97553a337a",
};

// --- ABIs ---
const abis = {
    nft: MyNFT_ABI.abi,
    sbt: MySBT_ABI.abi,
    pnts: PNTs_ABI.abi,
};

export const config = {
    OWNER_ADDRESS,
    addresses,
    abis,
};
