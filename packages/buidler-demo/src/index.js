var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/* eslint-disable react-hooks/exhaustive-deps */
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { SpinnerCircular } from "spinners-react";
// contracts
// import SimpleStorageArtifact from "./buidler/artifacts/SimpleStorage.json";
import SimpleStorageDeployment from "./buidler/deployments/localhost/SimpleStorage.json";
// import { SimpleStorage } from "./buidler/typechain/SimpleStorage";
import { SimpleStorageFactory } from "./buidler/typechain/SimpleStorageFactory";
var defaultContracts = {};
export var ContractsContext = React.createContext([defaultContracts, function () { }]);
var SimpleStorageDefault = { storage: undefined, hasSigner: false, hasInstance: false };
export var SimpleStorageContext = React.createContext([SimpleStorageDefault, function () { }]);
var defaultProvider = ethers.providers.getDefaultProvider();
export var ProviderContext = React.createContext([defaultProvider, function () { }]);
var defaultCurrentAddress = "";
export var CurrentAddressContext = React.createContext([defaultCurrentAddress, function () { }]);
var defaultSigner = undefined;
export var SignerContext = React.createContext([defaultSigner, function () { }]);
export var BuidlerSymfoniReact = function (_a) {
    var children = _a.children;
    var _b = useState(false), ready = _b[0], setReady = _b[1];
    var _c = useState([]), messages = _c[0], setMessages = _c[1];
    var _d = useState(), setProviderName = _d[1];
    var _e = useState(defaultSigner), signer = _e[0], setSigner = _e[1];
    var _f = useState(defaultProvider), provider = _f[0], setProvider = _f[1];
    var _g = useState(defaultContracts), contracts = _g[0], setContracts = _g[1];
    var _h = useState(SimpleStorageDefault), SimpleStorage = _h[0], setSimpleStorage = _h[1];
    var _j = useState(defaultCurrentAddress), currentAddress = _j[0], setCurrentAddress = _j[1];
    /* functions */
    var getProvider = function () { return __awaiter(void 0, void 0, void 0, function () {
        var providerPriority, provider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerPriority = ["web3modal", "dev", "HTTP://127.0.0.1:8545"];
                    return [4 /*yield*/, providerPriority.reduce(function (maybeProvider, providerIdentification) { return __awaiter(void 0, void 0, void 0, function () {
                            var foundProvider, _a, provider_1, web3provider, error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, maybeProvider];
                                    case 1:
                                        foundProvider = _b.sent();
                                        if (!foundProvider) return [3 /*break*/, 2];
                                        return [2 /*return*/, Promise.resolve(foundProvider)];
                                    case 2:
                                        _a = providerIdentification.toLowerCase();
                                        switch (_a) {
                                            case "web3modal": return [3 /*break*/, 3];
                                        }
                                        return [3 /*break*/, 6];
                                    case 3:
                                        _b.trys.push([3, 5, , 6]);
                                        return [4 /*yield*/, getWeb3ModalProvider()];
                                    case 4:
                                        provider_1 = _b.sent();
                                        web3provider = new ethers.providers.Web3Provider(provider_1);
                                        return [2 /*return*/, Promise.resolve(web3provider)];
                                    case 5:
                                        error_1 = _b.sent();
                                        return [2 /*return*/, Promise.resolve(undefined)];
                                    case 6: return [2 /*return*/, Promise.resolve(undefined)];
                                }
                            });
                        }); }, Promise.resolve(undefined))]; // end reduce
                case 1:
                    provider = _a.sent() // end reduce
                    ;
                    return [2 /*return*/, provider];
            }
        });
    }); };
    var getWeb3ModalProvider = function () { return __awaiter(void 0, void 0, void 0, function () {
        var providerOptions, web3Modal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerOptions = {};
                    web3Modal = new Web3Modal({
                        // network: "mainnet",
                        cacheProvider: true,
                        providerOptions: providerOptions,
                    });
                    return [4 /*yield*/, web3Modal.connect()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    useEffect(function () {
        console.log(messages.pop());
    }, [messages]);
    /* effects */
    useEffect(function () {
        var subscribed = true;
        var doAsync = function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, signer_1, web3provider, address, contractAddress, instance, contract;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setMessages(function (old) { return __spreadArrays(old, ["Initiating Buidler React"]); });
                        return [4 /*yield*/, getProvider()]; // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094
                    case 1:
                        provider = _a.sent() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094
                        ;
                        if (!(subscribed && provider)) return [3 /*break*/, 5];
                        setProvider(provider);
                        setProviderName(provider.constructor.name);
                        setMessages(function (old) { return __spreadArrays(old, ["Useing provider: " + provider.constructor.name]); });
                        if (!(provider.constructor.name === "Web3Provider")) return [3 /*break*/, 4];
                        web3provider = provider;
                        return [4 /*yield*/, web3provider.getSigner()];
                    case 2:
                        signer_1 = _a.sent();
                        if (!(subscribed && signer_1)) return [3 /*break*/, 4];
                        setSigner(signer_1);
                        return [4 /*yield*/, signer_1.getAddress()];
                    case 3:
                        address = _a.sent();
                        if (subscribed && address) {
                            setCurrentAddress(address);
                        }
                        _a.label = 4;
                    case 4:
                        contractAddress = null;
                        instance = undefined;
                        if (SimpleStorageDeployment) {
                            contractAddress = SimpleStorageDeployment.receipt.contractAddress;
                            instance = signer_1 ? SimpleStorageFactory.connect(contractAddress, signer_1) : SimpleStorageFactory.connect(contractAddress, provider);
                        }
                        contract = {
                            storage: null,
                            instance: instance,
                            factory: signer_1 ? new SimpleStorageFactory(signer_1) : undefined,
                            hasSigner: signer_1 ? true : false,
                            hasInstance: SimpleStorageDeployment ? true : false
                        };
                        setSimpleStorage(contract);
                        // interface Contract {
                        //     storage: any,
                        //     contract: ethers.utils.Interface,
                        //     factory: ContractFactory,
                        //     ready: () => boolean,
                        //     attach: (address: string) => Promise<Boolean>
                        // }
                        setReady(true);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        doAsync();
        return function () { subscribed = false; };
    }, []);
    return (React.createElement(ProviderContext.Provider, { value: [provider, setProvider] },
        React.createElement(SignerContext.Provider, { value: [signer, setSigner] },
            React.createElement(CurrentAddressContext.Provider, { value: [currentAddress, setCurrentAddress] },
                React.createElement(SimpleStorageContext.Provider, { value: [SimpleStorage, setSimpleStorage] },
                    ready &&
                        (children),
                    !ready &&
                        React.createElement("div", null,
                            React.createElement(SpinnerCircular, null),
                            messages.map(function (msg, i) { return (React.createElement("p", { key: i }, msg)); })))))));
};
// cont buidlerPluginReact = {
// 	ready: () => boolean,
// 	provider: Ethers.provider,
// 	[contractName : HolisticContractObject] : {
// 		storage: {...HolisticObject} // If symfoni storage plugin is present,
// 		contract: TypechainContract (class instance with provider),
// 		factory: TypechainContractFactory (class instance with provider),
// 		ready: boolean,
// 		attach: (address: string) => Promise<Boolean>
// 	}
// }
