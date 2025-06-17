// mint-earth-token.js
// Run with: node mint-earth-token.js

import {
  Connection,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getMint,
  getAccount
} from '@solana/spl-token';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Your server wallet secret key from environment variable
const SERVER_KEYPAIR_SECRET = JSON.parse(process.env.SERVER_KEYPAIR_SECRET || '[]');

// Validate the secret key
if (!SERVER_KEYPAIR_SECRET || SERVER_KEYPAIR_SECRET.length !== 64) {
  console.error('❌ Invalid SERVER_KEYPAIR_SECRET in .env file. Must be a 64-byte array.');
  process.exit(1);
}

async function main() {
  console.log('🌍 Creating EARTH Token on Solana Devnet...\n');

  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  // Create keypair from secret
  const serverWallet = Keypair.fromSecretKey(new Uint8Array(SERVER_KEYPAIR_SECRET));

  console.log('Server Wallet:', serverWallet.publicKey.toString());

  // Check wallet balance
  const balance = await connection.getBalance(serverWallet.publicKey);
  console.log(`SOL Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log('⚠️  Low SOL balance. You may need to airdrop SOL for transaction fees.');
    console.log('Run: solana airdrop 2 ' + serverWallet.publicKey.toString() + ' --url devnet\n');
  }

  try {
    console.log('Step 1: Creating EARTH token mint...');

    // Create the EARTH token mint
    const earthMint = await createMint(
      connection,
      serverWallet,        // Payer
      serverWallet.publicKey, // Mint authority
      null,                // Freeze authority (null = no freeze authority)
      9                    // Decimals
    );

    console.log('✅ EARTH Token Mint Created!');
    console.log('Mint Address:', earthMint.toString());
    console.log('');

    console.log('Step 2: Creating associated token account...');

    // Create associated token account for server wallet
    const serverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      serverWallet,
      earthMint,
      serverWallet.publicKey
    );

    console.log('✅ Token Account Created!');
    console.log('Token Account:', serverTokenAccount.address.toString());
    console.log('');

    console.log('Step 3: Minting 3.5M EARTH tokens...');

    // Mint 3,500,000 EARTH tokens (with 9 decimals)
    const mintAmount = 3_500_000 * Math.pow(10, 9); // 3.5M with 9 decimals

    const mintSignature = await mintTo(
      connection,
      serverWallet,
      earthMint,
      serverTokenAccount.address,
      serverWallet.publicKey,
      mintAmount
    );

    console.log('✅ EARTH Tokens Minted!');
    console.log('Mint Transaction:', mintSignature);
    console.log('Amount Minted: 3,500,000 EARTH');
    console.log('');

    console.log('Step 4: Verifying mint and balance...');

    // Verify mint info
    const mintInfo = await getMint(connection, earthMint);
    const accountInfo = await getAccount(connection, serverTokenAccount.address);

    console.log('✅ Verification Complete!');
    console.log('Total Supply:', Number(mintInfo.supply) / Math.pow(10, 9), 'EARTH');
    console.log('Server Wallet Balance:', Number(accountInfo.amount) / Math.pow(10, 9), 'EARTH');
    console.log('');

    console.log('🎉 EARTH Token Successfully Created and Minted!');
    console.log('');
    console.log('📋 IMPORTANT INFORMATION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔑 Add this to your .env file:');
    console.log(`VITE_EARTH_MINT_ADDRESS=${earthMint.toString()}`);
    console.log('');
    console.log('💰 Token Details:');
    console.log(`   Name: EARTH`);
    console.log(`   Symbol: EARTH`);
    console.log(`   Decimals: 9`);
    console.log(`   Mint Address: ${earthMint.toString()}`);
    console.log(`   Mint Authority: ${serverWallet.publicKey.toString()}`);
    console.log(`   Freeze Authority: None`);
    console.log('');
    console.log('📍 Current Holdings:');
    console.log(`   Server Wallet: 3,500,000 EARTH`);
    console.log(`   Token Account: ${serverTokenAccount.address.toString()}`);
    console.log('');
    console.log('📤 Next Steps:');
    console.log('   1. Add mint address to your environment variables');
    console.log('   2. Transfer EARTH tokens to treasury wallet manually');
    console.log('   3. Update bridge functions with new mint address');
    console.log('');
    console.log('🔗 Explorer Links:');
    console.log(`   Mint: https://explorer.solana.com/address/${earthMint.toString()}?cluster=devnet`);
    console.log(`   Token Account: https://explorer.solana.com/address/${serverTokenAccount.address.toString()}?cluster=devnet`);

  } catch (error) {
    console.error('❌ Error creating EARTH token:', error);

    if (error.message.includes('0x1')) {
      console.log('💡 This usually means insufficient SOL for transaction fees.');
      console.log('   Try running: solana airdrop 2 ' + serverWallet.publicKey.toString() + ' --url devnet');
    }
  }
}

// Helper function to format large numbers
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

main().catch(console.error);
