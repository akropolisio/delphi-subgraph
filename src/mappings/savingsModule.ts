import { Address, BigInt, ethereum, dataSource } from "@graphprotocol/graph-ts";

import {
  Deposit,
  ProtocolRegistered,
  RewardDistribution,
  SavingsModule,
  Withdraw,
  YieldDistribution,
} from "../../generated/Contracts/SavingsModule";
import { DefiProtocol } from "../../generated/Contracts/DefiProtocol";
import { SavingsPoolToken } from "../../generated/SavingsModule/SavingsPoolToken";
import {
  createOrUpdateSavingsPool,
  loadSavingsPool,
  createSPoolBalance,
  loadSPoolBalance,
  loadSubgraphConfig,
  createSPoolApr,
  loadOrCreateUser,
  loadSPoolApr,
  updateSavingsRewardDistributionDates,
  createSRewardFromSavingsModuleEvent,
  loadGlobalStat,
  createOrUpdateDepositedBalance,
} from "../entities";
import { calcAPY, addUniq, exclude, Modules } from "../utils";
import { deactivateUserIfZeroBalance } from "./deactivateUserIfZeroBalance";
import { activateUser } from "./activateUser";

export function handleProtocolRegistered(event: ProtocolRegistered): void {
  createOrUpdateSavingsPool(
    event,
    event.params.protocol,
    event.params.poolToken
  );
}

export function handleRewardDistribution(event: RewardDistribution): void {
  let savingsModuleAddress = dataSource.address();
  let contract = SavingsModule.bind(savingsModuleAddress);
  let savingsPoolAddress = contract.protocolByPoolToken(event.params.poolToken);

  updateSavingsRewardDistributionDates(event, savingsPoolAddress);
  createSRewardFromSavingsModuleEvent(event, savingsPoolAddress);
}

export function handleYieldDistribution(event: YieldDistribution): void {
  let savingsModuleAddress = dataSource.address();
  let contract = SavingsModule.bind(savingsModuleAddress);
  let savingsPoolAddress = contract.protocolByPoolToken(event.params.poolToken);

  updatePoolBalances(event, savingsPoolAddress);
  createSPoolAprOnYieldDistribution(
    event,
    savingsPoolAddress,
    event.params.amount
  );

  let globalStat = loadGlobalStat();
  globalStat.totalYieldEarned = globalStat.totalYieldEarned.plus(
    event.params.amount
  );
  globalStat.save();
}

export function handleDeposit(event: Deposit): void {
  let user = loadOrCreateUser(event.params.user);
  user.savingsPools = addUniq(user.savingsPools, event.params.protocol.toHex());
  activateUser(user);
  user.save();

  createOrUpdateDepositedBalance(
    event.params.user,
    event.params.protocol,
    event.params.nAmount,
    Modules.savings
  );
}

export function handleWithdraw(event: Withdraw): void {
  let user = loadOrCreateUser(event.params.user);
  let pool = loadSavingsPool(event.params.protocol);
  let contract = SavingsPoolToken.bind(Address.fromString(pool.lpToken));
  let userBalance = contract.fullBalanceOf(event.params.user);

  if (userBalance.le(BigInt.fromI32(0))) {
    user.savingsPools = exclude(
      user.savingsPools,
      event.params.protocol.toHex()
    );
    deactivateUserIfZeroBalance(user);
    user.save();
  }

  createOrUpdateDepositedBalance(
    event.params.user,
    event.params.protocol,
    event.params.nAmount.neg(),
    Modules.savings
  );
}

function createSPoolAprOnYieldDistribution(
  event: ethereum.Event,
  poolAddress: Address,
  yieldAmount: BigInt
): void {
  let config = loadSubgraphConfig();

  let pool = loadSavingsPool(poolAddress);
  let prevAPR = loadSPoolApr(pool.apr);

  let duration = event.block.timestamp
    .minus(prevAPR.date)
    .plus(BigInt.fromI32(1));

  let isSecondDistributionEvent = prevAPR.txHash.equals(event.transaction.hash);

  let initialBalance = isSecondDistributionEvent
    ? loadSPoolBalance(pool.balance).amount.minus(yieldAmount)
    : loadSPoolBalance(pool.prevBalance).amount;

  let apy =
    !initialBalance.isZero() && !yieldAmount.isZero()
      ? calcAPY(
          duration,
          initialBalance,
          initialBalance.plus(yieldAmount),
          config.aprDecimals
        )
      : BigInt.fromI32(0);

  pool.apr = createSPoolApr(event, duration, apy, pool.id).id;
  pool.save();
}

function updatePoolBalances(event: ethereum.Event, poolAddress: Address): void {
  let pool = loadSavingsPool(poolAddress);
  let poolBalance = loadSPoolBalance(pool.balance);

  if (poolBalance.date.equals(event.block.timestamp)) {
    return;
  }

  let lpTokenContract = SavingsPoolToken.bind(
    Address.fromString(pool.lpToken)
  );
  let contract = DefiProtocol.bind(poolAddress);

  let totalSupply = lpTokenContract.totalSupply();
  let normalizedBalance = contract.normalizedBalance();

  let balance = totalSupply.gt(normalizedBalance)
    ? totalSupply
    : normalizedBalance;

  let currentBalance = createSPoolBalance(event, balance, pool.id);

  pool.prevBalance = pool.balance;
  pool.balance = currentBalance.id;

  pool.save();
}
