import React, { useState } from "react";
import { CaretDown } from "./Icon";
// import { AngleDown } from "../IconTheme";

const DropdownGroup = ({ options, dropDownFilter }) => {
	const [index, setIndex] = useState(0);
	const [open, setOpen] = useState(false);
	const activeIndex = options[index];
	return (
		<>
			<div className={`__dropdown`}>
				<div className="__dropdown-active" onClick={() => setOpen(!open)}>
					{activeIndex.img && <img src={activeIndex.img} alt="" />}
					{activeIndex.name && <span>{activeIndex.name}</span>}
					<CaretDown />
				</div>
				<ul className={`__dropdown-menu ${open ? "active" : ""}`}>
					{options?.map(({ img, name, value }, i) => (
						<li
							key={i}
							onClick={() => {
								setIndex(i);
								setOpen(false);
								dropDownFilter(options[i].value)
							}}
							className={index === i ? "active" : ""}
						>
							{img && <img src={img} alt="name" />}
							{name && <span>{name}</span>}
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

export default DropdownGroup;
