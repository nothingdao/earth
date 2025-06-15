import { Metaplex, keypairIdentity } from "@metaplex-foundation/js"
import { Connection, Keypair } from "@solana/web3.js"

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    console.log('🚀 Creating Earth 2089 Collection...')

    const connection = new Connection("https://api.devnet.solana.com", "confirmed")

    const serverKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.SERVER_KEYPAIR_SECRET
      )

    const metaplex = Metaplex.make(connection).use(keypairIdentity(serverKeypair))

    const collectionNft = await metaplex.nfts().create({
      name: "Earth 2089",
      symbol: "PLAYER",
      uri: "https://earth.ndao.computer/.netlify/functions/collection-metadata",
      sellerFeeBasisPoints: 500,
      isCollection: true,
      creators: [
        {
          address: serverKeypair.publicKey,
          verified: true,
          share: 100
        }
      ],
      tokenOwner: serverKeypair.publicKey,
      isMutable: true,
    })

    const collectionAddress = collectionNft.mintAddress.toBase58()

    console.log('✅ Collection created:', collectionAddress)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        collectionAddress: collectionAddress,
        transactionSignature: collectionNft.response.signature,
        envVariable: `PLAYER_COLLECTION_ADDRESS=${collectionAddress}`,
        message: "Earth 2089 Collection created successfully!"
      }, null, 2)
    }

  } catch (error) {
    console.error('❌ Collection creation failed:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}
