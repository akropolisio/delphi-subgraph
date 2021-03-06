import { store } from "@graphprotocol/graph-ts";

import { User } from "../../generated/schema";
import { loadGlobalStat } from "../entities/loadGlobalStats";

export function deactivateUserIfZeroBalance(user: User): void {
  let areAllUserPoolsEmpty = !user.stakingPools.length && !user.savingsPools.length && !user.vaults.length;
  if (user.active && areAllUserPoolsEmpty) {
    let globalStat = loadGlobalStat();
    globalStat.activeMembersCount -= 1;
    globalStat.save();

    user.active = false;
  }
}
