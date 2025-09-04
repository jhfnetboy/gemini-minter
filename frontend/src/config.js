import MyNFT_ABI from './abis/MyNFT.json';
import MySBT_ABI from './abis/MySBT.json';
import PNTs_ABI from './abis/PNTs.json';

// --- CONFIGURATION ---
// Sync with backend/.env
const OWNER_ADDRESS = '0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA';

// --- DEPLOYED CONTRACT ADDRESSES ---
const addresses = {
    nft: "0x7fd84232A9f47aC064D11963982161d18F9Eece0",
    sbt: "0xa32438E6Acd6BfF08A50E391b550F49B3FA0815C", 
    pnts: "0x708e373876C12baA0A8678e08e8979Bb1EfC3510",
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
