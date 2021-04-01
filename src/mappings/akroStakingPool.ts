import { dataSource } from "@graphprotocol/graph-ts";

import { Staked, Unstaked } from "../../generated/AKROStakingPool/StakingPool";
import {
  createOrUpdateUserBalance,
  loadOrCreateUser,
  activateUser,
  deactivateUserIfZeroBalance,
} from "../entities";
import { addUniq, exclude } from "../utils";

export function handleStaked(event: Staked): void {
  let user = loadOrCreateUser(event.params.user);
  user.stakingPools = addUniq(user.stakingPools, dataSource.address().toHex());
  activateUser(user);
  user.save();

  createOrUpdateUserBalance(
    event.params.user,
    dataSource.address(),
    event.params.amount,
    "staking"
  );
}

export function handleUnstake(event: Unstaked): void {
  let user = loadOrCreateUser(event.params.user);
  user.stakingPools = exclude(user.stakingPools, dataSource.address().toHex());
  deactivateUserIfZeroBalance(user);
  user.save();

  createOrUpdateUserBalance(
    event.params.user,
    dataSource.address(),
    event.params.amount.neg(),
    "staking"
  );
}
