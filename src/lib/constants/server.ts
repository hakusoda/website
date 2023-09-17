import { JWT_SECRET as _JWT_SECRET } from '$env/static/private';
export const JWT_SECRET = new TextEncoder().encode(_JWT_SECRET);