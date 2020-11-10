import { Box, Button, Grid, Text } from 'grommet';
import React, { useContext, useEffect, useState } from 'react';
import { SpinnerCircular } from 'spinners-react';
import { ClientContext, FallbackContext, InitializedClientContext } from '../hardhat/TextileContext';

interface Props { }


export const Database: React.FC<Props> = () => {
    const [client, clientLoading] = useContext(ClientContext)
    const [fallback, setFallback] = useContext(FallbackContext)
    const [initialized, setInitialized] = useContext(InitializedClientContext)
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [filesAndFolders, setFilesAndFolders] = useState<any>([]);

    useEffect(() => {
        const doAsync = async () => {
            setLoadingCollections(true)
            if (!client) {
                return
            }

            setLoadingCollections(false)

        };
        doAsync();
    }, [client])

    return (
        <Box gap="large">
            <Box border="left" pad="small">
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Initialized DB</Text>
                    <Text weight="bold">{initialized ? "Initialized" : "Not initialized"}</Text>
                    <Button label="Init" icon={clientLoading ? <SpinnerCircular size="20px"></SpinnerCircular> : <></>} disabled={clientLoading} reverse={true} onClick={(e) => setInitialized()}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>DB account: </Text>
                    <Text weight="bold">{fallback ? "Public (random)" : "Wallet"}</Text>
                    <Button label="Toggle" onClick={(e) => setFallback(!fallback)}></Button>
                </Grid>
            </Box>


        </Box>
    )
}