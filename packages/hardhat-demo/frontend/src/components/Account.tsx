import { Box, Text } from 'grommet';
import React, { useContext, useEffect } from 'react';
import { CurrentAddressContext } from './../hardhat/HardhatContext';

interface Props { }

export const Account: React.FC<Props> = () => {
    const [address] = useContext(CurrentAddressContext)


    useEffect(() => {
        const doAsync = async () => {

        };
        doAsync();
    }, [])

    return (
        <Box>
            <Text>{address.substr(0, 4) + ".." + address.substring(address.length - 3, address.length)}</Text>
        </Box>
    )
}