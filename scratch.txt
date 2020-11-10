import { Buckets, PrivateKey } from '@textile/hub';
import { ethers, Signer } from 'ethers';
import React, { useEffect, useState } from 'react';

interface TextileContextProps {
    signer?: Signer;
    useFallback?: boolean;
    deferRender?: boolean;
    autoInit?: boolean;
}

export const IdentityContext = React.createContext<PrivateKey | undefined>(undefined);
export const BucketContext = React.createContext<Buckets | undefined>(undefined);
export const KeysContext = React.createContext<{ [name: string]: string }>({});
export const FallbackContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([true, () => { }]);
export const InitializedContext = React.createContext<[boolean, () => void]>([false, () => { }]);

export const TextileContext: React.FC<TextileContextProps> = ({
    useFallback = true,
    deferRender = false,
    autoInit = true,
    ...props
}) => {
    const [identity, setIdentity] = useState<PrivateKey>();
    const [buckets, setBuckets] = useState<Buckets>();
    const [keys, setKeys] = useState<{ [name: string]: string }>({});
    const [initialized, setInitialized] = useState(false);
    const [fallback, setFallback] = useState(useFallback);


    const init = async (_fallback: boolean, signer?: Signer,) => {
        console.log("Running storage init")
        const identity = !_fallback && signer ? await getIdentiyFromSigner(signer) : await PrivateKey.fromRandom();
        setIdentity(identity);
        const buckets = await Buckets.withKeyInfo({
            key: 'biepyo75p2zaavunhyj7ndeydkq',
        });
        /* const _token =  */await buckets.getToken(identity);
        const key = await getBucketKey(buckets, 'app');
        setBuckets(buckets);
        setKeys((old) => ({ ...old, app: key }));
        setInitialized(true);
    }

    const getBucketKey = async (buckets: Buckets, bucketName: string) => {
        const bucketResult = await buckets.getOrCreate(bucketName);
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
            if (autoInit && !initialized) {
                console.log("Auto initializing storage because its not initialized")
                return init(fallback, props.signer)
            }
            // run init if autoinit is true, signer is something and we dont want to use fallback
            if (autoInit && props.signer && !fallback) {
                console.log("Auto initializing because signer changed and not useing fallback")
                init(fallback, props.signer)
            }
        };
        doAsync();
        // eslint-disable-next-line
    }, [props.signer, fallback, initialized, autoInit]);

    if (deferRender && !initialized) {
        return <p>Loading Textile</p>;
    }
    return (
        <InitializedContext.Provider value={[initialized, () => init(fallback, props.signer)]}>
            <FallbackContext.Provider value={[fallback, setFallback]}>
                <BucketContext.Provider value={buckets}>
                    <IdentityContext.Provider value={identity}>
                        <KeysContext.Provider value={keys}>{props.children}</KeysContext.Provider>
                    </IdentityContext.Provider>
                </BucketContext.Provider>
            </FallbackContext.Provider>
        </InitializedContext.Provider>
    );
};
