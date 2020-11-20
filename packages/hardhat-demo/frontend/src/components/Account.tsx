

import { Box, Text } from 'grommet';
import React, { useContext, useEffect } from 'react';
import { CurrentAddressContext, HardhatContext, ProviderContext } from './../hardhat/HardhatContext';

interface Props { }

export const Account: React.FC<Props> = () => {
    const [provider] = useContext(ProviderContext)
    const [address] = useContext(CurrentAddressContext)
    const { init } = useContext(HardhatContext)

    useEffect(() => {
        console.log("Provider in comp", provider)
    }, [provider])
    return (
        <Box pad="small" background="red" onClick={() => init()}>
            <Text >{address.substr(0, 4) + ".." + address.substring(address.length - 3, address.length)}</Text>
        </Box>
    )
}