import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Grid, Heading, Text } from 'grommet';
import { BucketContext, FallbackContext, InitializedBucketsContext, KeysContext } from '../hardhat/TextileContext';
import { PathObject, RootObject } from '@textile/hub';
import { SpinnerCircular } from 'spinners-react';

interface Props { }


interface FileOrFolder extends PathObject {
    name: string,
    children: FileOrFolder[]
}

export const Storage: React.FC<Props> = () => {
    const [buckets, bucketsLoading] = useContext(BucketContext)
    const [fallback, setFallback] = useContext(FallbackContext)
    const [initialized, setInitialized] = useContext(InitializedBucketsContext)
    const [loadingFiles, setloadingFiles] = useState(false);
    const [filesAndFolders, setFilesAndFolders] = useState<FileOrFolder[]>([]);

    useEffect(() => {
        const doAsync = async () => {
            setloadingFiles(true)
            if (!buckets) {
                return
            }
            console.log("Runnign storage")
            const rootObjects = await buckets.list()
            console.log(rootObjects)
            let _filesAndFolders: FileOrFolder[] = []
            _filesAndFolders = await Promise.all(rootObjects.map(async root => {
                const childrenPaths = await buckets.listPathFlat(root.key, "/", true, 5);
                console.log(childrenPaths)
                const children: FileOrFolder[] = await Promise.all(childrenPaths.map(async childPath => {
                    const _rootObjects = await buckets.listPath(root.key, childPath, 3)
                    console.log("child _rootObjects", _rootObjects)
                    return { name: childPath, children: [] }
                }));
                return { name: root.name, children: children }
            }))
            setloadingFiles(false)
            setFilesAndFolders(_filesAndFolders)
        };
        doAsync();
    }, [buckets])

    return (
        <Box gap="large">
            <Box border="left" pad="small">
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Initialized </Text>
                    <Text weight="bold">{initialized ? "Initialized" : "Not initialized"}</Text>
                    <Button label="Init" icon={bucketsLoading ? <SpinnerCircular size="20px"></SpinnerCircular> : <></>} disabled={bucketsLoading} reverse={true} onClick={(e) => setInitialized()}></Button>
                </Grid>
                <Grid columns={["auto", "flex", "small"]} gap="small" margin="small" align="center">
                    <Text>Storage account: </Text>
                    <Text weight="bold">{fallback ? "Public" : "Wallet"}</Text>
                    <Button label="Toggle" onClick={(e) => setFallback(!fallback)}></Button>
                </Grid>
            </Box>

            <Box border="left" pad="small" gap="small">
                <Heading level="3">Files and folders</Heading>
                {loadingFiles
                    ? <SpinnerCircular></SpinnerCircular>
                    : filesAndFolders.map((folder, i) => (
                        <Box key={i}>
                            <Text>- {folder.name}</Text>

                        </Box>
                    ))}
            </Box>

        </Box>
    )
}