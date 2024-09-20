import tokens from './tokens'

//NOTE ALL ADRESSES NEED TO BE CHECKSUMMED
const farms = [
  {
    pid: 1,
    lpSymbol: 'PINE-ATROPA',
    lpAddress:'0x0E4B3d3141608Ebc730EE225666Fd97c833d553E',
    token: tokens.atropa,
    quoteToken: tokens.pine,
    version: '1',
    farmActive: true
  },
  {
    pid: 2,
    lpSymbol: 'PINE-pDAI',
    lpAddress: '0xa1cE806C501b08072bdfe48d50C3d84b3C5a4fc3',
    token: tokens.dai,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 3,
    lpSymbol: 'PINE-pWBTC',
    lpAddress: '0x310c77c20B5b7872a20E7e29079B7a62016d52ba',
    token: tokens.wbtc,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true

  },
  {
    pid: 4,
    lpSymbol: 'PINE-WPLS',
    lpAddress: '0xA97a6FA76A8D27d43Bc94d050fD92372F269eAC0',
    token: tokens.wpls,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 5,
    lpSymbol: 'PINE-PLSX',
    lpAddress: '0x4B798587Bf68b5b5DC4a5a63A7567DA825235d29',
    token: tokens.plsx,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 6,
    lpSymbol: 'PINE-pAAVE',
    lpAddress: '0x494a8878F614207736a0b2dBF3cB6a4Ee3dA8eba',
    token: tokens.paave,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 7,
    lpSymbol: 'PINE-pLINK',
    lpAddress: '0x0466f1E0Ce98c4F515c5ee9b0898064b2fEf8cE0',
    token: tokens.plink,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 8,
    lpSymbol: 'PINE-pMKR',
    lpAddress: '0x44447b77daA07fb6eFde23269eb9e28101348Fba',
    token: tokens.pmkr,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 9,
    lpSymbol: 'PINE-eHEX',
    lpAddress: '0x145FA4465e2ddC20cdE2a3ca6071Ecbcb1144624',
    token: tokens.ehex,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  },
  {
    pid: 10,
    lpSymbol: 'PINE-pUSDC',
    lpAddress: '0xaeedbefaf43165556f595ada0c7bf181e535bd0d',
    token: tokens.usdc,
    quoteToken: tokens.pine,
    version: '2',
    farmActive: true
  }
]

export default farms
