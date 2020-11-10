import { Buckets, Client, PrivateKey, ThreadID } from '@textile/hub';
import { ethers, Signer } from 'ethers';
import React, { useEffect, useState } from 'react';

interface TextileContextProps {
    signer?: Signer;
    useFallback?: boolean;
    deferRender?: boolean;
    autoInit?: boolean;
}

export const IdentityContext = React.createContext<PrivateKey | undefined>(undefined);
export const BucketContext = React.createContext<[Buckets | undefined, boolean, string[]]>([undefined, false, []]);
export const ClientContext = React.createContext<[Client | undefined, boolean, string[]]>([undefined, false, []]);
export const KeysContext = React.createContext<{ [name: string]: string }>({});
export const FallbackContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([true, () => { }]);
export const InitializedBucketsContext = React.createContext<[boolean, () => void]>([false, () => { }]);
export const InitializedClientContext = React.createContext<[boolean, () => void]>([false, () => { }]);

export const TextileContext: React.FC<TextileContextProps> = ({
    useFallback = true,
    deferRender = false,
    autoInit = true,
    ...props
}) => {
    const [identity, setIdentity] = useState<PrivateKey>();
    const [buckets, setBuckets] = useState<Buckets>();
    const [bucketsLoading, setBucketsLoading] = useState(false);
    const [bucketsMessages, setBucketsMessages] = useState<string[]>([]);
    const [client, setClient] = useState<Client>();
    const [clientLoading, setClientLoading] = useState(false);
    const [clientMessages, setClientMessages] = useState([]);
    const [keys, setKeys] = useState<{ [name: string]: string }>({});
    const [initializedBuckets, setInitializedBuckets] = useState(false);
    const [initializedClient, setInitializedClient] = useState(false);
    const [fallback, setFallback] = useState(useFallback);


    const initClient = async (_fallback: boolean, signer?: Signer,) => {
        console.log("Running Thread init")
        setClientLoading(true)
        const identity = !_fallback && signer ? await getIdentiyFromSigner(signer) : await PrivateKey.fromRandom();
        setIdentity(identity);
        const threadId = undefined
        console.log("threadId", threadId)
        const client = await Client.withKeyInfo({
            key: 'biepyo75p2zaavunhyj7ndeydkq',
        });
        /* const _token =  */await client.getToken(identity);
        // await client.open(threadId, "app-db")
        await getDb(client, threadId)

        setInitializedBuckets(true);
        setClientLoading(false)
    }

    const getDb = async (_client: Client, threadId?: ThreadID) => {

        if (!threadId) {
            threadId = await _client.newDB(undefined, "hardhat-storage");
        }
        const test = { name: "LOL", _id: "" }
        await _client.newCollectionFromObject(threadId, test, { name: "LAL" })
        const collections = await _client.listCollections(threadId)
        const dbInfo = await _client.getDBInfo(threadId)
        console.log("dbInfo", dbInfo)
        console.log("collections", collections)
        await _client.save(threadId, "LAL", [{ name: "Yo" }])
        const dbInfo2 = await _client.getDBInfo(threadId)
        console.log("dbInfo2", dbInfo2)
    }

    const initBucket = async (_fallback: boolean, signer?: Signer,) => {
        console.log("Running Bucket init")
        setBucketsLoading(true)
        const identity = !_fallback && signer ? await getIdentiyFromSigner(signer) : await PrivateKey.fromRandom();
        setIdentity(identity);
        const buckets = await Buckets.withKeyInfo({
            key: 'biepyo75p2zaavunhyj7ndeydkq',
        });
        /* const _token =  */await buckets.getToken(identity);
        const appPathKey = await getBucketKey(buckets, "app");
        // const roles = new Map()
        // // NA = 0, Reader = 1, Writer = 2, Admin = 3
        // roles.set('*', 3)
        // buckets.pushPathAccessRoles(appPathKey, "", roles)


        console.log("appPathKey", appPathKey)
        const path1 = await buckets.pushPath(appPathKey, "user-" + identity.public.toString(), "Something")
        console.log("path1", path1)
        // const path2 = await buckets.pushPath(appPathKey, "/user-" + identity.public.toString() + "/nested", "SomethingNested")
        // console.log("path2", path2)

        // buckets.pushPathAccessRoles(appPathKey, "user-" + identity.public.toString(), roles)
        // setKeys((old) => ({ ...old, app: key }));
        setBuckets(buckets);
        setInitializedBuckets(true);
        setBucketsLoading(false)
    }

    const getBucketKey = async (buckets: Buckets, bucketName: string) => {
        const bucketResult = await buckets.getOrCreate(bucketName, "app");
        if (!bucketResult.root) {
            throw Error('Failed to open Bucket.');
        }
        if (!bucketResult.root.key) {
            throw Error('Failed to open Bucket root key.');
        }
        return bucketResult.root.key;
    };



    const getMessage = (ethereum_address: string, application_name: string): string => {
        return `Authorize ${application_name} to associated your address: ${ethereum_address} to this application?`;
    };

    const getIdentiyFromSigner = async (signer: Signer): Promise<PrivateKey> => {
        // avoid sending the raw secret by hashing it first
        //   const _secret = hashSync(secret, 10);
        //   console.log("secret", _secret);
        const message = getMessage(await signer.getAddress(), 'symfoni-demo');
        const signedText = await signer.signMessage(message);
        const hash = ethers.utils.keccak256(signedText);
        if (hash === null) {
            throw new Error('No account is provided. Please provide an account to this application.');
        }
        // The following line converts the hash in hex to an array of 32 integers.
        // @ts-ignore
        const array = hash
            // @ts-ignore
            .replace('0x', '')
            // @ts-ignore
            .match(/.{2}/g)
            .map((hexNoPrefix: string) => ethers.BigNumber.from('0x' + hexNoPrefix).toNumber());

        if (array.length !== 32) {
            throw new Error('Hash of signature is not the correct size! Something went wrong!');
        }
        return PrivateKey.fromRawEd25519Seed(Uint8Array.from(array));
    };


    useEffect(() => {
        const doAsync = async () => {
            // run init if autoInit is true and its not intilized
            if (autoInit && !initializedBuckets) {
                console.log("Auto initializing storage because its not initialized")
                return initClient(fallback, props.signer)
            }
            // run init if autoinit is true, signer is something and we dont want to use fallback
            if (autoInit && props.signer && !fallback) {
                console.log("Auto initializing because signer changed and not useing fallback")
                initClient(fallback, props.signer)
            }
        };
        doAsync();
        // eslint-disable-next-line
    }, [props.signer, fallback, initializedBuckets, autoInit]);

    if (deferRender && !initializedBuckets) {
        return <p>Loading Textile</p>;
    }
    return (
        <InitializedBucketsContext.Provider value={[initializedBuckets, () => initBucket(fallback, props.signer)]}>
            <InitializedClientContext.Provider value={[initializedClient, () => initClient(fallback, props.signer)]}>
                <FallbackContext.Provider value={[fallback, setFallback]}>
                    <IdentityContext.Provider value={identity}>
                        <ClientContext.Provider value={[client, clientLoading, clientMessages]}>
                            <BucketContext.Provider value={[buckets, bucketsLoading, bucketsMessages]}>
                                <KeysContext.Provider value={keys}>{props.children}</KeysContext.Provider>
                            </BucketContext.Provider>
                        </ClientContext.Provider>
                    </IdentityContext.Provider>
                </FallbackContext.Provider>
            </InitializedClientContext.Provider>
        </InitializedBucketsContext.Provider>
    );
};
