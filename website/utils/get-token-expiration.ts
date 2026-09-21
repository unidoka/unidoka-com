export function getTokenExpiration(token: string): number | null {
    try {
        const payloadBase64 = token.split('.')[1]
        const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
        return decodedPayload.exp ? decodedPayload.exp * 1000 : null
    } catch {
        return null
    }
}
