/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_MODE?: string;
  readonly VITE_DEV_MOCK_ENTRANT_COUNT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
