import { Box, Text } from 'grommet';
import React, { useContext, useEffect } from 'react';
import { CurrentAddressContext, ProviderContext } from './../hardhat/HardhatContext';
import * as Etebase from 'etebase';

const ETEBASE_URL = "https://api.etebase.com/developer/robertosnap"
interface Props { }

export const Account: React.FC<Props> = () => {
    const [provider] = useContext(ProviderContext)
    const [address] = useContext(CurrentAddressContext)


    useEffect(() => {
        const doAsync = async () => {

        };
        doAsync();
    }, [])

    const etebase = async () => {
        const savedSession = localStorage.getItem("etebase-account")
        if (savedSession) {

        }
    }
    return (
        <Box>
            <Text>{address.substr(0, 4) + ".." + address.substring(address.length - 3, address.length)}</Text>
        </Box>
    )
}