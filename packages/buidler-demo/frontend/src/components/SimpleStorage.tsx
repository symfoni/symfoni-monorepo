import { ethers } from 'ethers';
import { Box, Button, DataTable, Grid, Heading } from 'grommet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CurrentAddressContext, ProviderContext, SignerContext, SimpleStorageContext } from './../buidler/BuidlerSymfoniReact';
// import { Client, Identity, KeyInfo, Buckets } from '@textile/hub'


interface Props { }

interface Document {
    name: string,
    url?: string,
    hash?: string
}


export const SimpleStorage: React.FC<Props> = () => {
    const [SimpleStorage] = useContext(SimpleStorageContext)
    const [provider] = useContext(ProviderContext)
    const [currentAddress] = useContext(CurrentAddressContext)
    const [signer] = useContext(SignerContext)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        const doAsync = async () => {
            console.log("Check sim", SimpleStorage)
            if (SimpleStorage.instance) {
                try {
                    const listBytes = await SimpleStorage.instance.getDocumentList()
                    const list = listBytes.map(id => ethers.utils.parseBytes32String(id))
                    setDocuments(list.map(name => ({ name })))
                    SimpleStorage.instance.on("Document", (res) => {
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
    }, [SimpleStorage])

    // useEffect(() => {
    //     if (provider && signer) {
    //         const encoder = new TextEncoder()
    //         console.log(encoder.encode("a"))
    //         if (!("TextEncoder" in window))
    //             alert("Sorry, this browser does not support TextEncoder...");
    //         const identity: Identity = {
    //             sign: async (bytes) => {
    //                 const signedAsString = await signer.signMessage(bytes)
    //                 return encoder.encode(signedAsString)

    //             },
    //             public: {
    //                 verify: async (data: Uint8Array, sig: Uint8Array): Promise<boolean> => {
    //                     return true
    //                 },
    //                 bytes: encoder.encode(currentAddress.substring(2))
    //             }
    //         }
    //         authorize({ key: "bdsmrirkgb3n5qndmntxuy4w6jq" }, identity)
    //     }
    // }, [provider, signer])

    // async function authorize(key: KeyInfo, identity: Identity) {
    //     const client = await Client.withKeyInfo(key)
    //     await client.getToken(identity)
    //     return client
    // }

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

    const setDocument = async (file: { name: string, type: string, data: string }) => {
        if (SimpleStorage.instance) {
            const urlToDoc = "https://somestorage.com"
            const nameBytes32 = ethers.utils.formatBytes32String(file.name.substr(0, 31))
            const hashOfDocument = ethers.utils.sha256(ethers.utils.toUtf8Bytes(file.data))
            /* const tx =  */await SimpleStorage.instance.setDocument(nameBytes32, urlToDoc, hashOfDocument)
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
                        setDocument({
                            name: file.name,
                            type: file.type,
                            data: e.target.result
                        })
                    }
                };
            }
            setTimeout(() => {
                reader.readAsDataURL(file)
            }, 500)
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
                                property: "url",
                                header: "Url",
                                render: ({ url }) => (
                                    url ?
                                        url :
                                        "Click to update"
                                )
                            }
                        ]}
                    ></DataTable>
                </Grid>
            </Box>


        </Box>
    )
}

