import { Collection } from 'etebase';
import { ethers } from 'ethers';
import { Box, Button, DataTable, Grid, Heading } from 'grommet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { EtebaseAccountContext, EtebaseContext } from '../hardhat/EtebaseContext';
import { ProviderContext, SignerContext, SimpleStorageContext } from './../hardhat/HardhatContext';


interface Props { }

interface Document {
    name: string,
    url?: string,
    hash?: string
}


export const SimpleStorage: React.FC<Props> = () => {
    const SimpleStorage = useContext(SimpleStorageContext)
    const [provider] = useContext(ProviderContext)
    // const [currentAddress] = useContext(CurrentAddressContext)
    const [signer] = useContext(SignerContext)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [documents, setDocuments] = useState<Document[]>([]);
    const [etebaseAccount, loading] = useContext(EtebaseAccountContext)

    useEffect(() => {
        const doAsync = async () => {
            if (SimpleStorage.instance) {
                try {
                    const listBytes = await SimpleStorage.instance.getDocumentList()
                    const list = listBytes.map(id => ethers.utils.parseBytes32String(id))
                    setDocuments(list.map(name => ({ name })))
                    SimpleStorage.instance.on("Document", (res: any) => {
                        const newName = ethers.utils.parseBytes32String(res)
                        const exist = list.indexOf(newName) === -1
                        if (exist)
                            setDocuments(old => [...old, { name: newName }])
                    })
                } catch (error) {
                }
            }
        };
        doAsync();
        // eslint-disable-next-line
    }, [SimpleStorage.instance])

    const getDocument = async (name: string) => {
        if (SimpleStorage.instance) {
            const document = await SimpleStorage.instance.getDocument(ethers.utils.formatBytes32String(name))

            setDocuments(old => {
                return old.map(x => {
                    if (x.name === name) {
                        return {
                            name,
                            url: document.docURI,
                            hash: document.docHash
                        }
                    }
                    return x
                })
            })
        }
    }

    const saveDocument = async (name: string, type: string, data: string) => {
        if (SimpleStorage.instance && etebaseAccount) {
            const nameBytes32 = ethers.utils.formatBytes32String(name.substr(0, 31))
            const hashOfDocument = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data))

            const collectionManager = etebaseAccount.getCollectionManager();

            let collection: Collection | undefined
            try {
                collection = await collectionManager.fetch("rKUf3jYqq2cINjW7JbmU8GhzQB1pAUmI")
            } catch (error) {
                try {
                    collection = await collectionManager.create("rKUf3jYqq2cINjW7JbmU8GhzQB1pAUmI",
                        {
                            name: "Documents",
                            description: "Documents for this contract"
                        },
                        ""
                    );
                    await collectionManager.upload(collection);
                } catch (error) {
                    throw Error("Could not get or create collection.")
                }
            }
            console.log(await collection.getMeta())

            const itemManager = collectionManager.getItemManager(collection);
            const item = await itemManager.create(
                {
                    type: type,
                    name: name,
                    mtime: (new Date()).getTime(),
                },
                data
            );
            await itemManager.batch([item]);
            console.log("Saved item")
            console.log(item)
            const items = await itemManager.list();
            console.log("List", items)

            // /* const tx =  */await SimpleStorage.instance.setDocument(nameBytes32, url, hashOfDocument)
        }
    }

    const handleFile = (event: any) => {
        console.log("Handle File")
        event.preventDefault();
        const reader = new FileReader();
        if (fileInputRef.current?.files) {
            console.log("Running")
            const file = fileInputRef.current.files[0]
            reader.onload = (e) => {
                console.log("Onload ", e.target)
                if (e.target) {
                    if (typeof e.target.result === "string") {
                        saveDocument(
                            file.name,
                            file.type,
                            e.target.result
                        )
                    }
                };
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Box gap="large">
            <Heading level="2">Simple storage</Heading>

            <form onSubmit={handleFile}>
                <Box elevation="small" pad="small" >
                    <Heading level="3">Set document</Heading>
                    <Grid gap="medium" columns={["small", "small"]} align="center">
                        <input type="file" ref={fileInputRef} />
                        <Button type="submit" label="Upload file"></Button>
                    </Grid>
                </Box>
            </form>


            <Box elevation="small" pad="small" >
                <Heading level="3">List document</Heading>
                <Grid gap="medium" align="center">
                    <DataTable
                        data={documents}
                        onClickRow={(e) => getDocument(e.datum.name)}
                        cellPadding={50}
                        cellSpacing="509"
                        columns={[
                            {
                                property: "name",
                                header: "Name",
                                render: (data) => data.name.substr(0, 31),
                            },
                            {
                                property: "hash",
                                header: "Hash",
                                render: ({ hash }) => (
                                    hash ?
                                        hash.substr(0, 15)
                                        : "Click to update"

                                )
                            },
                            {
                                property: "URL",
                                header: "Url",
                                render: ({ url }) => (
                                    url ? url : ""
                                )
                            }
                        ]}
                    ></DataTable>
                </Grid>
            </Box>


        </Box>
    )
}

