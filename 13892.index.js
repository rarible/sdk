"use strict";(self.webpackChunkexample=self.webpackChunkexample||[]).push([[13892],{59174:(t,e,n)=>{n.d(e,{XR:()=>W});var r=n(60550);function a(t){const e=[],n=t.length;for(let a=0;a<n;a++){const n=t[a],i=(0,r.B)(n);e.push(i)}return e}var i=n(24864),o=n(80437),s=n(7764),c=n(27238);const u="https://{clientId}.ipfscdn.io/ipfs/{cid}";const l="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",d=l.length,f=(()=>l.charAt(0))(),p=(()=>Math.log(256)/Math.log(d))();var h=n(48412);let y,w,m=0;const b=[];let g,v,x=null,P=0,A={};let E,T,k=0;const S=[];let $,B;const I={useRecords:!1,mapsAsObjects:!0};class C{constructor(){Object.assign(this,I)}decodeKey(t){return t}decode(t,e=-1){w=e>-1?e:t.length,m=0,P=0,k=0,v=null,x=b,E=null,y=t;try{B=t.dataView||(t.dataView=new DataView(t.buffer,t.byteOffset,t.byteLength))}catch(e){if(y=null,t instanceof Uint8Array)throw e;throw new Error(`Source must be a Uint8Array or Buffer but was a ${t&&"object"==typeof t?t.constructor.name:typeof t}`)}return this instanceof C?(A=this,$=this.sharedValues&&(this.pack?new Array(this.maxPrivatePackedValues||16).concat(this.sharedValues):this.sharedValues),(!g||g.length>0)&&(g=[])):(A=I,(!g||g.length>0)&&(g=[]),$=null),function(){try{const t=U();if(E){if(m>=E.postBundlePosition){const t=new Error("Unexpected bundle position");throw t.incomplete=!0,t}m=E.postBundlePosition,E=null}if(m!==w){if(m>w){const t=new Error("Unexpected end of CBOR data");throw t.incomplete=!0,t}throw new Error("Data read, but end of buffer not reached")}return g=null,y=null,T&&(T=null),t}catch(t){throw y=null,T=null,g=null,(t instanceof RangeError||t.message.startsWith("Unexpected end of buffer"))&&(t.incomplete=!0),t}}()}}function U(){let t=y[m++];const e=t>>5;if(t&=31,t>23){if(24!==t)throw new Error(`Unknown token ${t}`);t=y[m++]}switch(e){case 0:return t;case 1:return~t;case 2:return n=t,A.copyBuffers?Uint8Array.prototype.slice.call(y,m,m+=n):y.subarray(m,m+=n);case 3:if(k>=m)return v.slice(m-0,(m+=t)-0);if(0===k&&w<140&&t<32){const e=t<16?function(t){if(t<4){if(t<2){if(0===t)return"";const e=y[m++];return(128&e)>1?void(m-=1):F(e)}const e=y[m++],n=y[m++];if((128&e)>0||(128&n)>0)return void(m-=2);if(t<3)return F(e,n);const r=y[m++];return(128&r)>0?void(m-=3):F(e,n,r)}const e=y[m++],n=y[m++],r=y[m++],a=y[m++];if((128&e)>0||(128&n)>0||(128&r)>0||(128&a)>0)return void(m-=4);if(t<6){if(4===t)return F(e,n,r,a);const i=y[m++];return(128&i)>0?void(m-=5):F(e,n,r,a,i)}if(t<8){const i=y[m++],o=y[m++];if((128&i)>0||(128&o)>0)return void(m-=6);if(t<7)return F(e,n,r,a,i,o);const s=y[m++];return(128&s)>0?void(m-=7):F(e,n,r,a,i,o,s)}const i=y[m++],o=y[m++],s=y[m++],c=y[m++];if((128&i)>0||(128&o)>0||(128&s)>0||(128&c)>0)return void(m-=8);if(t<10){if(8===t)return F(e,n,r,a,i,o,s,c);const u=y[m++];return(128&u)>0?void(m-=9):F(e,n,r,a,i,o,s,c,u)}if(t<12){const u=y[m++],l=y[m++];if((128&u)>0||(128&l)>0)return void(m-=10);if(t<11)return F(e,n,r,a,i,o,s,c,u,l);const d=y[m++];return(128&d)>0?void(m-=11):F(e,n,r,a,i,o,s,c,u,l,d)}const u=y[m++],l=y[m++],d=y[m++],f=y[m++];if((128&u)>0||(128&l)>0||(128&d)>0||(128&f)>0)return void(m-=12);if(t<14){if(12===t)return F(e,n,r,a,i,o,s,c,u,l,d,f);const p=y[m++];return(128&p)>0?void(m-=13):F(e,n,r,a,i,o,s,c,u,l,d,f,p)}const p=y[m++],h=y[m++];if((128&p)>0||(128&h)>0)return void(m-=14);if(t<15)return F(e,n,r,a,i,o,s,c,u,l,d,f,p,h);const w=y[m++];if(!((128&w)>0))return F(e,n,r,a,i,o,s,c,u,l,d,f,p,h,w);m-=15}(t):function(t){const e=m,n=new Array(t);for(let r=0;r<t;r++){const t=y[m++];if((128&t)>0)return void(m=e);n[r]=t}return F.apply(String,n)}(t);if(null!==e)return e}return readFixedString(t);case 4:{const e=new Array(t);for(let n=0;n<t;n++)e[n]=U();return e}case 5:{const e={};for(let n=0;n<t;n++)e[M(U())]=U();return e}default:if(Number.isNaN(t)){const t=new Error("Unexpected end of CBOR data");throw t.incomplete=!0,t}throw new Error(`Unknown CBOR token ${t}`)}var n}function M(t){if("string"==typeof t)return"__proto__"===t?"__proto_":t;if("object"!=typeof t)return t.toString();throw new Error("Invalid property name type "+typeof t)}const F=String.fromCharCode,G={Error,RegExp};S[27]=t=>(G[t[0]]||Error)(t[1],t[2]),S[28]=t=>{T||(T=new Map,T.id=0);const e=T.id++;let n;n=y[m]>>5==4?[]:{};const r={target:n};T.set(e,r);const a=t();return r.used?Object.assign(n,a):(r.target=a,a)};const R=new Array(147);for(let t=0;t<256;t++)R[t]=(()=>Number(`1e${Math.floor(45.15-.30103*t)}`))();const _=(new C).decode;var j=n(75385);var K=n(91e3);const V=new WeakMap;function W(t,e="https://contract.thirdweb.com/abi"){if(V.has(t))return V.get(t);const n=(async()=>{if(t.abi)return t.abi;try{return await async function(t,e="https://contract.thirdweb.com/abi"){const n=await(0,c.KI)(t.client)(`${e}/${t.chain.id}/${t.address}`),r=await n.json();if(!r||r.error)throw new Error(`Failed to resolve ABI from contract API. ${r.error||""}`);return r}(t,e)}catch(e){return await async function(t,e,n){const[r,c,u,l]=await Promise.all([O(t),H(t),Q(t),z(t)]),d=[...new Set([...c,...u,...l])];if(!d.length)return r;return function(t){let e=t.pluginAbis.flat().filter((t=>"constructor"!==t.type));t.rootAbi&&(e=[...t.rootAbi||[],...e].filter(Boolean));return function(t){const e=(0,o.e)(t),n=[],r=t.length;for(let a=0;a<r;a++){const r=t[a];(0,i.WL)(r)||n.push((0,s.uT)(r,e))}return n}([...new Set(a(e))])}({rootAbi:r,pluginAbis:await async function(t){return Promise.all(t.plugins.map((e=>{const n={...t.contract,address:e};return t.resolveSubAbi?t.resolveSubAbi(n):O(n)})))}({contract:t,plugins:d,resolveSubAbi:void 0})})}(t)}})();return V.set(t,n),n}async function O(t){const e=await(0,K._)(t);if("0x"===e){const{id:e,name:n}=t.chain;throw new Error(`Failed to load contract bytecode. Make sure the contract [${t.address}] exists on the chain [${n||"Unknown Chain"} (chain id: ${e})]`)}const r=function(t){const e=(0,h.aT)(function(t){return(0,j.q)(t,{strict:!1})?t:`0x${t}`}(t)),n=256*e[e.length-2]+e[e.length-1],r=e.length-2-n;if(r<0||r>e.length)return;const a=e.slice(r,-2),i=_(a);return"ipfs"in i?`ipfs://${function(t){if(!(t instanceof Uint8Array))throw new TypeError("Expected Uint8Array");if(0===t.length)return"";let e=0,n=0,r=0;const a=t.length;for(;r!==a&&0===t[r];)r++,e++;const i=(a-r)*p+1>>>0,o=new Uint8Array(i);for(;r!==a;){let e=t[r]||0,a=0;for(let t=i-1;(0!==e||a<n)&&-1!==t;t--,a++)e+=256*(o[t]||0)>>>0,o[t]=e%d>>>0,e=e/d>>>0;if(0!==e)throw new Error("Non-zero carry");n=a,r++}let s=i-n;for(;s!==i&&0===o[s];)s++;let c=f.repeat(e);for(;s<i;++s)c+=l.charAt(o[s]||0);return c}(i.ipfs)}`:void 0}(e);if(!r)return[];try{const e=await async function(t){let e;if(t.uri.startsWith("ar://")){const{resolveArweaveScheme:r}=await n.e(57126).then(n.bind(n,57126));e=r(t)}else e=function(t){if(t.uri.startsWith("ipfs://")){const e=t.client.config?.storage?.gatewayUrl??u,n=t.client.clientId,r=function(t){if(!t.startsWith("ipfs://"))return t;const e=t.search(/\/(Qm|bafy)/i);return t.slice(e+1)}(t.uri);return`${e.replace("{clientId}",n).split("/ipfs")[0]}/ipfs/${r}`}if(t.uri.startsWith("http"))return t.uri;throw new Error('Invalid URI scheme, expected "ipfs://" or "http(s)://"')}(t);const r=await(0,c.KI)(t.client)(e,{keepalive:t.client.config?.storage?.fetch?.keepalive,headers:t.client.config?.storage?.fetch?.headers,requestTimeoutMs:t.client.config?.storage?.fetch?.requestTimeoutMs});if(!r.ok)throw r.body?.cancel(),new Error(`Failed to download file: ${r.statusText}`);return r}({uri:r,client:t.client});return(await e.json()).output.abi}catch{return[]}}const L={inputs:[],name:"getAllPlugins",outputs:[{components:[{internalType:"bytes4",name:"functionSelector",type:"bytes4"},{internalType:"string",name:"functionSignature",type:"string"},{internalType:"address",name:"pluginAddress",type:"address"}],internalType:"struct IPluginMap.Plugin[]",name:"registered",type:"tuple[]"}],stateMutability:"view",type:"function"},N={inputs:[],name:"getAllExtensions",outputs:[{components:[{components:[{internalType:"string",name:"name",type:"string"},{internalType:"string",name:"metadataURI",type:"string"},{internalType:"address",name:"implementation",type:"address"}],internalType:"struct IExtension.ExtensionMetadata",name:"metadata",type:"tuple"},{components:[{internalType:"bytes4",name:"functionSelector",type:"bytes4"},{internalType:"string",name:"functionSignature",type:"string"}],internalType:"struct IExtension.ExtensionFunction[]",name:"functions",type:"tuple[]"}],internalType:"struct IExtension.Extension[]",name:"allExtensions",type:"tuple[]"}],stateMutability:"view",type:"function"},q={inputs:[],name:"facets",outputs:[{components:[{internalType:"address",name:"facetAddress",type:"address"},{internalType:"bytes4[]",name:"functionSelectors",type:"bytes4[]"}],type:"tuple[]"}],stateMutability:"view",type:"function"};async function H(t){try{const{readContract:e}=await Promise.resolve().then(n.bind(n,18333)),r=await e({contract:t,method:L});return r.length?[...new Set(r.map((t=>t.pluginAddress)))]:[]}catch{}return[]}async function Q(t){try{const{readContract:e}=await Promise.resolve().then(n.bind(n,18333)),r=await e({contract:t,method:N});return r.length?[...new Set(r.map((t=>t.metadata.implementation)))]:[]}catch{}return[]}async function z(t){try{const{readContract:e}=await Promise.resolve().then(n.bind(n,18333)),r=await e({contract:t,method:q});return r.length?r.map((t=>t.facetAddress)):[]}catch{}return[]}},58296:(t,e,n)=>{n.d(e,{Q:()=>c});var r=n(16590),a=n(38782),i=n(23903),o=n(11734);const s=new WeakMap;async function c(t){if(s.has(t.transaction))return s.get(t.transaction);const{account:e}=t,c=(async()=>{const s=await(0,i.r)(t.transaction.gas);if(s)return s;if(e?.estimateGas)try{let n=await e.estimateGas(t.transaction);return t.transaction.chain.experimental?.increaseZeroByteCount&&(n=(0,a.d)(n)),n}catch(e){throw await(0,o.c)({error:e,contract:t.transaction.__contract})}const{encode:c}=await Promise.resolve().then(n.bind(n,20408)),[u,l,d]=await Promise.all([c(t.transaction),(0,i.r)(t.transaction.to),(0,i.r)(t.transaction.value)]),[{getRpcClient:f},{eth_estimateGas:p}]=await Promise.all([Promise.resolve().then(n.bind(n,36223)),n.e(10560).then(n.bind(n,10560))]),h=f(t.transaction),y=t.from??t.account?.address??void 0;try{let e=await p(h,(0,r.Bv)({to:l,data:u,from:y,value:d}));return t.transaction.chain.experimental?.increaseZeroByteCount&&(e=(0,a.d)(e)),e}catch(e){throw await(0,o.c)({error:e,contract:t.transaction.__contract})}})();return s.set(t.transaction,c),c}},13892:(t,e,n)=>{n.r(e),n.d(e,{sendTransaction:()=>c});var r=n(17371),a=n(36223),i=n(23903),o=n(20408),s=n(58296);async function c(t){const{account:e,transaction:c,gasless:u}=t,l=await async function(t){const e=(0,a.getRpcClient)(t.transaction),c=t.transaction.chain.id,u=t.from;let[l,d,f,p,h,y,w]=await Promise.all([(0,o.encode)(t.transaction),(async()=>{const r=await(0,i.r)(t.transaction.nonce);return void 0!==r?r:u?await n.e(53140).then(n.bind(n,53140)).then((({eth_getTransactionCount:t})=>t(e,{address:u,blockTag:"pending"}))):void 0})(),(0,s.Q)(t),(0,r.Y)(t.transaction),(0,i.r)(t.transaction.to),(0,i.r)(t.transaction.accessList),(0,i.r)(t.transaction.value)]);const m=await(0,i.r)(t.transaction.extraGas);return m&&(f+=m),{to:h,chainId:c,data:l,gas:f,nonce:d,accessList:y,value:w,...p}}({transaction:c,from:e.address});if(u){const{sendGaslessTransaction:t}=await n.e(61061).then(n.bind(n,61061));return t({account:e,transaction:c,serializableTransaction:l,gasless:u})}return{...await e.sendTransaction(l),chain:c.chain,client:c.client}}},11734:(t,e,n)=>{n.d(e,{c:()=>i});var r=n(63117),a=n(59174);async function i(t){const{error:e,contract:n}=t;if("object"==typeof e){const t=e;if(t.data){if("0x"!==t.data){let e=n?.abi;n&&!e&&(e=await(0,a.XR)(n).catch((()=>{})));const i=(0,r.W)({data:t.data,abi:e});return new o(`${i.errorName}${i.args?` - ${i.args}`:""}`,n)}return new o("Execution Reverted",n)}}return e}class o extends Error{constructor(t,e){super(),Object.defineProperty(this,"contractAddress",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"chainId",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.name="TransactionError",this.contractAddress=e?.address,this.chainId=e?.chain?.id,this.message=t}}},16590:(t,e,n)=>{n.d(e,{Bv:()=>i});var r=n(38903);const a={legacy:"0x0",eip2930:"0x1",eip1559:"0x2",eip4844:"0x3"};function i(t){const e={};return void 0!==t.accessList&&(e.accessList=t.accessList),void 0!==t.blobVersionedHashes&&(e.blobVersionedHashes=t.blobVersionedHashes),void 0!==t.blobs&&("string"!=typeof t.blobs[0]?e.blobs=t.blobs.map((t=>(0,r.My)(t))):e.blobs=t.blobs),void 0!==t.data&&(e.data=t.data),void 0!==t.from&&(e.from=t.from),void 0!==t.gas&&(e.gas=(0,r.cK)(t.gas)),void 0!==t.gasPrice&&(e.gasPrice=(0,r.cK)(t.gasPrice)),void 0!==t.maxFeePerBlobGas&&(e.maxFeePerBlobGas=(0,r.cK)(t.maxFeePerBlobGas)),void 0!==t.maxFeePerGas&&(e.maxFeePerGas=(0,r.cK)(t.maxFeePerGas)),void 0!==t.maxPriorityFeePerGas&&(e.maxPriorityFeePerGas=(0,r.cK)(t.maxPriorityFeePerGas)),void 0!==t.nonce&&(e.nonce=(0,r.cK)(t.nonce)),void 0!==t.to&&(e.to=t.to),void 0!==t.type&&(e.type=a[t.type]),void 0!==t.value&&(e.value=(0,r.cK)(t.value)),e}}}]);