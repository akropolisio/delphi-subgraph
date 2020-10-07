import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";

import { SavingsPool } from "../../../generated/schema";
import { DefiProtocol } from "../../../generated/SavingsModule/DefiProtocol";

import { createToken } from "../createToken";
import { createSPoolBalance } from "./createSPoolBalance";
import { loadToken } from "../loadToken";
import { createSPoolApr } from "./createSPoolApr";
import { loadSubgraphConfig } from "../loadSubgraphConfig";

export function createOrUpdateSavingsPool(
  event: ethereum.Event,
  poolAddress: Address,
  tokenAddress: Address
): SavingsPool {
  loadSubgraphConfig(); // create config subgraph if it doesn't exist
  let pool = SavingsPool.load(poolAddress.toHex());

  if (!pool) {
    pool = new SavingsPool(poolAddress.toHex());
    pool.apr = createSPoolApr(
      event,
      BigInt.fromI32(0),
      BigInt.fromI32(0),
      pool.id
    ).id;
    pool.balance = createSPoolBalance(event, BigInt.fromI32(0), pool.id).id;
    pool.prevBalance = pool.balance;
  }

  pool.poolToken = createToken(tokenAddress).id;
  pool.tokens = loadSupportedTokens(poolAddress);
  pool.rewardTokens = loadSupportedRewardTokens(poolAddress);

  pool.save();

  return pool as SavingsPool;
}

function loadSupportedTokens(poolAddress: Address): string[] {
  let contract = DefiProtocol.bind(poolAddress);

  let ids: string[] = [];
  let tokens = contract.supportedTokens();

  for (let i = 0; i < tokens.length; i++) {
    let token = loadToken(tokens[i]);
    ids.push(token.id);
  }

  return ids;
}

function loadSupportedRewardTokens(poolAddress: Address): string[] {
  let contract = DefiProtocol.bind(poolAddress);

  let ids: string[] = [];
  let tokens = contract.supportedRewardTokens();

  for (let i = 0; i < tokens.length; i++) {
    let token = loadToken(tokens[i]);
    ids.push(token.id);
  }

  return ids;
}
