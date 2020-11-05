import { Buckets, PrivateKey } from "@textile/hub";
import { Signer, ethers } from "ethers";
// import { hashSync } from "bcryptjs";
export const generatePrivateKey = async (
  signer: Signer
): Promise<PrivateKey> => {
  // avoid sending the raw secret by hashing it first
  //   const _secret = hashSync(secret, 10);
  //   console.log("secret", _secret);
  const message = getMessage(await signer.getAddress(), "symfoni-demo");
  const signedText = await signer.signMessage(message);
  console.log("signedText", signedText);
  const hash = ethers.utils.keccak256(signedText);
  if (hash === null) {
    throw new Error(
      "No account is provided. Please provide an account to this application."
    );
  }
  // The following line converts the hash in hex to an array of 32 integers.
  // @ts-ignore
  const array = hash
    // @ts-ignore
    .replace("0x", "")
    // @ts-ignore
    .match(/.{2}/g)
    .map((hexNoPrefix: string) =>
      ethers.BigNumber.from("0x" + hexNoPrefix).toNumber()
    );
  console.log("array", array);
  if (array.length !== 32) {
    throw new Error(
      "Hash of signature is not the correct size! Something went wrong!"
    );
  }
  const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array));

  return identity;
};
export const getBucket = async (
  bucketName: string,
  signer?: Signer
): Promise<[Buckets, string]> => {
  // TODO Create identiyy from web3modal
  console.log("Useing random storage identity", !signer);
  const identity = signer
    ? await generatePrivateKey(signer)
    : await PrivateKey.fromRandom();
  console.log("Identity => ", identity);
  const buckets = await Buckets.withKeyInfo({
    key: "biepyo75p2zaavunhyj7ndeydkq",
  }); // TODO Set unsecure key user key from Hub
  await buckets.getToken(identity);
  const bucketResult = await buckets.getOrCreate(bucketName);
  if (!bucketResult.root) {
    throw Error("Failed to open Bucket.");
  }
  if (!bucketResult.root.key) {
    throw Error("Failed to open Bucket root key.");
  }

  return [buckets, bucketResult.root.key];
};

const getMessage = (
  ethereum_address: string,
  application_name: string
): string => {
  return `Authorize ${application_name} to associated your address: ${ethereum_address} to this application?`;
};
