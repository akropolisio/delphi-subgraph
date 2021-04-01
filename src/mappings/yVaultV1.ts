import { BigInt, dataSource } from "@graphprotocol/graph-ts";

import { User } from "../../generated/schema";
import { Transfer } from "../../generated/templates/YVaultV1/YVaultV1";
import {
  createOrUpdateUserBalance,
  loadUser,
  loadUserBalance,
  loadVaultPoolV1,
  deactivateUserIfZeroBalance,
} from "../entities";
import { exclude } from "../utils";

export function handleTransfer(event: Transfer): void {
  let userAddress = event.params.from;
  let yVaultAddress = dataSource.address();

  let user = loadUser(userAddress);
  let balance = loadUserBalance(userAddress, yVaultAddress);

  if (!balance || !user) {
    return;
  }

  let balanceIncrease = balance.value.lt(event.params.value)
    ? balance.value.neg()
    : event.params.value.neg();

  let nextBalance = createOrUpdateUserBalance(
    userAddress,
    yVaultAddress,
    balanceIncrease,
    "vaultsV1"
  );

  if (nextBalance.value.le(BigInt.fromI32(0))) {
    user.vaultPoolsV1 = exclude(user.vaultPoolsV1, yVaultAddress.toHex());
    deactivateUserIfZeroBalance(user as User);
    user.save();
  }

  let pool = loadVaultPoolV1(yVaultAddress);
  pool.totalTVL = pool.totalTVL.plus(balanceIncrease);
  pool.save();
}
