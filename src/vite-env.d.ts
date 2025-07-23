/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly VITE_QUBIC_RPC_URL: string
  }

  interface ImportMeta {
	readonly env: ImportMetaEnv
  }


  declare const __APP_VERSION__: string
