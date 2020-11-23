

import { Box, Button, Grid, Select, Text } from 'grommet';
import React, { useContext, useEffect, useState } from 'react';
import { CurrentAddressContext, HardhatContext, ProviderContext } from './../hardhat/HardhatContext';

interface Props { }

export const Account: React.FC<Props> = () => {
    const [provider] = useContext(ProviderContext)
    const [address] = useContext(CurrentAddressContext)
    const { init, currentHardhatProvider, loading, providers } = useContext(HardhatContext)
    const [selectedProvider, setSelectedProvider] = useState<string>();

    useEffect(() => {
        console.log("Provider in comp", provider)
    }, [provider])
    return (
        <Box gap="small" >

            <Grid gap="small" columns={["auto", "flex"]}>
                <Select
                    options={providers}
                    size="small"
                    value={selectedProvider}
                    onChange={(option) => setSelectedProvider(option.value)}
                ></Select>
                <Button disabled={loading} size="small" label={selectedProvider ? "Connect " + selectedProvider : "Connect"} onClick={() => init(selectedProvider)}></Button>
            </Grid>
            <Box alignContent="end" gap="small">
                {address &&
                    <Text >Connected to: {currentHardhatProvider} with: {address.substr(0, 4) + ".." + address.substring(address.length - 3, address.length)}</Text>
                }
            </Box>
        </Box>
    )
}