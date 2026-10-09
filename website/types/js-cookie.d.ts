declare module "js-cookie" {
  interface CookiesStatic {
    /** Read every cookie as a name→value map. */
    get(): Record<string, string>;
    /** Read a single cookie by name. */
    get(name: string): string | undefined;
    set(name: string, value: string, options?: Record<string, unknown>): void;
    remove(name: string, options?: Record<string, unknown>): void;
  }
  const Cookies: CookiesStatic;
  export default Cookies;
}
