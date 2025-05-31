import { RpcProvider, Account, Contract, CallData, uint256 } from "starknet";
import contractABI from "./contractABI.json";
import tokenAddressesJson from "./tokenAddresses.json";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-mainnet.public.blastapi.io",
});

const tokenAddresses: Array<`0x${string}`> = tokenAddressesJson.coins.map(
  (coin) => coin.contract as `0x${string}`
);

const userAddress: `0x${string}` = "USER_ADDRESS_HERE"; // Replace with the actual user address

const account = new Account(provider, "PUBLIC_KEY", "PRIVATE_KEY");

async function getTokenBalances(
  tokenAddresses: Array<`0x${string}`>,
  userAddress: `0x${string}`
) {
  try {
    const multiCall = await account.execute(
      Array.from({ length: 50 }, (_, i) => ({
        contractAddress: tokenAddresses[i],
        entrypoint: "balanceOf",
        calldata: CallData.compile({
          account: userAddress,
        }),
      }))
    );
    await provider.waitForTransaction(multiCall.transaction_hash);
    console.log("MultiCall Result:", multiCall);
  } catch (error) {
    console.error("Error in multicall:", error);
    return tokenAddresses.map((tokenAddress) => ({
      tokenAddress,
      balance: "0",
      error: "Error in multicall",
    }));
  }
}

async function main() {
  const balances = await getTokenBalances(tokenAddresses, userAddress);
  console.log("Token Balances:", balances);
}

main().catch(console.error);
