import { Address } from "@graphprotocol/graph-ts";

export let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let SINGLE_ENTITY_ID = "ID";

let MAINNET_VAULTS_V2: string[] = [
  "0x19d3364a399d251e894ac732651be8b0e4e85001",
  "0x5f18c75abdae578b483e5f43f12a39cf75b973a9",
  "0xe11ba472f74869176652c35d30db89854b5ae84d",
  "0xdcd90c7f6324cfa40d7169ef80b12031770b4325",
];

let MAINNET_VAULTS_V1: string[] = [
  "0x2994529c0652d127b7842094103715ec5299bbed",
  "0x5dbcf33d8c2e976c6b560249878e6f1491bca25c",
  "0x629c759d1e83efbf63d84eb3868b564d9521c129",
  "0x7ff566e1d69deff32a7b244ae7276b9f90e9d0f6",
  "0x9ca85572e6a3ebf24dedd195623f188735a5179f",
];

let RINKEBY_VAULTS_V2: string[] = [
  "0x559af2944335b5cd65f78ab02123738bc57cfd7d",
  "0x56b67edb6075fed8bfda345330d6a71485aae548",
];

let RINKEBY_VAULTS_V1: string[] = [
  "0x075694393defc3ae2851ed4de91beab5e5eea27b",
  "0x1661260f532898ae9fb487a98e5dcda5ba9fc905",
  "0x5599b73bbe6ae502a213b916c92d0fccba08227f",
  "0x5e4fb7b755cacf845078c169c0e5446c673a1c21",
  "0xd039b464015eb166a5d55ea88382869ff4dafbc5",
];

export let SUPPORTED_VAULTS: Address[] = MAINNET_VAULTS_V2.concat(
  MAINNET_VAULTS_V1
)
  .concat(RINKEBY_VAULTS_V2)
  .concat(RINKEBY_VAULTS_V1)
  .map<Address>((address: string) => Address.fromString(address));
