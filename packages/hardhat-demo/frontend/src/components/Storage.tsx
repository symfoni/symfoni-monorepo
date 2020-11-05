import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Grid, Heading, Text } from 'grommet';
import { BucketContext, FallbackContext, InitializedContext, KeysContext } from '../hardhat/TextileContext';
import { RootObject } from '@textile/hub';

interface Props { }

export const Storage: React.FC<Props> = () => {
    const buckets = useContext(BucketContext)
    const keys = useContext(KeysContext)
    const [fallback, setFallback] = useContext(FallbackContext)
    const [initialized, setInitialized] = useContext(InitializedContext)
    const [folders, setFolders] = useState<RootObject[]>();

    useEffect(() => {
        const doAsync = async () => {
            console.log("Runnign storage")
            if (!buckets) {
                return
            }
            const rootObjects = await buckets.list()
            setFolders(rootObjects)
        };
        doAsync();
    }, [buckets])

    return (
        <Box gap="large">
            <Box border="left" pad="small">
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Initialized </Text>
                    <Text weight="bold">{initialized ? "Initialized" : "Not initialized"}</Text>
                    <Button label="Init" onClick={(e) => setInitialized()}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Storage account: </Text>
                    <Text weight="bold">{fallback ? "Public" : "Wallet"}</Text>
                    <Button label="Toggle" onClick={(e) => setFallback(!fallback)}></Button>
                </Grid>
            </Box>

            <Box border="left" pad="small" gap="small">
                <Heading level="3">Folders</Heading>
                {folders?.map(folder => (
                    <Box>
                        <Text>{folder.name}</Text>
                    </Box>
                ))}
            </Box>

        </Box>
    )
}