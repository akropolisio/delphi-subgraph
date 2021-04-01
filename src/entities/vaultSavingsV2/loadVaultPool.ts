import { Address, log } from "@graphprotocol/graph-ts";

import { VaultPoolV2 } from "../../../generated/schema";

export function loadVaultPoolV2(poolAddress: Address): VaultPoolV2 | null {
  let pool = VaultPoolV2.load(poolAddress.toHex());

  return pool;
}
