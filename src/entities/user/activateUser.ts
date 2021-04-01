import { User } from "../../../generated/schema";
import { loadGlobalStat } from "../loadGlobalStats";

export function activateUser(user: User): void {
  if (!user.active) {
    let globalStat = loadGlobalStat();
    globalStat.activeMembersCount += 1;
    globalStat.save();

    user.active = true;
  }
}
