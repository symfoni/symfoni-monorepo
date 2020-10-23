import { ethers } from 'ethers';
import { Box, Button, DataTable, Grid, Heading } from 'grommet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SimpleStorageContext } from './../buidler/BuidlerContext';



interface Props { }

interface Document {
    name: string,
    url?: string,
    hash?: string
}


export const SimpleStorage: React.FC<Props> = () => {
    const SimpleStorage = useContext(SimpleStorageContext)
    // const [provider] = useContext(ProviderContext)
    // const [currentAddress] = useContext(CurrentAddressContext)
    // const [signer] = useContext(SignerContext)
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
        // eslint-disable-next-line
    }, [SimpleStorage.instance])

    // const getBuckets = async (): Promise<[Buckets, string]> => {
    //     if (!SimpleStorage.instance) {
    //         throw Error("Need contract instance to know hich bucket to get.")
    //     }
    //     // TODO Create identiyy from web3modal
    //     const identity = await PrivateKey.fromRandom()
    //     const buckets = await Buckets.withKeyInfo({ key: "biepyo75p2zaavunhyj7ndeydkq" }) // TODO Set unsecure key user key from Hub
    //     await buckets.getToken(identity)
    //     const bucketResult = await buckets.getOrCreate(SimpleStorage.instance.address)
    //     if (!bucketResult.root) {
    //         throw Error("Failed to open Bucket.")
    //     }
    //     if (!bucketResult.root.key) {
    //         throw Error("Failed to open Bucket root key.")
    //     }

    //     return [buckets, bucketResult.root.key]
    // }

    // const uploadDocument = async (fileName: string, data: string): Promise<string> => {
    //     if (provider && signer && SimpleStorage.instance) {
    //         const [buckets, key] = await getBuckets()
    //         const pathResult = await buckets.pushPath(key, fileName, data, {})
    //         console.log("pathResult<", pathResult)
    //         return pathResult.path.path
    //     } else {
    //         throw Error("Could not upload document.")
    //     }
    // }

    const getDocument = async (name: string) => {
        if (SimpleStorage.instance) {
            const document = await SimpleStorage.instance.getDocument(ethers.utils.formatBytes32String(name))
            //Textile stuff
            // const [buckets, key] = await getBuckets()
            // const display = (num?: number) => {
            //     console.log('Progress:', num)
            // }
            // console.log("document.docURI", document.docURI.split("/").pop())
            // const res = await buckets.pullPath(key, document.docURI, { progress: display })
            // console.log("res", await res.next())

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

    const saveDocument = async (file: { name: string, type: string, data: string }) => {
        if (SimpleStorage.instance) {
            const nameBytes32 = ethers.utils.formatBytes32String(file.name.substr(0, 31))
            // const url = await uploadDocument(file.name, file.data)
            const url = "https://somestorage.com"
            const hashOfDocument = ethers.utils.sha256(ethers.utils.toUtf8Bytes(file.data))
            /* const tx =  */await SimpleStorage.instance.setDocument(nameBytes32, url, hashOfDocument)
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
                        saveDocument({
                            name: file.name,
                            type: file.type,
                            data: e.target.result
                        })
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

