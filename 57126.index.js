"use strict";(self.webpackChunkexample=self.webpackChunkexample||[]).push([[57126],{57126:(e,r,t)=>{t.d(r,{resolveArweaveScheme:()=>s});const a="https://arweave.net/{fileId}";function s(e){if(e.uri.startsWith("ar://")){const r=e.uri.replace("ar://","");if(e.gatewayUrl){const t=e.gatewayUrl.endsWith("/")?"":"/";return`${e.gatewayUrl}${t}${r}`}return a.replace("{fileId}",r)}if(e.uri.startsWith("http"))return e.uri;throw new Error('Invalid URI scheme, expected "ar://" or "http(s)://"')}}}]);