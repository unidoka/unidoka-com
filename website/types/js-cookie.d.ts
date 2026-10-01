declare module "js-cookie" {
  interface CookiesStatic {
    get(name: string): string | undefined;
    get(name: string): string | undefined;
    set(name: string, value: string, options?: Record<string, unknown>): void;
    remove(name: string, options?: Record<string, unknown>): void;
  }
  const Cookies: CookiesStatic;
  export default Cookies;
}
