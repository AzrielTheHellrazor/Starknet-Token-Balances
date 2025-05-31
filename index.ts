import { RpcProvider, Account, Contract, CallData, uint256 } from "starknet";
import contractABI from "./contractABI.json";
import tokenAddressesJson from "./tokenAddresses.json";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-mainnet.public.blastapi.io",
});

const tokenAddresses: Array<`0x${string}`> = tokenAddressesJson.coins.map(
  (coin) => coin.contract as `0x${string}`
);

const userAddress: `0x${string}` =
  "0x05e03162008d76cf645fe53c6c13a7a5fce745e8991c6ffe94400d60e44c210a";

async function getTokenBalances(
  tokenAddresses: Array<`0x${string}`>,
  userAddress: `0x${string}`
) {
  try {
    const contracts = tokenAddresses.map(
      (address) => new Contract(contractABI, address, provider)
    );

    const balancePromises = contracts.map((contract) =>
      contract.balanceOf(userAddress)
    );
    const decimalPromises = contracts.map((contract) => contract.decimals());

    const [balances, decimals] = await Promise.all([
      Promise.all(balancePromises),
      Promise.all(decimalPromises),
    ]);

    return tokenAddresses.map((tokenAddress, index) => {
      const balanceStr = balances[index].toString();
      const formattedBalance =
        balanceStr.length > 4
          ? `${balanceStr.slice(0, 4)}.${balanceStr.slice(4)}`
          : balanceStr;

      return {
        tokenAddress,
        balance: formattedBalance,
        decimal: decimals[index],
      };
    });
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
