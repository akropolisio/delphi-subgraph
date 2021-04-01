import { Address } from "@graphprotocol/graph-ts";

import { PoolToken } from "../../../generated/schema";
import { ERC20Detailed } from "../../../generated/SavingsModule/ERC20Detailed";

export function createPoolToken(
  tokenAddress: Address,
  savingsPool: string | null,
  vaultPoolV1: string | null,
  vaultPoolV2: string | null
): PoolToken {
  let token = new PoolToken(tokenAddress.toHex());

  let contract = ERC20Detailed.bind(tokenAddress);

  token.name = contract.name();
  token.decimals = contract.decimals();
  token.symbol = contract.symbol();
  token.savingsPool = savingsPool;
  token.vaultPoolV1 = vaultPoolV1;
  token.vaultPoolV2 = vaultPoolV2;

  token.save();

  return token;
}
