import { Box, Text } from 'grommet';
import React, { useContext, useEffect } from 'react';
import { CurrentAddressContext, ProviderContext } from '../BuidlerSymfoniReact';

interface Props { }

export const Account: React.FC<Props> = () => {
    const [provider] = useContext(ProviderContext)
    const [address] = useContext(CurrentAddressContext)

    useEffect(() => {
        console.log("Provider in comp", provider)
    }, [provider])
    return (
        <Box>
            <Text>{address.substr(0, 4) + ".." + address.substring(address.length - 3, address.length)}</Text>
        </Box>
    )
}