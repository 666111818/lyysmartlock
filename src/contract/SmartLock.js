// Smart Lock 合约地址和 ABI
export const SMART_LOCK_CONTRACT_ADDRESS = "0xc618E274421d082d1Fc80EDcB6970393A47878E6";
export const SMART_LOCK_ABI =[
	// 事件
	{
	  "anonymous": false,
	  "inputs": [
		{ "indexed": true, "name": "user", "type": "address" },
		{ "indexed": false, "name": "timestamp", "type": "uint256" },
		{ "indexed": false, "name": "operation", "type": "string" }
	  ],
	  "name": "LockOperation",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{ "indexed": true, "name": "manager", "type": "address" }
	  ],
	  "name": "ManagerAdded",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{ "indexed": true, "name": "manager", "type": "address" }
	  ],
	  "name": "ManagerRemoved",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{ "indexed": true, "name": "previousOwner", "type": "address" },
		{ "indexed": true, "name": "newOwner", "type": "address" }
	  ],
	  "name": "OwnershipTransferred",
	  "type": "event"
	},
  
	// 只读函数 (view/pure)
	{
	  "constant": true,
	  "inputs": [{ "name": "user", "type": "address" }],
	  "name": "getLockStatus",
	  "outputs": [{ "name": "", "type": "bool" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [{ "name": "user", "type": "address" }],
	  "name": "getUserOperations",
	  "outputs": [{ "name": "", "type": "string[]" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [{ "name": "user", "type": "address" }],
	  "name": "getUserUnlockTime",
	  "outputs": [{ "name": "", "type": "uint256" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [],
	  "name": "identityOracle",
	  "outputs": [{ "name": "", "type": "address" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [],
	  "name": "isLocked",
	  "outputs": [{ "name": "", "type": "bool" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [],
	  "name": "lockTimeout",
	  "outputs": [{ "name": "", "type": "uint256" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [{ "name": "", "type": "address" }],
	  "name": "managers",
	  "outputs": [{ "name": "", "type": "bool" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [],
	  "name": "owner",
	  "outputs": [{ "name": "", "type": "address" }],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "constant": true,
	  "inputs": [{ "name": "", "type": "address" }],
	  "name": "userLockStatus",
	  "outputs": [{ "name": "", "type": "bool" }],
	  "stateMutability": "view",
	  "type": "function"
	},
  
	// 需要交易的操作 (nonpayable)
	{
	  "constant": false,
	  "inputs": [{ "name": "manager", "type": "address" }],
	  "name": "addManager",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "constant": false,
	  "inputs": [{ "name": "user", "type": "address" }],
	  "name": "lock",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "constant": false,
	  "inputs": [{ "name": "manager", "type": "address" }],
	  "name": "removeManager",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "constant": false,
	  "inputs": [{ "name": "timeout", "type": "uint256" }],
	  "name": "setLockTimeout",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "constant": false,
	  "inputs": [{ "name": "newOwner", "type": "address" }],
	  "name": "transferOwnership",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "constant": false,
	  "inputs": [{ "name": "user", "type": "address" }],
	  "name": "unlock",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	}
  ];
  

