import { ethers, Signer } from 'ethers';
import React, { useEffect, useState } from 'react';
import * as Etebase from 'etebase';
import { Box, Button, TextInput } from 'grommet';
import { Logout } from 'grommet-icons';

const ETEBASE_URL = "https://api.etebase.com/developer/robertosnap/"
const FALLBACK_USERNAME = "PUBLIC_ACCOUNT"
const FALLBACK_PASSWORD = "PASSWORD"
const FALLBACK_EMAIL = "noreply@blockchangers.com"
interface EtebaseContextProps {
    signer?: Signer;
    useFallback?: boolean;
    deferRender?: boolean;
    deferSigning?: boolean;
    autoInit?: boolean;
    useLocalstorage?: boolean
}

export type EtebaseAccountContext = [
    Etebase.Account | undefined,
    boolean,
    string[]
]

export type EtebaseConnectionContext = {
    initialized: boolean,
    useFallback: boolean,
    deferRender: boolean,
    autoInit: boolean,
    useLocalstorage: boolean,
    useingFallback: boolean,
    init: () => void,
    setUseFallback: (value: boolean) => void,
    setUseLocalstorage: (value: boolean) => void,
    logout: () => void
}


// export const IdentityContext = React.createContext<PrivateKey | undefined>(undefined);
// export const BucketContext = React.createContext<[Buckets | undefined, boolean, string[]]>([undefined, false, []]);
// export const ClientContext = React.createContext<[Client | undefined, boolean, string[]]>([undefined, false, []]);
// export const KeysContext = React.createContext<{ [name: string]: string }>({});
// export const FallbackContext = React.createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([true, () => { }]);
// export const InitializedBucketsContext = React.createContext<[boolean, () => void]>([false, () => { }]);
// export const InitializedClientContext = React.createContext<[boolean, () => void]>([false, () => { }]);
export const EtebaseAccountContext = React.createContext<EtebaseAccountContext>([undefined, false, []]);
export const EtebaseConnectionContext = React.createContext<EtebaseConnectionContext>({
    setUseLocalstorage: (x: boolean) => { throw Error("Etebase not rendered") },
    setUseFallback: (x: boolean) => { throw Error("Etebase not rendered") },
    logout: () => { throw Error("Etebase not rendered") },
    init: () => { throw Error("Etebase not rendered") },
    autoInit: false,
    deferRender: false,
    useFallback: false,
    initialized: false,
    useLocalstorage: false,
    useingFallback: false,
});

export const EtebaseContext: React.FC<EtebaseContextProps> = ({
    useFallback: _useFallback = true,
    deferRender = false,
    deferSigning = true, // TODO: NOT DOING ANYTHING
    autoInit = true,
    useLocalstorage: _useLocalstorage = true,
    ...props
}) => {
    const [initialized, setInitialized] = useState(false);
    const [useFallback, setUseFallback] = useState<boolean>(_useFallback);
    const [useLocalstorage, setUseLocalstroage] = useState<boolean>(_useLocalstorage);
    const [loading, setLoading] = useState(false);
    const [requireEmail, setRequireEmail] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [etebaseAccount, setEtebaseAccount] = useState<Etebase.Account>();
    const [useingFallback, setUseingFallback] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    // useEffect(() => {
    //     const doAsync = async () => {
    //         console.log("etebaseAccount in contexrt!", etebaseAccount)
    //     };
    //     doAsync();
    // }, [etebaseAccount])

    const persistEtebaseAccount = async (etebaseAccount?: Etebase.Account, fallback = false): Promise<void> => {
        if (useLocalstorage && etebaseAccount) {
            const key = fallback ? "etebase-account-fallback" : "etebase-account";
            const session = await etebaseAccount.save()
            localStorage.setItem(key, session)
        }
        setEtebaseAccount(etebaseAccount)
        setUseingFallback(fallback)
    }
    const restoreEtebaseAccount = async (fallback = false): Promise<Etebase.Account | undefined> => {
        let etebase = undefined
        const key = fallback ? "etebase-account-fallback" : "etebase-account";
        const cached = localStorage.getItem(key);
        if (cached) {
            etebase = await Etebase.Account.restore(cached);
        }
        return etebase
    }

    const deleteEtebaseLocalstorage = async (): Promise<void> => {
        localStorage.removeItem("etebase-account")
        localStorage.removeItem("etebase-account-fallback")
    }

    const logout = async (): Promise<void> => {
        await deleteEtebaseLocalstorage()
        if (etebaseAccount)
            await etebaseAccount.logout()
    }

    const getEtebaseAccount = async (): Promise<[Etebase.Account | undefined, boolean]> => {
        if (useLocalstorage) {
            const fromLocalstorage = await restoreEtebaseAccount()
            if (fromLocalstorage) {
                console.debug("Got Etebase account from localstorage")
                return [fromLocalstorage, false]
            } else if (useFallback) {
                const fromLocalstorage = await restoreEtebaseAccount(true)
                if (fromLocalstorage) {
                    console.debug("Got Etebase fallback account from localstorage")
                    return [fromLocalstorage, true]
                }
            }
        }
        if (props.signer) {
            const username = await props.signer.getAddress()
            const password = await getPasswordFromSigner(props.signer)
            const personalEtebaseAccount = await Etebase.Account.login(username, password).catch(_ => {
                console.debug("Could not login with personal account, require email.")
                setRequireEmail(true)
                setUsername(username)
                setPassword(password)
                return undefined
            })
            if (personalEtebaseAccount) {
                console.debug("Got Etebase account from signer")
                return [personalEtebaseAccount, false]
            }
        } else if (useFallback) {
            const fallbackAccount = await Etebase.Account.login(FALLBACK_USERNAME, FALLBACK_PASSWORD).catch(err => {
                return Etebase.Account.signup({ username: FALLBACK_USERNAME, email: FALLBACK_EMAIL }, FALLBACK_PASSWORD).catch((err: Error) => {
                    console.debug(err.message)
                    return undefined
                })
            })
            if (fallbackAccount) {
                console.debug("Got Etebase account from fallback")
                return [fallbackAccount, true]
            }
        }
        return [undefined, false]
    }

    const init = async () => {
        setLoading(true)
        const [etebaseAccount, fallback] = await getEtebaseAccount()
        if (etebaseAccount) {
            persistEtebaseAccount(etebaseAccount, fallback)
            setInitialized(true);
        }
        setLoading(false)
    }


    const getPasswordFromSigner = async (signer: Signer): Promise<string> => {
        const message = getMessageToSign(await signer.getAddress());
        const signedText = await signer.signMessage(message);
        const hash = ethers.utils.keccak256(signedText).substr(2);
        return hash
    }

    const getMessageToSign = (ethereum_address: string): string => {
        return `Authorize and trust this application to use your storage at ${ETEBASE_URL} on your behalf ${ethereum_address}?`;
    };

    const handleNewUser = async () => {
        console.debug(username, password, email, validateEmail(email))
        if (username && password && email && validateEmail(email)) {
            const etebase = await Etebase.Account.signup({ username: username, email: email }, password).catch(err => {
                throw err
            })
            persistEtebaseAccount(etebase)
        }
    }

    useEffect(() => {
        const doAsync = async () => {
            // run init if autoInit is true and its not intilized
            if (autoInit && !initialized) {
                console.log("Auto initializing storage because its not initialized")
                return init()
            }
            // run init if autoinit is true, signer is something and we dont want to use fallback
            if (autoInit && props.signer) {
                console.log("Auto initializing because signer changed and not useing fallback")
                return init()
            }
        };
        doAsync();
        // eslint-disable-next-line
    }, [props.signer, useFallback, autoInit]);

    if (requireEmail) {
        return (
            <Box direction={"row"}>
                <TextInput value={email} onChange={(e) => setEmail(e.target.value)} ></TextInput>
                <Button label="Create account" onClick={(e) => handleNewUser()}></Button>
            </Box>
        )
    }

    return (
        <EtebaseConnectionContext.Provider value={{ logout: () => logout(), setUseLocalstorage: (x: boolean) => setUseLocalstroage(x), setUseFallback: (x: boolean) => setUseFallback(x), init: () => init(), autoInit, useLocalstorage, initialized, useFallback, deferRender, useingFallback }}>
            <EtebaseAccountContext.Provider value={[etebaseAccount, loading, messages]}>
                {deferRender && initialized && (
                    props.children
                )}
                {deferRender && !initialized && (
                    <p>Loading Etebase</p>
                )}
                {!deferRender && (
                    props.children
                )}
            </EtebaseAccountContext.Provider>
        </EtebaseConnectionContext.Provider>
    );


};


function validateEmail(email: string) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
        return (true)
    }
    return (false)
}