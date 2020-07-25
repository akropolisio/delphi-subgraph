import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";

import { SavingsPool } from "../../generated/schema";
import { DefiProtocol } from "../../generated/SavingsModule/DefiProtocol";

import { createToken } from "./createToken";
import { createSPoolBalance } from "./createSPoolBalance";
import { loadToken } from "./loadToken";
import { createSPoolApr } from "./createSPoolApr";

export function createSavingsPool(
  event: ethereum.Event,
  poolAddress: Address,
  tokenAddress: Address
): SavingsPool {
  let pool = new SavingsPool(poolAddress.toHex());

  pool.poolToken = createToken(tokenAddress).id;
  pool.tokens = loadSupportedTokens(poolAddress);
  pool.apr = createSPoolApr(event, BigInt.fromI32(0), pool.id).id;
  pool.balance = createSPoolBalance(event, BigInt.fromI32(0), pool.id).id;

  pool.save();

  return pool;
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