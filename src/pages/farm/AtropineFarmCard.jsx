import React, {useState, useEffect} from "react";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	CalculatorIcon,
	CaretDownBase,
	CaretDownBase2,
	ClearIcon,
	ShareLink,
} from "../../components/Icon";

import BigNumber from 'bignumber.js/bignumber'
import useInterval from "../../hooks/useInterval";
import contracts from "../../config/constants/contracts.js"
import { multicall, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import lpABI from "../../config/abi/lpToken.json"

BigNumber.config({
	EXPONENTIAL_AT: 1000,
	DECIMAL_PLACES: 80,
  })
const maxNumber = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

const AtropineFarmCard = ({objectToFilter, active, search, stakedOnly, index, dropdown, ...farm}) => {
	const [connected, setConnected] = React.useState(false);
	const [show, setShow] = React.useState(false);
	const [shakeModalShow, setShakeModalShow] = React.useState(null);
	const [detailsShow, setDetailsShow] = React.useState(false);
	const [staking, setStaking] = React.useState(false);
	const [approved, setApproved] = React.useState(false);
	const [farmFees, setFarmFees] = useState(0)
	const [multiplier, setMultiplier] = useState(0)
	const [pendingPine, setPendingPine] = useState(0)
	const [pendingPineUSD, setPendingPineUSD] = useState(0)
	const [totalLiquidity, setTotalLiquidity] = useState(0)
	const [stakedLpBalance, setStakedLpBalance] = useState(new BigNumber(0))
	const [stakedLpBalanceUSD, setStakedLpBalanceUSD] = useState(0)
	const [farmAPR, setFarmAPR] = useState(0)
	const [lpBalance, setLpBalance] = useState(new BigNumber(0))
	const [stakeInput, setStakeInput] = useState(new BigNumber(0))
	const [unstakeInput, setUnstakeInput] = useState(new BigNumber(0))
	const [pineEarnedPerThousand1D, setPineEarnedPerThousand1D] = useState(0)
	const [pineEarnedPerThousand7D, setPineEarnedPerThousand7D] = useState(0)
	const [pineEarnedPerThousand30D, setPineEarnedPerThousand30D] = useState(0)
	const [pineEarnedPerThousand365D, setPineEarnedPerThousand365D] = useState(0)
	const [oneThousandDollarsWorthOfPine, setOneThousandDollarsWorthOfPine] = useState(0)

	const [token1, token2] = [farm.lpSymbol.split('-')[0] + '.png', farm.lpSymbol.split('-')[1] + '.png']
	const lpLink = `https://pulsex.mypinata.cloud/ipfs/bafybeiesh56oijasgr7creubue6xt5anivxifrwd5a5argiz4orbed57qi/#/add/V${farm.version}/${farm.quoteToken.address}/${farm.token.address}`
	const scanLink = `https://scan.pulsechain.com/address/${farm.lpAddress}`


	const userAccount = useAccount({
		onConnect() {
			getStats()
			setConnected(true)
		},
		onDisconnect() {
			getStats()
			setConnected(false)
		},
	})

	function getFarmApy(poolWeight, pinePrice, poolLiquidityUsd, PINE_PER_BLOCK) {
		const PLS_BLOCK_TIME = 11;
		const BLOCKS_PER_YEAR = (60 / PLS_BLOCK_TIME) * 60 * 24 * 365;
		const yearlyPineRewardAllocation = PINE_PER_BLOCK*BLOCKS_PER_YEAR*poolWeight*0.9;
		const apy = yearlyPineRewardAllocation*pinePrice/poolLiquidityUsd*100;
		return apy;
	}

	async function getStats() {

		const query = '0x0E4B3d3141608Ebc730EE225666Fd97c833d553E' + ',' + farm.lpAddress; 
		const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/pulsechain/${query}`);
		const rsps = await response.json();
		
		const pinePrice = rsps.pairs.filter((pair)=>pair.pairAddress === '0x0E4B3d3141608Ebc730EE225666Fd97c833d553E')[0].priceUsd
		const pairData = rsps.pairs.filter((pair)=>pair.pairAddress === farm.lpAddress)[0]

		const [poolInfo, allowance, pendingAtropine, lpSupply, masterchefLpBalance, userLpBalance, userStakedLp, totalAllocPoint, pinePerBlock, pairPineBalance] = await multicall({
			contracts: [
				{
					...contracts.masterChef,
					functionName: 'poolInfo',
					args: [farm.pid]
				},
				{
					address: farm.lpAddress,
					abi: lpABI,
					functionName: 'allowance',
					args: [userAccount.address, contracts.masterChef.address]
				},
				{
					...contracts.masterChef,
					functionName: 'pendingPine',
					args: [farm.pid, userAccount.address]
				},
				{
					address: farm.lpAddress,
					abi: lpABI,
					functionName: 'totalSupply',
				},
				{
					address: farm.lpAddress,
					abi: lpABI,
					functionName: 'balanceOf',
					args: [contracts.masterChef.address]
				},
				{
					address: farm.lpAddress,
					abi: lpABI,
					functionName: 'balanceOf',
					args: [userAccount.address]
				},
				{
					...contracts.masterChef,
					functionName: 'userInfo',
					args: [farm.pid, userAccount.address]
				},
				{
					...contracts.masterChef,
					functionName: 'totalAllocPoint',
				},
				{
					...contracts.masterChef,
					functionName: 'PinePerBlock',
				},
				{
					...contracts.pineToken,
					functionName: 'balanceOf',
					args: [farm.lpAddress]
				},
			],
		});
		let _lpPrice;
		if(pairData.liquidity){
			_lpPrice = Number(pairData.liquidity.usd) / (Number(lpSupply.result) / 1e18)
		} else {
			_lpPrice =  ( (Number(pairPineBalance.result)/1e18) * pinePrice * 2) / (Number(lpSupply.result) / 1e18)
		}
		

		const _poolWeight = Number(poolInfo.result[1]) / Number(totalAllocPoint.result)

		const _farmFees = Number(poolInfo.result[4]) > 0 ? Number(poolInfo.result[4])/10000 + '% fees' : 'No Fees';
		setFarmFees(_farmFees);
		const _multiplier = Number(poolInfo.result[1]) / 10 + 'x';
		setMultiplier(_multiplier);

		const _pendingPine = Number(Number(pendingAtropine.result ? pendingAtropine.result : 0) / 1e18).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
		setPendingPine(_pendingPine);
		const _pendingPineUSD = Number(Number(pendingAtropine.result ? pendingAtropine.result : 0) / 1e18 * pinePrice).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
		setPendingPineUSD(_pendingPineUSD);
		const _totalLiquidity = Number(_lpPrice * (Number(masterchefLpBalance.result)/1e18)).toLocaleString(undefined, {maximumFractionDigits: 0});
		setTotalLiquidity(_totalLiquidity);
		const _stakedLpBalance = new BigNumber(userStakedLp.result ? userStakedLp.result[0] : 0).div(1e18)
		setStakedLpBalance(_stakedLpBalance);		
		const _staking = Number(Number(userStakedLp.result ? userStakedLp.result[0] : 0) / 1e18) > 0
		setStaking(_staking)
		const _stakedLpBalanceUSD = Number(Number(userStakedLp.result ? userStakedLp.result[0] : 0) / 1e18 * _lpPrice).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
		setStakedLpBalanceUSD(_stakedLpBalanceUSD);
		const _farmAPR = Number(getFarmApy(_poolWeight, pinePrice, Number(_lpPrice * (Number(masterchefLpBalance.result)/1e18)), Number(pinePerBlock.result)/1e18)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
		setFarmAPR(_farmAPR);
		const _lpBalance = new BigNumber(userLpBalance.result ? userLpBalance.result : 0).div(1e18)
		setLpBalance(_lpBalance);

		const _approved = Number(allowance.result) > _lpBalance.mul(1e18);
		setApproved(_approved);
		
		objectToFilter(farm.lpAddress, {
			pendingPine: Number(pendingAtropine.result) / 1e18,
			totalLiquidity: _lpPrice * (Number(masterchefLpBalance.result)/1e18),
			farmAPR: getFarmApy(_poolWeight, pinePrice, Number(_lpPrice * (Number(masterchefLpBalance.result)/1e18)), Number(pinePerBlock.result)/1e18)
		})
		console.log(farm.lpSymbol, _lpPrice)
		const _apr = Number(getFarmApy(_poolWeight, pinePrice, Number(_lpPrice * (Number(masterchefLpBalance.result)/1e18)), Number(pinePerBlock.result)/1e18)) 
		const _pineEarnedPerThousand1D = calculatePineEarnedPerThousandDollars( 1, _apr, pinePrice )
		setPineEarnedPerThousand1D(_pineEarnedPerThousand1D)
		const _pineEarnedPerThousand7D = calculatePineEarnedPerThousandDollars(  7, _apr, pinePrice )
		setPineEarnedPerThousand7D(_pineEarnedPerThousand7D)
		const _pineEarnedPerThousand30D = calculatePineEarnedPerThousandDollars( 30, _apr, pinePrice )
		setPineEarnedPerThousand30D(_pineEarnedPerThousand30D)
		const _pineEarnedPerThousand365D = calculatePineEarnedPerThousandDollars( 365, _apr, pinePrice )
		setPineEarnedPerThousand365D(_pineEarnedPerThousand365D)

		const _oneThousandDollarsWorthOfPine = 1000 / pinePrice
		setOneThousandDollarsWorthOfPine(_oneThousandDollarsWorthOfPine)
	}

	useEffect(() => {
		getStats();
	  },[]);
	useEffect(() => {
		getStats();
	},[dropdown]);
	useInterval(async () => {
		await getStats();
	}, 15000);

	async function approve() {
		const amount = lpBalance.mul(1e18).add(1);
		const { hash } = await writeContract({
			address: farm.lpAddress,
			abi: lpABI,
			functionName: 'approve',
			account: userAccount.address,
			args: [contracts.masterChef.address, amount],
		})
		getStats();
	}

	async function harvest() {
		const { hash } = await writeContract({
			...contracts.masterChef,
			functionName: 'deposit',
			account: userAccount.address,
			args: [farm.pid, 0],
		})
		getStats();
	}

	async function stake() {
		const _value = new BigNumber(stakeInput).mul(1e18)
		const { hash } = await writeContract({
			...contracts.masterChef,
			functionName: 'deposit',
			account: userAccount.address,
			args: [farm.pid, _value],
		})
		getStats();
	}

	async function unstake() {
		const _value = new BigNumber(unstakeInput).mul(1e18)
		const { hash } = await writeContract({
			...contracts.masterChef,
			functionName: 'withdraw',
			account: userAccount.address,
			args: [farm.pid, _value],
		})
		getStats();
	}

	async function setMaxStakeInput() {
		setStakeInput(lpBalance)
	}

	async function setMaxUnstakeInput() {
		setUnstakeInput(stakedLpBalance)
	}

	function roundToTwoDp(number) { return Math.round(number * 100) / 100 }

	function  calculatePineEarnedPerThousandDollars( numberOfDays, farmApy, pinePrice ) {
	  // Everything here is worked out relative to a year, with the asset compounding daily
	  const timesCompounded = 365
	  //   We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
	  const apyAsDecimal = farmApy / 100
	  const daysAsDecimalOfYear = numberOfDays / timesCompounded
	  //   Calculate the starting CAKE balance with a dollar balance of $1000.
	  const principal = 1000 / pinePrice
	
	  // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
	  const finalAmount = principal * (1 + apyAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)
	
	  // To get the pine earned, deduct the amount after compounding (finalAmount) from the starting CAKE balance (principal)
	  const interestEarned = finalAmount - principal
	  return roundToTwoDp(interestEarned)
	}
	
	if(active !== farm.farmActive) return (<></>)
	if(search !== '' && !farm.lpSymbol.toLowerCase().includes(search.toLowerCase())) return (<></>)
	if(stakedOnly && pendingPine === Number(0).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})) return (<></>)
	return (
		<div className="col-xl-4 col-sm-6" key={index}>
			<div className="contract-card atropine-card h-auto">
				<div className="shape1"></div>
				<div className="shape2"></div>
				<div className="shape3"></div>
				<div className="shape4"></div>
				<div className="innerdiv">
					<div className="atropine-top mb-0">
						<div className="d-flex align-items-start justify-content-between">
							<div>
								<img src={'./tokens/' + token1} alt="" height={57} width={57} style={{position: 'relative', zIndex: '2'}}/>
								<img src={'./tokens/' + token2} alt="" height={57} width={57} style={{position: 'relative', zIndex: '1', marginLeft: '-10px'}}/>
							</div>
							<div className="text-end">
								<h6 className="name">{farm.lpSymbol}</h6>
								<div className="btn btn-outline-base me-1">{farmFees}</div>
								<div className="btn btn-base">{multiplier}</div>
							</div>
						</div>
						<ul className="top-info mt-3">
							<li>
								<span>APR:</span>
								<span className="d-flex align-items-center gap-2">
									<span
										className="cursor-pointer"
										onClick={() => setShow(true)}
									>
										<CalculatorIcon />
									</span>
									<span style={{ transform: "translateY(2px)" }}>
										{farmAPR}%
									</span>
								</span>
							</li>
							<li className="apy-value"></li>
							<li>
								<span>Earn:</span>
								<strong className="text-base">PINE</strong>
							</li>
						</ul>
					</div>
					<div className="atropine-middle poppins">
						<div className="pt-3">
							<div className="txt1">
								<strong className="text-base">PINE</strong> Earned
							</div>
							<div className="txt5">{pendingPine}</div>
							<div className="text-base">${pendingPineUSD}</div>
							<div className="txt1">
								<strong className="text-base">{farm.lpSymbol}</strong> Staked
							</div>
							<div className="txt5">{Number(stakedLpBalance).toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3})}</div>
							<div className="text-base">${stakedLpBalanceUSD}</div>
						</div>
						<div className="text-end align-self-center">
							{!staking && (
							<div>
								<button
									className="harvest-button no-gutter mb-2"
									type="button"
									style={{cursor: 'not-allowed', background: "var(--base-5)"}}
									onClick={harvest}
									disabled
								>
									Harvest
								</button>
							</div>
							)}
							{staking && (
							<div>
								<button
									className="harvest-button no-gutter mb-2"
									type="button"
									onClick={harvest}
								>
									Harvest
								</button>
							</div>
							)}
							{approved && !staking && (
								<button
									className="cmn-btn"
									type="button"
									onClick={() => setShakeModalShow("stake")}
									style={{
										paddingInline: "22px",
										minWidth: "0",
										width: "auto",
										borderRadius: "5px",
									}}
								>
									Stake LP
								</button>
							)}
							{staking && (
								<>
									<div className="d-flex gap-1">
										<button
											className="harvest-button no-gutter w-auto flex-grow-1"
											type="button"
											onClick={() => setShakeModalShow("stake")}
										>
											+
										</button>
										<button
											className="harvest-button no-gutter w-auto flex-grow-1"
											type="button"
											onClick={() => setShakeModalShow("unstake")}
										>
											-
										</button>
									</div>
								</>
							)}
						</div>
					</div>
					{!connected && (
						<button
							className="cmn-btn w-100 font-bold"
							type="button"
							onClick={()=>{
								document.getElementById('connectWallet').click()
							}}
						>
							CONNECT WALLET
						</button>
					)}
					{connected && !approved && (
						<button
							className="cmn-btn w-100 font-bold"
							type="button"
							onClick={approve}
						>
							APPROVE CONTRACT
						</button>
					)}
					<div className="hrr"></div>
					<button
						className="details-button no-gutter"
						onClick={() => setDetailsShow(!detailsShow)}
					>
						{!detailsShow ? "Details" : "Hide"}
						{!detailsShow ? <CaretDownBase /> : <CaretDownBase2 />}
					</button>
					{detailsShow && (
						<>
							<div className="details-txt">
								<div className="mb-1">
									Stake:
									<Link to={lpLink} target="_blank" className="text-base hover-text-base">
										<text style={{color: 'white'}}>{' ' + farm.lpSymbol + ' LP '} </text>
										<ShareLink/>
									</Link>
								</div>
								<div className="mb-1">
									Total Liquidity:{" "}
									<span className="text-base">${totalLiquidity}</span>{" "}
								</div>
								<Link to={scanLink} target="_blank" className="text-base hover-text-base">
									View on PulseScan
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
			<Modal centered show={show} onHide={() => setShow(false)}>
				<div className="modal-inner">
					<div className="shape1"></div>
					<div className="shape2"></div>
					<div className="shape3"></div>
					<div className="shape4"></div>
					<ModalHeader>
						<span>ROI Calculator</span>
						<span
							style={{ cursor: "pointer" }}
							onClick={() => setShow(false)}
						>
							<ClearIcon />
						</span>
					</ModalHeader>
					<ModalBody>
						<table className="table __table">
							<thead>
								<tr>
									<th>Timeframe</th>
									<th>ROI</th>
									<th>PINE PER $1000</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>1 Day</td>
									<td>{((pineEarnedPerThousand1D / oneThousandDollarsWorthOfPine) * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
									<td>{pineEarnedPerThousand1D.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								</tr>
								<tr>
									<td>7 Days</td>
									<td>{((pineEarnedPerThousand7D / oneThousandDollarsWorthOfPine) * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
									<td>{pineEarnedPerThousand7D.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								</tr>
								<tr>
									<td>30 Days</td>
									<td>{((pineEarnedPerThousand30D / oneThousandDollarsWorthOfPine) * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
									<td>{pineEarnedPerThousand30D.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								</tr>
								<tr>
									<td>365 Days</td>
									<td>{((pineEarnedPerThousand365D / oneThousandDollarsWorthOfPine) * 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
									<td>{pineEarnedPerThousand365D.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
								</tr>
							</tbody>
						</table>
						<div className="roi-text">
							Calculated based on current rates. Compounding once daily.
							Rates are estimates provided for your convenience only, and
							by no means represent guaranteed returns.
						</div>
						<div className="text-center">
							<Link type="button" className="cmn-btn btn-sm" to={lpLink} target="_blank" style={{height: '24px', lineHeight:'24px', color: '#280046'}}>
								Get {farm.lpSymbol} LP
							</Link>
						</div>
					</ModalBody>
				</div>
			</Modal>
			<Modal
				centered
				show={shakeModalShow}
				onHide={() => setShakeModalShow(null)}
			>
				<div className="modal-inner">
					<div className="shape1"></div>
					<div className="shape2"></div>
					<div className="shape3"></div>
					<div className="shape4"></div>
					<ModalHeader>
						<span className="text-base">
							{shakeModalShow === "stake"
								? `Stake ${farm.lpSymbol} LP`
								: `Unstake ${farm.lpSymbol} LP`}
						</span>
						<span
							style={{ cursor: "pointer" }}
							onClick={() => setShakeModalShow(false)}
						>
							<ClearIcon color="var(--base)" />
						</span>
					</ModalHeader>
					<ModalBody>
					{shakeModalShow === "stake" && (
						<div>
							<div className="text-end fs-14 mb-11">
							 {Number(lpBalance).toLocaleString(undefined, {minimumFractionDigits:4, maximumFractionDigits: 4})} {farm.lpSymbol} Available
							</div>
							
								<div className="stake-form-group">
									<input
									type="number"
									className="form-control form--control"
									placeholder="0"
									value={stakeInput}
									onChange={(e) => setStakeInput(e.target.value)} 
									/>
									<button className="max no-gutter text-white" onClick={ setMaxStakeInput }>
										Max
									</button>
								</div>
							
							
							<div className="d-flex flex-wrap justify-content-around pt-4">
								<button
									className="cmn-btn btn-outline w-auto px-4"
									type="button"
									onClick={() => setShakeModalShow(null)}
								>
									Cancel
								</button>
								<button 
									className="cmn-btn w-auto px-4"
									type="button" 
									onClick={stake}	
								>
									Confirm
								</button>
							</div>
							<div className="text-center pt-4 poppins">
								<div className="pt-2">
									<Link to="#" className="text-base hover-text-base">
										Get {farm.lpSymbol} LP <ShareLink />
									</Link>
								</div>
							</div>
						</div>
					)}
					{shakeModalShow === "unstake" && (
						<div>
							<div className="text-end fs-14 mb-11">
							 {Number(stakedLpBalance).toLocaleString(undefined, {minimumFractionDigits:4, maximumFractionDigits: 4})} {farm.lpSymbol} Available
							</div>
							
								<div className="stake-form-group">
									<input
									type="number"
									className="form-control form--control"
									placeholder="0"
									value={unstakeInput}
									onChange={(e) => setUnstakeInput(e.target.value)} 
									/>
									<button className="max no-gutter text-white" onClick={ setMaxUnstakeInput }>
										Max
									</button>
								</div>
							
							
							<div className="d-flex flex-wrap justify-content-around pt-4">
								<button
									className="cmn-btn btn-outline w-auto px-4"
									type="button"
									onClick={() => setShakeModalShow(null)}
								>
									Cancel
								</button>
								<button 
									className="cmn-btn w-auto px-4"
									type="button" 
									onClick={unstake}	
								>
									Confirm
								</button>
							</div>
							<div className="text-center pt-4 poppins">
								<div className="pt-2">
									<Link to="#" className="text-base hover-text-base">
										Get {farm.lpSymbol} LP <ShareLink />
									</Link>
								</div>
							</div>
						</div>
					)}
					</ModalBody>
				</div>
			</Modal>
		</div>
	);
};

export default AtropineFarmCard;
