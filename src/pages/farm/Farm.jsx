import React, { useState, useRef } from "react";
import DropdownGroup from "../../components/DropdownGroup";
import Layout from "../../components/Layout";
import AtropineFarmCard from "./AtropineFarmCard";
import farms from "../../config/constants/farms.js";

let farmsArray = JSON.parse(JSON.stringify(farms));
let farmsFilters = {};

const Farm = () => {
  const [active, setActive] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState("");

  function dropDownFilter(value) {
    switch (value) {
      case "":
        farmsArray = JSON.parse(JSON.stringify(farms));
        break;
      case "hot":
        farmsArray = JSON.parse(JSON.stringify(farms));
        farmsArray.reverse();
        break;
      case "apr":
        farmsArray = JSON.parse(JSON.stringify(farms));
        farmsArray.sort(function (a, b) {
          return (
            parseFloat(farmsFilters[b.lpAddress].farmAPR) -
            parseFloat(farmsFilters[a.lpAddress].farmAPR)
          );
        });
        break;
      case "earned":
        farmsArray = JSON.parse(JSON.stringify(farms));
        farmsArray.sort(function (a, b) {
          return (
            parseFloat(farmsFilters[b.lpAddress].pendingPine) -
            parseFloat(farmsFilters[a.lpAddress].pendingPine)
          );
        });
        break;
      case "liquidity":
        farmsArray = JSON.parse(JSON.stringify(farms));
        farmsArray.sort(function (a, b) {
          return (
            parseFloat(farmsFilters[b.lpAddress].totalLiquidity) -
            parseFloat(farmsFilters[a.lpAddress].totalLiquidity)
          );
        });
        break;
    }
    setDropdown(value);
  }

  function objectToFilter(lpAddress, object) {
    farmsFilters[lpAddress] = object;
  }

  return (
    <Layout>
      <div className="atropine-top text-base">
        <h2 className="title">Classic Farms</h2>
        <div>Stake your LP Tokens to earn yield in PINE tokens</div>
        <div
          className="mx-auto"
          style={{ maxWidth: "793px", marginTop: "19px" }}
        >
          <div className="row g-3 g-sm-4">
            <div className="col-6 col-md-3">
              <DropdownGroup
                options={options}
                dropDownFilter={dropDownFilter}
              />
            </div>
            <div className="col-6 col-md-3">
              <input
                type="text"
                className="form-control form--control"
                placeholder="Search farms"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </div>
            <div className="col-6 col-md-3 custom-sm-col">
              <div className="toggle-button-group">
                <button
                  className={`toggle-button ${active ? "active" : ""}`}
                  type="button"
                  onClick={() => setActive(true)}
                >
                  Active
                </button>
                <button
                  className={`toggle-button ${active ? "" : "active"}`}
                  type="button"
                  onClick={() => setActive(false)}
                >
                  Inactive
                </button>
              </div>
            </div>
            <div className="col-6 col-md-3 custom-sm-col">
              <label className="form-check form-switch form--switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={stacked}
                  onChange={(e) => setStacked(e.target.checked)}
                />
                <span>Staked Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* Farms Card */}
      <div
        className="row g-4 justify-content-center"
        style={{ "--bs-gutter-x": "32px" }}
      >
        {farmsArray.map((farm, index) => (
          <AtropineFarmCard
            key={index}
            objectToFilter={objectToFilter}
            active={active}
            search={search}
            stakedOnly={stacked}
            dropdown={dropdown}
            {...farm}
          />
        ))}
      </div>
    </Layout>
  );
};

const options = [
  {
    name: "Sort by",
    value: "",
  },
  {
    name: "Hot",
    value: "hot",
  },
  {
    name: "APR",
    value: "apr",
  },
  {
    name: "Earned",
    value: "earned",
  },
  {
    name: "Liquidity",
    value: "liquidity",
  },
];

export default Farm;
