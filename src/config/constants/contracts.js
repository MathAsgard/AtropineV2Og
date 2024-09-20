import masterchefABI from '../abi/masterchef.json';
import IERC20ABI from '../abi/erc20.json';

export default {
  pineToken: {
    address: '0xe846884430d527168b4eaac80af9268515d2f0cc',
    abi: IERC20ABI,
  },
  masterChef: {
    address: '0x6A621e240BA80B90090981D71E535C5148EFA450',
    abi: masterchefABI,
  }
}
