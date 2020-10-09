const bre = {
    Environment:  {
  config: {
    defaultNetwork: 'dev',
    solc: { version: '0.5.15', optimizer: [Object] },
    networks: { buidlerevm: [Object], localhost: [Object], dev: [Object] },
    analytics: { enabled: true },
    mocha: { timeout: 20000 },
    paths: {
      artifacts: '/home/robin/code/buidler-symfoni-demo/frontend/src/buidler/artifacts',
      deployments: '/home/robin/code/buidler-symfoni-demo/frontend/src/buidler/deployments',
      root: '/home/robin/code/buidler-symfoni-demo',
      configFile: '/home/robin/code/buidler-symfoni-demo/buidler.config.ts',
      sources: '/home/robin/code/buidler-symfoni-demo/contracts',
      cache: '/home/robin/code/buidler-symfoni-demo/cache',
      tests: '/home/robin/code/buidler-symfoni-demo/test',
      react: './frontend/src/buidler'
    },
    typechain: { outDir: './frontend/src/buidler/typechain', target: 'ethers-v5' },
    namedAccounts: { deployer: [Object] },
    react: { providerPriority: [Array] }
  },
  buidlerArguments: {
    network: 'dev',
    showStackTraces: false,
    version: false,
    help: false,
    emoji: false,
    config: undefined,
    verbose: false,
    maxMemory: undefined
  },
  tasks: {
    clean: OverriddenTaskDefinition {
      parentTaskDefinition: [SimpleTaskDefinition],
      isInternal: false,
      _description: 'Clears the cache and deletes all artifacts',
      _action: [AsyncFunction]
    },
    'compile:get-source-paths': SimpleTaskDefinition {
      name: 'compile:get-source-paths',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:get-resolved-sources': SimpleTaskDefinition {
      name: 'compile:get-resolved-sources',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:get-dependency-graph': SimpleTaskDefinition {
      name: 'compile:get-dependency-graph',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:get-compiler-input': OverriddenTaskDefinition {
      parentTaskDefinition: [SimpleTaskDefinition],
      isInternal: true,
      _action: [AsyncFunction]
    },
    'compile:run-compiler': SimpleTaskDefinition {
      name: 'compile:run-compiler',
      isInternal: true,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:compile': SimpleTaskDefinition {
      name: 'compile:compile',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:cache': SimpleTaskDefinition {
      name: 'compile:cache',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'compile:build-artifacts': SimpleTaskDefinition {
      name: 'compile:build-artifacts',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    compile: SimpleTaskDefinition {
      name: 'compile',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Compiles the entire project, building all artifacts'
    },
    console: SimpleTaskDefinition {
      name: 'console',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Opens a buidler console'
    },
    'flatten:get-flattened-sources': SimpleTaskDefinition {
      name: 'flatten:get-flattened-sources',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Returns all contracts and their dependencies flattened'
    },
    flatten: SimpleTaskDefinition {
      name: 'flatten',
      isInternal: false,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Flattens and prints all contracts and their dependencies'
    },
    help: SimpleTaskDefinition {
      name: 'help',
      isInternal: false,
      paramDefinitions: {},
      positionalParamDefinitions: [Array],
      _positionalParamNames: [Set],
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: true,
      action: [AsyncFunction],
      _description: 'Prints this message'
    },
    run: SimpleTaskDefinition {
      name: 'run',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [Array],
      _positionalParamNames: [Set],
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Runs a user-defined script after compiling the project'
    },
    node: OverriddenTaskDefinition {
      parentTaskDefinition: [SimpleTaskDefinition],
      isInternal: false,
      _description: 'Starts a JSON-RPC server on top of Buidler EVM',
      _action: [AsyncFunction]
    },
    'test:get-test-files': SimpleTaskDefinition {
      name: 'test:get-test-files',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [Array],
      _positionalParamNames: [Set],
      _hasVariadicParam: true,
      _hasOptionalPositionalParam: true,
      action: [AsyncFunction]
    },
    'test:setup-test-environment': SimpleTaskDefinition {
      name: 'test:setup-test-environment',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction]
    },
    'test:run-mocha-tests': SimpleTaskDefinition {
      name: 'test:run-mocha-tests',
      isInternal: true,
      paramDefinitions: {},
      positionalParamDefinitions: [Array],
      _positionalParamNames: [Set],
      _hasVariadicParam: true,
      _hasOptionalPositionalParam: true,
      action: [AsyncFunction]
    },
    test: SimpleTaskDefinition {
      name: 'test',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [Array],
      _positionalParamNames: [Set],
      _hasVariadicParam: true,
      _hasOptionalPositionalParam: true,
      action: [AsyncFunction],
      _description: 'Runs mocha tests'
    },
    'deploy:run': SimpleTaskDefinition {
      name: 'deploy:run',
      isInternal: true,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'deploy '
    },
    deploy: SimpleTaskDefinition {
      name: 'deploy',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Deploy contracts'
    },
    export: SimpleTaskDefinition {
      name: 'export',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'export contract deployment of the specified network into one file'
    },
    'etherscan-verify': SimpleTaskDefinition {
      name: 'etherscan-verify',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'submit contract source code to etherscan'
    },
    typechain: SimpleTaskDefinition {
      name: 'typechain',
      isInternal: false,
      paramDefinitions: {},
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [AsyncFunction],
      _description: 'Generate Typechain typings for compiled contracts'
    },
    'react:run': SimpleTaskDefinition {
      name: 'react:run',
      isInternal: true,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [Function],
      _description: 'Run react component generation '
    },
    react: SimpleTaskDefinition {
      name: 'react',
      isInternal: false,
      paramDefinitions: [Object],
      positionalParamDefinitions: [],
      _positionalParamNames: Set {},
      _hasVariadicParam: false,
      _hasOptionalPositionalParam: false,
      action: [Function],
      _description: 'Create React component'
    }
  },
  run: [AsyncFunction],
  network: {
    name: 'dev',
    config: { url: 'HTTP://127.0.0.1:8545' },
    provider: HttpProvider {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      _url: 'HTTP://127.0.0.1:8545',
      _networkName: 'dev',
      _extraHeaders: {},
      _timeout: 20000,
      _nextRequestId: 1,
      [Symbol(kCapture)]: false
    },
    live: true,
    saveDeployments: true
  },
  ethereum: HttpProvider {
    _events: [Object: null prototype] {},
    _eventsCount: 0,
    _maxListeners: undefined,
    _url: 'HTTP://127.0.0.1:8545',
    _networkName: 'dev',
    _extraHeaders: {},
    _timeout: 20000,
    _nextRequestId: 1,
    [Symbol(kCapture)]: false
  },
  _extenders: [ [Function], [Function] ],
  ethers: {
    provider: Web3Provider {
      _isProvider: true,
      _events: [],
      _emitted: { block: -2 },
      formatter: Formatter { formats: [Object] },
      anyNetwork: false,
      _networkPromise: Promise { <pending> },
      _maxInternalBlockNumber: -1024,
      _lastBlockNumber: -2,
      _pollingInterval: 4000,
      _fastQueryDate: 0,
      connection: { url: 'unknown:' },
      _nextId: 42,
      jsonRpcFetchFunc: [Function],
      provider: HttpProvider {
        _events: [Object: null prototype] {},
        _eventsCount: 0,
        _maxListeners: undefined,
        _url: 'HTTP://127.0.0.1:8545',
        _networkName: 'dev',
        _extraHeaders: {},
        _timeout: 20000,
        _nextRequestId: 1,
        sendAsync: [Function],
        [Symbol(kCapture)]: false
      }
    },
    getSigners: [AsyncFunction: getSigners],
    getSigner: [Function: bound getSigner] AsyncFunction,
    getContractFactory: [Function: bound getContractFactory] AsyncFunction,
    getContractAt: [Function: bound getContractAt] AsyncFunction,
    getContract: [Function: bound getContract] AsyncFunction,
    getContractOrNull: [Function: bound getContractOrNull] AsyncFunction
  },
  getChainId: [Function],
  deployments: {
    save: [AsyncFunction: save],
    get: [AsyncFunction: get],
    getOrNull: [AsyncFunction: getOrNull],
    all: [AsyncFunction: all],
    getArtifact: [AsyncFunction: getArtifact],
    getArtifactSync: [Function: getArtifactSync],
    run: [Function: run],
    fixture: [AsyncFunction: fixture],
    createFixture: [Function: createFixture],
    log: [Function: log],
    fetchIfDifferent: [AsyncFunction: fetchIfDifferent],
    deploy: [AsyncFunction: deploy],
    diamond: {
      deploy: [AsyncFunction: diamond],
      executeAsOwner: [AsyncFunction: diamondAsOwner]
    },
    execute: [AsyncFunction: execute],
    batchExecute: [AsyncFunction: batchExecute],
    rawTx: [AsyncFunction: rawTx],
    read: [AsyncFunction: read],
    create2: [AsyncFunction: create2],
    call: [Function],
    sendTxAndWait: [Function],
    deployIfDifferent: [Function]
  },
  getNamedAccounts: [Function: bound getNamedAccounts] AsyncFunction

}