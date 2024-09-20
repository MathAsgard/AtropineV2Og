import React, { useEffect, useState } from "react";
import { Collapse, Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useEnsAvatar,
    useEnsName,
    useNetwork,
    useSwitchNetwork,
  } from 'wagmi'

  import {
    CoinbaseWalletIcon,
    GenericWalletIcon,
	ClearIcon,
	CopyButton,
	MetamaskIcon,
	ShareLink,
	WalletConnectIcon,
} from "./Icon";

  export function Profile({mobile}) {
    const { address, connector, isConnected } = useAccount()
    const { data: ensAvatar } = useEnsAvatar({ address })
    const { data: ensName } = useEnsName({ address })

    const [connectModal, setConnectModal] = React.useState(false);
	const [wallet, setWallet] = React.useState('');
	const [walletModal, setWalletModal] = React.useState(false);

    const { connect, connectors, error, isLoading, pendingConnector } =
      useConnect()
    const { disconnect } = useDisconnect()

    const handleCopyWalletAddress = () => {
		navigator.clipboard.writeText(address);
		window.alert("Copied to clipboard");
	};
    const { chain } = useNetwork()
    const { chains, _error, _isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
    if (isConnected) {
      if(chain.id !== 369 && !pendingChainId) switchNetwork(369)
      return (
        <>

        {mobile === "false" &&
        <button
        className="connect-btn active d-none d-lg-block cmn-btn"
        type="button"
        onClick={() => setWalletModal(true)}
        >
            {address.substring(0, 4) + '...' + address.substring(address.length - 4, address.length)}
        </button>
        }
        {mobile === "true" &&
        <button
        className="connect-btn active cmn-btn ms-auto me-2"
        type="button"
        onClick={() => setWalletModal(true)}
        >
            {address.substring(0, 4) + '...' + address.substring(address.length - 4, address.length)}
        </button>
        }
        <Modal
        centered
        show={walletModal}
        onHide={() => setWalletModal(null)}
        >
            <div className="modal-inner">
                <div className="shape1"></div>
                <div className="shape2"></div>
                <div className="shape3"></div>
                <div className="shape4"></div>
                <ModalHeader>
                    <h6
                        className="m-0"
                        style={{ fontWeight: "500 !important" }}
                    >
                        Your wallet
                    </h6>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setWalletModal(false)}
                    >
                        <ClearIcon color="var(--base)" />
                    </span>
                </ModalHeader>
                <ModalBody>
                    <div className="text-center">
                        <h6 className="wallet-address text-start">
                            {address}
                        </h6>
                        <div className="text-start">
                            <Link
                                to={"https://scan.pulsechain.com/address/" + address}
                                target="_blank"
                                className="text-base hover-text-base me-3"
                            >
                                View on PulseX <ShareLink/>
                            </Link>
                            <span className="text-base hover-text-base d-inline-flex align-items-center gap-1">
                                Copy address
                                <button
                                    className="no-gutter text-base"
                                    onClick={() => handleCopyWalletAddress()}
                                >
                                    <CopyButton />
                                </button>
                            </span>
                        </div>
                        <div className="mt-3">
                            <button
                                className="active cmn-btn logout-btn ms-auto me-2"
                                onClick={ ()=>{
                                    disconnect()
                                    setWalletModal(false)
                                }}
                            >
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </div>
            </Modal>
        </>
      )
    }
   
    return (
      <>
        {mobile === "false" &&
        <button
            id="connectWallet"
            className="connect-btn d-none d-lg-block cmn-btn"
            type="button"
            onClick={() => setConnectModal(true)}
        >
            Connect
        </button>
        }
        {mobile === "true" &&
        <button
            id="connectWallet"
            className="connect-btn cmn-btn ms-auto me-2"
            type="button"
            onClick={() => setConnectModal(true)}
        > Connect
        </button>
        }
        <Modal
        centered
        show={connectModal}
        onHide={() => setConnectModal(null)}
            >
            <div className="modal-inner">
                <div className="shape1"></div>
                <div className="shape2"></div>
                <div className="shape3"></div>
                <div className="shape4"></div>
                <ModalHeader>
                    <h6
                        className="m-0"
                        style={{ fontWeight: "500 !important" }}
                    >
                        Connect to a wallet
                    </h6>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => setConnectModal(false)}
                    >
                        <ClearIcon color="var(--base)" />
                    </span>
                </ModalHeader>
                <ModalBody>
                    <div className="wallet-button-group">
                        {connectors.map((connector) => (
                            <button
                            className="wallet-btn"
                            disabled={!connector.ready}
                            key={connector.id}
                            onClick={() => {
                                connect({ connector })
                                setConnectModal(false)
                            }}
                            >
                                {connector.name === 'Injected' ? 'Generic' : connector.name }
                                {!connector.ready && ' (unsupported)'}
                                {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                                {connector.name === 'MetaMask' && <MetamaskIcon />}
                                {connector.name === 'Coinbase Wallet' && <CoinbaseWalletIcon/>}
                                {connector.name === 'WalletConnect' && <WalletConnectIcon />}
                                {connector.name === 'Injected' && <GenericWalletIcon />}
                            </button>
                        ))}
                    </div>
                </ModalBody>
            </div>
        </Modal>		
    </>
      
    )
  }