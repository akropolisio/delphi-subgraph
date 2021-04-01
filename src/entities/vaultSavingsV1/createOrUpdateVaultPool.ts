import { Address, BigInt } from "@graphprotocol/graph-ts";

import { VaultPoolV1 } from "../../../generated/schema";
import { YVaultV1 } from "../../../generated/VaultSavingsV1/YVaultV1";

import { createPoolToken, createToken } from "../tokens";
import { loadSubgraphConfig } from "../loadSubgraphConfig";
import { loadOrCreateVaultControllerV1 } from "./vaultController";
import {
  getStrategyV1Address,
  loadOrCreateVaultStrategyV1,
} from "./vaultStrategy";

export function createOrUpdateVaultPoolV1(
  vaultAddress: Address,
  underlyingTokenAddress: Address
): VaultPoolV1 {
  loadSubgraphConfig(); // create config subgraph if it doesn't exist
  let pool = VaultPoolV1.load(vaultAddress.toHex());
  let yVaultContract = YVaultV1.bind(vaultAddress);
  let controllerAddress = yVaultContract.controller();

  if (!pool) {
    pool = new VaultPoolV1(vaultAddress.toHex());
    pool.totalTVL = BigInt.fromI32(0);
    pool.isActive = true;
  }

  pool.poolToken = createPoolToken(vaultAddress, null, pool.id, null).id;
  pool.underlyingToken = createToken(underlyingTokenAddress).id;
  pool.controller = loadOrCreateVaultControllerV1(controllerAddress).id;
  pool.strategy = loadOrCreateVaultStrategyV1(
    getStrategyV1Address(controllerAddress, underlyingTokenAddress)
  ).id;
  pool.save();

  return pool as VaultPoolV1;
}
