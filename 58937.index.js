"use strict";(self.webpackChunkexample=self.webpackChunkexample||[]).push([[58937],{46384:(t,a,e)=>{e.d(a,{pY:()=>u});var n=e(18333);const r="0x1626ba7e",s=[{type:"bytes32",name:"hash"},{type:"bytes",name:"signature"}],c=[{type:"bytes4"}];async function u(t){return(0,n.readContract)({contract:t.contract,method:[r,s,c],params:[t.hash,t.signature]})}},58937:(t,a,e)=>{e.r(a),e.d(a,{checkContractWalletSignedTypedData:()=>u});var n=e(42558),r=e(75385),s=e(46384);const c="0x1626ba7e";async function u(t){if(!(0,r.q)(t.signature))throw new Error("The signature must be a valid hex string.");return await(0,s.pY)({contract:t.contract,hash:(0,n.Z)(t.data),signature:t.signature})===c}}}]);