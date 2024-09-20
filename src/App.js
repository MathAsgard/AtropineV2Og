import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import Compound from "./pages/compound/Compound";
import Farm from "./pages/farm/Farm";
import Home from "./pages/home/Home";

import { WagmiConfig, createConfig, configureChains, useSwitchNetwork } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
 
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { pulsechain } from 'wagmi/chains'

// 1. Get projectId
const projectId = '3dd67baf0f27ba6f20bf1ef5b9782b4f'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://charming-torrone-e12a73.netlify.app'
}



 
// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient} = configureChains(
  [pulsechain],
  [publicProvider()],
)


// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})
 




function App() {
	return (
		<WagmiConfig config={config}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/farm" element={<Farm />} />
					<Route path="/autocompound" element={<Compound />} />
				</Routes>
			</BrowserRouter>
	 	</WagmiConfig>
	);
}

export default App;
