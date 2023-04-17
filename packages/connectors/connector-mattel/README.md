# Rarible Mattel Connector

## Auth0 Popup options

```ts
const connector = new MattelConnectionProvider({
  // ...
  options: {
		auth0PopupOptions: {
			// Accepts an already-created popup window to use. If not specified, the SDK will create its own.
			// This may be useful for platforms like iOS that have security restrictions around when popups can be invoked (e.g. from a user click event)
			popup: window.open(url, "auth0:authorize:popup", ...),
      // The number of seconds to wait for a popup response before throwing a timeout error. Defaults to 180
      timeoutInSeconds: 180
		}
  }
})
```

Example of using you (can find there)[https://github.com/rarible/sdk/blob/master/packages/example/src/pages/connect/connect-options.tsx]<br/>
You can also set empty popup window after connector initialization by
```ts
connector.setPopupConfig({
  popup: window.open("")
})
```

## Auth0 logout options
```ts
const connector = new MattelConnectionProvider({
	// ...
	options: {
		auth0LogoutOptions: {
      logoutParams: {
				//The URL where Auth0 will redirect your browser to after the logout.
				returnTo: window.location.href
      }
		}
	}
})
```
