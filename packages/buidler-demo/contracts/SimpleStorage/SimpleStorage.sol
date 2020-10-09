// SPDX-License-Identifier: MIT
pragma solidity >=0.5.5 <0.7.0;

/**
 * @title Storage
 * @dev Store & retreive value in a variable
 */
contract SimpleStorage {
    struct Doc {
        string docURI;
        bytes32 docHash;
    }
    mapping(bytes32 => Doc) internal _documents;
    bytes32[] internal _documentList;
    event Document(bytes32 name, string uri, bytes32 docHash);

    function getDocument(bytes32 name)
        external
        view
        returns (string memory docURI, bytes32 docHash)
    {
        require(
            bytes(_documents[name].docURI).length != 0,
            "Document cannot be empty."
        );
        return (_documents[name].docURI, _documents[name].docHash);
    }

    function setDocument(
        bytes32 name,
        string calldata uri,
        bytes32 documentHash
    ) external {
        require(
            _documents[name].docHash == bytes32(0),
            "Cannot override document."
        );
        _documents[name] = Doc({docURI: uri, docHash: documentHash});
        _documentList.push(name);
        emit Document(name, uri, documentHash);
    }

    function getDocumentList()
        external
        view
        returns (bytes32[] memory documentList)
    {
        return _documentList;
    }
}
