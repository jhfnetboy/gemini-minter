const { createWallet, createContract, handleMint, isValidAddress, parseAmount } = require('../_lib/contract-utils');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userAddress, amount } = req.body;

    // Validate user address
    if (!userAddress || !isValidAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Parse amount to Wei
    let amountWei;
    try {
      amountWei = parseAmount(amount);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid amount format' });
    }

    // Create wallet and contract
    const wallet = createWallet();
    const pntsContract = createContract('pnts', wallet);

    // Execute mint
    const result = await handleMint(pntsContract, 'mint', [userAddress, amountWei]);

    if (result.success) {
      res.status(200).json({ txHash: result.txHash });
    } else {
      res.status(500).json({ 
        error: result.error, 
        details: result.details 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}