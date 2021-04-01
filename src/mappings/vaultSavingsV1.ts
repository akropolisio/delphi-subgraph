import {
  Deposit,
  VaultActivated,
  VaultDisabled,
  VaultRegistered,
} from "../../generated/VaultSavingsV1/VaultSavingsV1";
import { YVaultV1 } from "../../generated/templates";
import {
  createOrUpdateUserBalance,
  createOrUpdateVaultPoolV1,
  loadOrCreateUser,
  loadVaultPoolV1,
  activateUser,
} from "../entities";
import { addUniq } from "../utils";

export function handleVaultRegistered(event: VaultRegistered): void {
  createOrUpdateVaultPoolV1(event.params.vault, event.params.baseToken);
  YVaultV1.create(event.params.vault);
}

export function handleVaultDisabled(event: VaultDisabled): void {
  let vault = loadVaultPoolV1(event.params.vault);
  vault.isActive = false;
  vault.save();
}

export function handleVaultActivated(event: VaultActivated): void {
  let vault = loadVaultPoolV1(event.params.vault);
  vault.isActive = true;
  vault.save();
}

export function handleDeposit(event: Deposit): void {
  let user = loadOrCreateUser(event.params.user);
  user.vaultPoolsV1 = addUniq(user.vaultPoolsV1, event.params.vault.toHex());
  user.visitedVaultPoolsV1 = addUniq(
    user.visitedVaultPoolsV1,
    event.params.vault.toHex()
  );
  activateUser(user);
  user.save();

  let vaultPool = loadVaultPoolV1(event.params.vault);
  vaultPool.totalTVL = vaultPool.totalTVL.plus(event.params.lpAmount);
  vaultPool.save();

  createOrUpdateUserBalance(
    event.params.user,
    event.params.vault,
    event.params.lpAmount,
    "vaultsV1"
  );
}
