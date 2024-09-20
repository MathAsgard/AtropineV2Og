import React, {useState} from "react";


import useInterval from "../hooks/useInterval";

const CountdownCard = ({timestamp}) => {
	//const [days, setDays] = React.useState(0);
	const [hours, setHours] = React.useState(0);
	const [minutes, setMinutes] = React.useState(0);
	const [seconds, setSeconds] = React.useState(0);



	useInterval(async () => {
		let _timestamp = (Date.now()/1000).toFixed(0) - timestamp;
		if(Number(timestamp) === 0) _timestamp = 0
		if(Number(_timestamp) < 0) _timestamp = 0
		//let days = Math.floor(_timestamp / 86400);
		//_timestamp -= days * 86400;
		//setDays(days);
		let hours = Math.floor(_timestamp / 3600);
		_timestamp -= hours * 3600;
		setHours(hours);
		let minutes = Math.floor(_timestamp / 60) % 60;
		_timestamp -= minutes * 60;
		setMinutes(minutes);
		let seconds = _timestamp % 60;
		setSeconds(seconds);
	}, 1000);
	return (
		<div className={`countdown`}>
			<div className="item">
				<span className="subtitle">
					{hours < 10 ? `0${hours}` : hours}
				</span>
				<span>hrs</span>
			</div>
			<div className="item">
				<span className="subtitle">
					{minutes < 10 ? `0${minutes}` : minutes}
				</span>
				<span>mins</span>
			</div>
			<div className="item">
				<span className="subtitle">
					{seconds < 10 ? `0${seconds}` : seconds}
				</span>
				<span>secs</span>
			</div>
		</div>
	);
};

export default CountdownCard;
