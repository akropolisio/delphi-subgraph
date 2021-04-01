import { Address, BigInt, dataSource, log } from "@graphprotocol/graph-ts";

import { Transfer } from "../../generated/templates/YearnAToken/YearnAToken";
import { User } from "../../generated/schema";
import {
  createOrUpdateUserBalance,
  loadOrCreateUser,
  loadUser,
  deactivateUserIfZeroBalance,
  activateUser,
} from "../entities";
import { addUniq, exclude, ZERO_ADDRESS } from "../utils";

let zeroAddress = Address.fromString(ZERO_ADDRESS);

export function handleTransfer(event: Transfer): void {
  let from = event.params.from;
  let to = event.params.to;
  let vaultPoolAddress = dataSource.address();

  // transfer or mint to User
  if (!to.equals(zeroAddress)) {
    let user = loadOrCreateUser(to);
    user.vaultPoolsV2 = addUniq(user.vaultPoolsV2, vaultPoolAddress.toHex());
    user.visitedVaultPoolsV2 = addUniq(
      user.visitedVaultPoolsV2,
      vaultPoolAddress.toHex()
    );
    activateUser(user);
    user.save();

    createOrUpdateUserBalance(
      to,
      vaultPoolAddress,
      event.params.value,
      "vaultsV2"
    );
  }

  // transfer or burn from User
  if (!from.equals(zeroAddress)) {
    let user = loadUser(from);

    if (user) {
      let nextBalance = createOrUpdateUserBalance(
        from,
        vaultPoolAddress,
        event.params.value.neg(),
        "vaultsV2"
      );

      if (nextBalance.value.le(BigInt.fromI32(0))) {
        user.vaultPoolsV2 = exclude(
          user.vaultPoolsV2,
          vaultPoolAddress.toHex()
        );
        deactivateUserIfZeroBalance(user as User);
        user.save();
      }
    } else {
      log.error(
        "Unknown User {} makes a Transfer or Burn. YearnAToken: {}, receiver: {}",
        [from.toHex(), vaultPoolAddress.toHex(), to.toHex()]
      );
    }
  }
}
