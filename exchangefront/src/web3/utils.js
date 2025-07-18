import { ethers } from "ethers";

export const krwToMTK = (krw) => ethers.utils.parseEther(krw.toString());
export const mtkToKRW = (bn) => parseFloat(ethers.utils.formatEther(bn));
