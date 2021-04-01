import { Address } from "@graphprotocol/graph-ts";

import { Token } from "../../../generated/schema";
import { ERC20Detailed } from "../../../generated/SavingsModule/ERC20Detailed";

export function createToken(address: Address): Token {
  let token = new Token(address.toHex());

  let contract = ERC20Detailed.bind(address);

  token.name = contract.name();
  token.decimals = contract.decimals();
  token.symbol = contract.symbol();

  token.save();

  return token;
}
