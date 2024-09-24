import React, { useEffect, useState } from "react";
import farmingShape from "../../assets/img/farming-shape.png";
import favImg from "../../assets/img/fav-icon.png";
import logo from "../../assets/img/logo.png";
import Layout from "../../components/Layout";

import useInterval from "../../hooks/useInterval";
import { multicall, writeContract } from "@wagmi/core";
import { useAccount } from "wagmi";
import contracts from "../../config/constants/contracts.js";
import farms from "../../config/constants/farms.js";
import erc20ABI from "../../config/abi/erc20.json";
import lpABI from "../../config/abi/lpToken.json";

const Home = () => {
  const [connected, setConnected] = React.useState(false);
  let [pinePrice, setPinePrice] = useState(0);
  let [totalSupply, setTotalSupply] = useState(0);
  let [marketCap, setMarketCap] = useState(0);
  let [totalBurned, setTotalBurned] = useState(0);
  let [circulatingSupply, setCirculatingSupply] = useState(0);
  let [pinePerBlock, setPinePerBlock] = useState(0);
  let [tvl, setTvl] = useState(0);
  let [totalLiquidity, setTotalLiquidity] = useState(0);
  let [pendingPine, setPendingPine] = useState(0);
  let [pendingPineUSD, setPendingPineUSD] = useState(0);
  let [userPine, setUserPine] = useState(0);
  let [userPineUSD, setUserPineUSD] = useState(0);
  let [farmsToHarvest, setFarmsToHarvest] = useState([]);
  let [farmsToHarvestLength, setFarmsToHarvestLength] = useState(0);

  const userAccount = useAccount({
    onConnect() {
      getStats();
      setConnected(true);
    },
    onDisconnect() {
      getStats();
      setConnected(false);
    },
  });

  async function getDexscreenerData() {
    const calls = [];

    farms.forEach((farm) => {
      const lpContract = {
        address: farm?.lpAddress,
        abi: lpABI,
      };
      calls.push({
        ...lpContract,
        functionName: "totalSupply",
      });
      calls.push({
        ...lpContract,
        functionName: "balanceOf",
        args: [contracts.masterChef.address],
      });
      calls.push({
        ...contracts.masterChef,
        functionName: "pendingPine",
        args: [farm.pid, userAccount.address],
      });
      calls.push({
        ...contracts.pineToken,
        functionName: "balanceOf",
        args: [farm.lpAddress],
      });
    });

    const farmAddressesFormated = farms.map((farm) => farm.lpAddress).join(",");

    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/pulsechain/${farmAddressesFormated}`
    );

    const rsps = await response.json();

    const data = await multicall({ contracts: calls });

    const _pinePrice =
      rsps.pairs.filter(
        (pair) =>
          pair.pairAddress === "0x0E4B3d3141608Ebc730EE225666Fd97c833d553E"
      )[0]?.priceUsd || 0;

    const formatedData = {
      pinePrice: _pinePrice,t
      totalTVL: 0,
      totalPendingPine: 0,
      totalLiquidity: 0,
      farmsToHarvest: [],
      lpData: {},
    };

    farms.forEach((farm, i) => {
      const dxData =
        rsps.pairs.find((pair) => pair.pairAddress === farm.lpAddress) || {};

      const pid = farm.pid;
      const pairPineBalance = Number(data[i * 4 + 3]?.result) / 1e18 || 0;
      const totalSupply = Number(data[i * 4]?.result) / 1e18 || 0;
      const masterchefBalance = Number(data[i * 4 + 1]?.result) / 1e18 || 0;
      const pineToHarvest = Number(data[i * 4 + 2]?.result) / 1e18 || 0;
      const liquidity = dxData?.liquidity?.usd || 0;
      let lpPrice = 0;
      if (dxData?.liquidity) {
        lpPrice =
          Number(dxData.liquidity.usd) / (Number(data[i * 4]?.result) / 1e18);
      } else {
        lpPrice =
          (pairPineBalance * _pinePrice * 2) /
          (Number(data[i * 4]?.result) / 1e18);
      }

      const farmTVL = lpPrice * masterchefBalance;

      formatedData.lpData[farm.lpAddress] = {
        totalSupply,
        masterchefBalance,
        liquidity,
        lpPrice,
        farmTVL,
        pineToHarvest,
      };

      formatedData.totalTVL += farmTVL;
      formatedData.totalLiquidity += liquidity;
      formatedData.totalPendingPine += pineToHarvest;
      if (pineToHarvest > 0) formatedData.farmsToHarvest.push(pid);
    });

    return formatedData;
  }

  async function getStats() {
    const formatedData = await getDexscreenerData();
    setPinePrice(formatedData.pinePrice);
    setFarmsToHarvest(formatedData.farmsToHarvest.join(","));
    setFarmsToHarvestLength(formatedData.farmsToHarvest.length);

    const [
      totalPineSupply,
      totalPinePerBlock,
      pineInWallet,
      lockedTokens,
      totalLockedLpSupply,
      lpPineBalance,
    ] = await multicall({
      contracts: [
        {
          ...contracts.pineToken,
          functionName: "totalSupply",
        },
        {
          ...contracts.masterChef,
          functionName: "PinePerBlock",
        },
        {
          ...contracts.pineToken,
          functionName: "balanceOf",
          args: [userAccount?.address],
        },
        {
          ...contracts.pineToken,
          functionName: "balanceOf",
          args: ["0x93d54198aAd5E5CeFEe1641211FA3C89Fb5Dc9F6"],
        },
        {
          address: "0x0E4B3d3141608Ebc730EE225666Fd97c833d553E",
          abi: lpABI,
          functionName: "totalSupply",
        },
        {
          address: "0xe846884430d527168b4eaac80af9268515d2f0cc",
          abi: erc20ABI,
          functionName: "balanceOf",
          args: ["0x0E4B3d3141608Ebc730EE225666Fd97c833d553E"],
        },
      ],
    });
    const _tvl = Number(formatedData.totalTVL).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
    setTvl(_tvl);
    const _totalLiquidity = Number(formatedData.totalLiquidity).toLocaleString(
      undefined,
      { maximumFractionDigits: 0 }
    );
    setTotalLiquidity(_totalLiquidity);
    const _pendingPine = Number(
      formatedData.totalPendingPine ? formatedData.totalPendingPine : 0
    ).toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    setPendingPine(_pendingPine);
    const _pendingPineUSD = Number(
      Number(
        formatedData.totalPendingPine ? formatedData.totalPendingPine : 0
      ) * formatedData.pinePrice
    ).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
    setPendingPineUSD(_pendingPineUSD);
    const _pinePerBlock = Number(
      Number(totalPinePerBlock.result) / 1e18
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });
    setPinePerBlock(_pinePerBlock);
    const _totalSupply = Number(
      Number(totalPineSupply.result) / 1e18
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });
    setTotalSupply(_totalSupply);
    const _marketCap = Number(
      (Number(totalPineSupply.result) / 1e18) * formatedData.pinePrice
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });
    setMarketCap(_marketCap);
    const _userPine = Number(
      Number(pineInWallet.result ? pineInWallet.result : 0) / 1e18
    ).toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    setUserPine(_userPine);
    const _userPineUSD = Number(
      (Number(pineInWallet.result ? pineInWallet.result : 0) / 1e18) *
        formatedData.pinePrice
    ).toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    setUserPineUSD(_userPineUSD);
    const lockedPineInLp =
      (33762390.325 / (Number(totalLockedLpSupply.result) / 1e18)) *
      (Number(lpPineBalance.result) / 1e18);
    const _circulatingSupply = (
      (Number(totalPineSupply.result) - Number(lockedTokens.result)) / 1e18 -
      lockedPineInLp
    ).toLocaleString(undefined, { maximumFractionDigits: 0 });
    setCirculatingSupply(_circulatingSupply);
  }

  useEffect(() => {
    getStats();
  }, []);
  useInterval(async () => {
    await getStats();
  }, 30000);

  function harvestAll() {
    farmsToHarvest.split(",").forEach(async (farm) => {
      const { hash } = await writeContract({
        ...contracts.masterChef,
        functionName: "deposit",
        account: userAccount.address,
        args: [farm, 0],
      });
    });
  }

  return (
    <Layout>
      <div className="home-top text-base">
        <img src={logo} alt="" />
        <div>Fully Decentralized Layered Yield Farm on IPFS & Pulsechain</div>
      </div>
      <div className="row g-4" style={{ "--bs-gutter-y": "32px" }}>
        <div className="col-md-6">
          <div className="atropine-card poppins">
            <div className="shape1"></div>
            <div className="shape2"></div>
            <div className="shape3"></div>
            <div className="shape4"></div>
            <img src={farmingShape} alt="" className="farming-shape" />
            <div className="innerdiv">
              <h2 className="title mb-29">Farming & Staking</h2>
              <img src={favImg} className="mb-17" alt="" />
              <div className="txt1">
                <strong>PINE</strong> to Harvest
              </div>
              <div className="txt2">{pendingPine}</div>
              <div className="txt3 mb-2">~${pendingPineUSD}</div>
              <div className="txt1">
                <strong>PINE</strong> in Wallet
              </div>
              <div className="txt4">{userPine}</div>
              <div className="txt3 mb-21">~${userPineUSD}</div>
              {!connected && (
                <button
                  className="cmn-btn"
                  type="button"
                  onClick={() => {
                    document.getElementById("connectWallet").click();
                  }}
                >
                  CONNECT WALLET
                </button>
              )}
              {connected && (
                <button className="cmn-btn" type="button" onClick={harvestAll}>
                  Harvest All ({farmsToHarvestLength})
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="atropine-card poppins">
            <div className="shape1"></div>
            <div className="shape2"></div>
            <div className="shape3"></div>
            <div className="shape4"></div>
            <div className="innerdiv">
              <div className="mx-2">
                <h2 className="title">Announcements</h2>
                <iframe id="tradingview_1233e" name="tradingview_1233e" src="about:blank" data-widget-options="symbol=PINE%2FATROPA&amp;interval=15&amp;widgetbar=%7B%22details%22%3Afalse%2C%22watchlist%22%3Afalse%2C%22news%22%3Afalse%2C%22datawindow%22%3Afalse%2C%22watchlist_settings%22%3A%7B%22default_symbols%22%3A%5B%5D%7D%7D&amp;timeFrames=%5B%7B%22text%22%3A%225y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%221y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%226m%22%2C%22resolution%22%3A%22120%22%7D%2C%7B%22text%22%3A%223m%22%2C%22resolution%22%3A%2260%22%7D%2C%7B%22text%22%3A%221m%22%2C%22resolution%22%3A%2230%22%7D%2C%7B%22text%22%3A%225d%22%2C%22resolution%22%3A%225%22%7D%2C%7B%22text%22%3A%221d%22%2C%22resolution%22%3A%221%22%7D%5D&amp;locale=en&amp;uid=tradingview_1233e&amp;clientId=0&amp;userId=0&amp;chartsStorageVer=1.0&amp;autoSaveDelay=2&amp;debug=false&amp;timezone=Europe%2FOslo&amp;ssreqdelay=500&amp;theme=dark" title="Financial Chart" frameborder="0" allowtransparency="true" scrolling="no" allowfullscreen="" style="display: block; width: 100%; height: 100%; pointer-events: auto;">
	</iframe>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="atropine-card poppins">
            <div className="shape1"></div>
            <div className="shape2"></div>
            <div className="shape3"></div>
            <div className="shape4"></div>
            <div className="innerdiv">
              <h2 className="title mb-4">Atropine Stats</h2>
              <ul className="stats-list">
                <li>
                  <span className="label">Market Cap</span>
                  <span className="value">${marketCap}</span>
                </li>
                <li>
                  <span className="label">Total Liquidity</span>
                  <span className="value">${totalLiquidity}</span>
                </li>
                <li>
                  <span className="label">Total Minted</span>
                  <span className="value">{totalSupply}</span>
                </li>
                <li>
                  <span className="label">Circulating Supply</span>
                  <span className="value">{circulatingSupply}</span>
                </li>
                <li>
                  <span className="label">New PINE/block</span>
                  <span className="value">{pinePerBlock}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="atropine-card poppins">
            <div className="shape1"></div>
            <div className="shape2"></div>
            <div className="shape3"></div>
            <div className="shape4"></div>
            <div className="innerdiv">
              <h2 className="title mb-4">Total Value Locked (TVL)</h2>
              <h3 className="amount">${tvl}</h3>
              <div className="amount-slogan">Across all Farms and Pools</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
