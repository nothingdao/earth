// netlify/functions/collection-metadata.js
export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const metadata = {
    name: "EARTH 2089 Players",
    description: "Unique character NFTs from Earth 2089, a Web3 MMORPG built on Solana. Each character is a playable avatar with real game stats, inventory, and progression stored on-chain.",
    image: "https://earth.ndao.computer/earth.png",
    external_url: "https://earth.ndao.computer",

    attributes: [
      { trait_type: "Collection", value: "EARTH 2089 Characters" },
      { trait_type: "Game_Type", value: "Web3 MMORPG" },
      { trait_type: "Blockchain", value: "Solana" }
    ],

    properties: {
      category: "image",
      collection: {
        name: "Earth 2089 Characters",
        family: "Earth 2089"
      }
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(metadata, null, 2)
  }
}
