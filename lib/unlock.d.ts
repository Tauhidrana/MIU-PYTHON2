export function makeCode(buyerId: string): string;
export function checkCode(input: unknown): string | null;
export function makeToken(buyerId: string): string;
export function checkToken(token: unknown): string | null;
export function rateLimited(ip: string, limit?: number, windowMs?: number): boolean;
export function secret(): string;
export const LOCKED_CHAPTERS: number[];
