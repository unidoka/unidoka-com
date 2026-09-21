import Cookies from 'js-cookie';

const COOKIE_DOMAIN = "." + process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost"

export const safeCookieStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === "undefined") return null
        try {
            return Cookies.get(key) || null
        } catch {
            return null
        }
    },
    setItem: (key: string, value: string | number, expiresDays: number = 7): void => {
        if (typeof window === "undefined") return
        try {
            Cookies.set(key, String(value), {
                expires: expiresDays,
                domain: COOKIE_DOMAIN,
                path: '/',
                sameSite: 'Lax'
            })
        } catch {}
    },
    removeItem: (key: string): void => {
        if (typeof window === "undefined") return
        try {
            Cookies.remove(key, { domain: COOKIE_DOMAIN, path: '/' })
        } catch {}
    }
}
