import { ethers, Signer } from 'ethers';
import React, { useEffect, useState } from 'react';
import * as Etebase from 'etebase';
import { Box, Button, TextInput } from 'grommet';
import { Logout } from 'grommet-icons';
import { RegisterEmail } from '../components/etebase/RegisterEmail';

const ETEBASE_URL = "https://api.etebase.com/developer/robertosnap/"
const FALLBACK_USERNAME = "PUBLIC_ACCOUNT"
const FALLBACK_PASSWORD = "PASSWORD"
const FALLBACK_EMAIL = "noreply@blockchangers.com"

export interface RegisterEmailProps {
    setEmail: (email: string) => void,
    onSubmit: () => Promise<Etebase.Account>
}
interface EtebaseContextProps {
    signer?: Signer;
    useFallback?: boolean;
    deferRender?: boolean;
    deferSigning?: boolean;
    autoInit?: boolean;
    useLocalstorage?: boolean
    registerEmailComponent?: React.FC<RegisterEmailProps>
}

export type EtebaseAccountContext = [
    Etebase.Account | undefined,
    boolean,
    string[]
]

export type EtebaseConnectionContext = {
    initialized: boolean,
    deferRender: boolean,
    autoInit: boolean,
    useLocalstorage: boolean,
    init: () => void,
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
    logout: () => { throw Error("Etebase not rendered") },
    init: () => { throw Error("Etebase not rendered") },
    autoInit: false,
    deferRender: false,
    initialized: false,
    useLocalstorage: false,
});

export const EtebaseContext: React.FC<EtebaseContextProps> = ({
    deferRender = false,
    deferSigning = true, // TODO: NOT DOING ANYTHING
    autoInit = true,
    useLocalstorage: _useLocalstorage = true,
    ...props
}) => {
    const [initialized, setInitialized] = useState(false);
    const [useLocalstorage, setUseLocalstroage] = useState<boolean>(_useLocalstorage);
    const [loading, setLoading] = useState(false);
    const [requireEmail, setRequireEmail] = useState(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [etebaseAccount, setEtebaseAccount] = useState<Etebase.Account>();
    const [messages, setMessages] = useState<string[]>([]);


    const persistEtebaseAccount = async (etebaseAccount?: Etebase.Account): Promise<void> => {
        if (useLocalstorage && etebaseAccount) {
            const session = await etebaseAccount.save()
            localStorage.setItem("etebase-account", session)
        }
        setEtebaseAccount(etebaseAccount)
    }
    const restoreEtebaseAccount = async (): Promise<Etebase.Account | undefined> => {
        let etebase = undefined
        const cached = localStorage.getItem("etebase-account");
        if (cached) {
            etebase = await Etebase.Account.restore(cached);
        }
        return etebase
    }

    const deleteEtebaseLocalstorage = async (): Promise<void> => {
        localStorage.removeItem("etebase-account")
    }

    const logout = async (): Promise<void> => {
        await deleteEtebaseLocalstorage()
        if (etebaseAccount)
            await etebaseAccount.logout()
    }

    const getEtebaseAccount = async (): Promise<Etebase.Account | undefined> => {
        if (useLocalstorage) {
            const fromLocalstorage = await restoreEtebaseAccount()
            if (fromLocalstorage) {
                console.debug("Got Etebase account from localstorage")
                return fromLocalstorage
            }
        }
        if (props.signer) {
            const username = await props.signer.getAddress()
            const password = await getPasswordFromSigner(props.signer)
            const personalEtebaseAccount = await Etebase.Account.login(username, password, ETEBASE_URL).catch(_ => {
                console.debug("Could not login with personal account, require email.")
                setRequireEmail(true)
                setUsername(username)
                setPassword(password)
                return undefined
            })
            if (personalEtebaseAccount) {
                console.debug("Got Etebase account from signer")
                return personalEtebaseAccount
            }
        }
        return undefined
    }

    const init = async () => {
        setLoading(true)
        const etebaseAccount = await getEtebaseAccount()
        if (etebaseAccount) {
            persistEtebaseAccount(etebaseAccount)
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
        return `Authorize and trust this application to use your storage at ${ETEBASE_URL} on your ${ethereum_address} behalf?`;
    };

    const handleNewUser = async (): Promise<Etebase.Account> => {
        console.debug(username, password, email, validateEmail(email))
        const emailValid = validateEmail(email)
        if (!emailValid) throw Error("Email not valid.")
        if (username && password && email) {
            try {
                const etebaseAccount = await Etebase.Account.signup({ username: username, email: email }, password, ETEBASE_URL).catch(err => {
                    throw err
                })
                setRequireEmail(false)
                persistEtebaseAccount(etebaseAccount)
                return etebaseAccount
            } catch (error) {
                console.debug("Error async", error)
                throw error
            }

        } else {
            throw Error("Username, password or email was not set. Username and Password is derived from Web3Modal.")
        }
    }

    useEffect(() => {
        const doAsync = async () => {
            if (autoInit && props.signer) {
                console.debug("Auto initializing")
                return init()
            }
        };
        doAsync();
    }, [props.signer, autoInit]);

    if (requireEmail) {
        if (props.registerEmailComponent) {
            return (
                <props.registerEmailComponent setEmail={setEmail} onSubmit={handleNewUser}></props.registerEmailComponent>
            )
        } else {
            return <RegisterEmail setEmail={setEmail} onSubmit={handleNewUser}></RegisterEmail>
        }
    }

    return (
        <EtebaseConnectionContext.Provider value={{ logout: () => logout(), setUseLocalstorage: (x: boolean) => setUseLocalstroage(x), init: () => init(), autoInit, useLocalstorage, initialized, deferRender }}>
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