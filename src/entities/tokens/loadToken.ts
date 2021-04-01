import { Address } from "@graphprotocol/graph-ts";

import { Token } from "../../../generated/schema";
import { createToken } from "./createToken";

export function loadToken(address: Address): Token {
  let token = Token.load(address.toHex());

  if (!token) {
    return createToken(address);
  }

  return token as Token;
}
