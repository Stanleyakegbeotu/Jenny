/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_ANALYTICS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
