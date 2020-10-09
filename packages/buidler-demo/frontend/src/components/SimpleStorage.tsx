import { ethers } from 'ethers';
import { Box, Button, DataTable, Grid, Heading } from 'grommet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { SimpleStorageContext } from './../buidler/BuidlerSymfoniReact';

interface Props { }

interface Document {
    name: string,
    url?: string,
    hash?: string
}


export const SimpleStorage: React.FC<Props> = () => {
    const [SimpleStorage] = useContext(SimpleStorageContext)
    const [file, setFile] = useState<{ name: string, type: string, data: string } | null>(null);
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

    const setDocument = async () => {
        if (SimpleStorage.instance && file) {
            const urlToDoc = "https://somestorage.com"
            const nameBytes32 = ethers.utils.formatBytes32String(file.name)
            const hashOfDocument = ethers.utils.sha256(ethers.utils.toUtf8Bytes(file.data))
            /* const tx =  */await SimpleStorage.instance.setDocument(nameBytes32, urlToDoc, hashOfDocument)
        }
    }

    const handleFile = (event: any) => {
        event.preventDefault();
        const reader = new FileReader();
        if (fileInputRef.current?.files) {
            const file = fileInputRef.current.files[0]
            reader.onload = (e) => {
                if (e.target) {
                    if (typeof e.target.result === "string") {
                        setFile({
                            name: file.name,
                            type: file.type,
                            data: e.target.result
                        })
                        setDocument()
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
                                render: (data) => data.name.substr(0, 6),
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

