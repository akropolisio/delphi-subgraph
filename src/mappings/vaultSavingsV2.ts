import {
  Deposit,
  VaultActivated,
  VaultDisabled,
  VaultRegistered,
} from "../../generated/VaultSavingsV2/VaultSavingsV2";
import { YearnAToken } from "../../generated/VaultSavingsV2/YearnAToken";
import { YearnAToken as YearnATokenTemplate } from "../../generated/templates";
import { createOrUpdateVaultPoolV2, loadVaultPoolV2 } from "../entities";

export function handleVaultRegistered(event: VaultRegistered): void {
  let AToken = YearnAToken.bind(event.params.vault);
  let bestVault = AToken.try_bestVault();

  // check that vault is an affiliate token
  if (!bestVault.reverted) {
    createOrUpdateVaultPoolV2(event.params.vault, event.params.baseToken);

    YearnATokenTemplate.create(event.params.vault);
  }
}

export function handleVaultDisabled(event: VaultDisabled): void {
  let vault = loadVaultPoolV2(event.params.vault);

  if (vault) {
    vault.isActive = false;
    vault.save();
  }
}

export function handleVaultActivated(event: VaultActivated): void {
  let vault = loadVaultPoolV2(event.params.vault);

  if (vault) {
    vault.isActive = true;
    vault.save();
  }
}
