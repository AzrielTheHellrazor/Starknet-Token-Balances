import { RpcProvider, Account, Contract, CallData, uint256 } from "starknet";
import contractABI from "./contractABI.json";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-mainnet.public.blastapi.io",
});
const tokenAddresses: Array<`0x${string}`> = [
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  "0x051f6edf1ceec33ddbaeb738f701243ec349a1fe3871122f28f6e55652c6b16b",
  "0x07527185ecff6717354410ca2d3deb6ae3518a3350a172b16a6dfc580a9228eb",
  "0x037bf0e66ce8bfbc0ec08fe53e3c820a93af2b07627e823853ff176d87480a25",
];

const userAddress: `0x${string}` =
  "0x05e03162008d76cf645fe53c6c13a7a5fce745e8991c6ffe94400d60e44c210a";

async function getTokenBalances(
  tokenAddresses: Array<`0x${string}`>,
  userAddress: `0x${string}`
) {
  const balances = await Promise.all(
    tokenAddresses.map(async (tokenAddress) => {
      try {
        const tokenContract = new Contract(contractABI, tokenAddress, provider);
        const balance = await tokenContract.balanceOf(userAddress);
        const decimal = await tokenContract.decimals();
        const balanceStr = balance.toString();
        const formattedBalance =
          balanceStr.length > 4
            ? `${balanceStr.slice(0, 4)}.${balanceStr.slice(4)}`
            : balanceStr;
        return {
          tokenAddress,
          balance: formattedBalance,
          decimal,
        };
      } catch (error) {
        console.error(
          `Error fetching balance for token ${tokenAddress}:`,
          error
        );
        return {
          tokenAddress,
          balance: "0",
          error: `Error fetching balance:`,
        };
      }
    })
  );

  return balances;
}

async function main() {
  const balances = await getTokenBalances(tokenAddresses, userAddress);
  console.log("Token Balances:", balances);
}

main().catch(console.error);
