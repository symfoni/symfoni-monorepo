import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Grid, Heading, Text } from 'grommet';
import { SpinnerCircular } from 'spinners-react';
import { EtebaseAccountContext, EtebaseConnectionContext } from '../hardhat/EtebaseContext';


interface Props { }

export const Etebase: React.FC<Props> = () => {
    const { initialized, init, setUseFallback, logout, useFallback, useingFallback, setUseLocalstorage, useLocalstorage } = useContext(EtebaseConnectionContext)
    const [etebaseAccount, loading, messages] = useContext(EtebaseAccountContext)
    useEffect(() => {
        const doAsync = async () => {
            if (etebaseAccount) {
                // const collectionManager = etebaseAccount.getCollectionManager();
                // const collection = await collectionManager.create("cyberdyne.calendar",
                //     {
                //         name: "Holidays",
                //         description: "My holiday calendar",
                //         color: "#23aabbff",
                //     },
                //     "" // Empty content
                // );
                // await collectionManager.upload(collection);
                // const collections = await collectionManager.list("test");
                // console.log(collections)
            }
        };
        doAsync();
    }, [etebaseAccount])
    return (
        <Box gap="large">
            <Box border="left" pad="small">
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Initialized </Text>
                    <Text weight="bold">{initialized ? "Initialized" : "Not initialized"}</Text>
                    <Button label="Init" icon={loading ? <SpinnerCircular size="20px"></SpinnerCircular> : <></>} disabled={loading} reverse={true} onClick={(e) => init()}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Useing fallback</Text>
                    <Text weight="bold">{useingFallback ? "True" : "False"}</Text>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Use fallback account</Text>
                    <Text weight="bold">{useFallback ? "True" : "False"}</Text>
                    <Button label="Toggle" onClick={(e) => setUseFallback(!useFallback)}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Use localstorage</Text>
                    <Text weight="bold">{useLocalstorage ? "True" : "False"}</Text>
                    <Button label="Toggle" onClick={(e) => setUseLocalstorage(!useLocalstorage)}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Logout</Text>
                    <Text weight="bold"></Text>
                    <Button label="Logout" onClick={(e) => logout()}></Button>
                </Grid>
            </Box>

            {etebaseAccount &&
                <Box border="left" pad="small">
                    <Grid columns={["auto", "flex"]} gap="small" margin="small" align="center">
                        <Text>Username</Text>
                        <Text weight="bold">{etebaseAccount.user.username}</Text>
                    </Grid>
                    <Grid columns={["auto", "flex"]} gap="small" margin="small" align="center">
                        <Text>Username</Text>
                        <Text weight="bold">{etebaseAccount.user.email}</Text>
                    </Grid>
                    <Grid columns={["auto", "flex"]} gap="small" margin="small" align="center">
                        <Text>Server</Text>
                        <Text weight="bold">{etebaseAccount.serverUrl}</Text>
                    </Grid>
                    <Grid columns={["auto", "flex"]} gap="small" margin="small" align="center">
                        <Text>Token</Text>
                        <Text weight="bold">{etebaseAccount.authToken}</Text>
                    </Grid>
                </Box>
            }

            <Box border="left" pad="small" gap="small">
                <Heading level="3">Files and folders</Heading>
            </Box>

        </Box>
    )
}