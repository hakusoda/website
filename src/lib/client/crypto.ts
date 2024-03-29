import base64 from '@hexagon/base64';
function get_object_store_count(store: IDBObjectStore): Promise<number> {
	return new Promise(resolve => {
		store.count().onsuccess = ({ target }) => resolve((target as IDBRequest<number>).result);
	});
}

export function store_auth_key_pair(): Promise<string> {
	return new Promise(resolve => {
		const request = indexedDB.open('SOMETHING', 143);
		request.onupgradeneeded = ({ target }) =>
			(target as IDBOpenDBRequest).result.createObjectStore('SOMETHING', { autoIncrement: true });
		request.onsuccess = async ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			try {
				const store = database.transaction(['SOMETHING'], 'readonly').objectStore('SOMETHING');
				if (!await get_object_store_count(store)) {
					const { publicKey, privateKey } = await crypto.subtle.generateKey({
						name: 'ECDSA',
						namedCurve: 'P-384'
					}, false, ['sign', 'verify']);

					const store = database.transaction(['SOMETHING'], 'readwrite').objectStore('SOMETHING');
					store.put({ publicKey, privateKey });
					return resolve(base64.fromArrayBuffer(await crypto.subtle.exportKey('raw', publicKey), false));
				}
				get_auth_public_key().then(resolve);
			} catch (err) {
				console.warn(err);
				indexedDB.deleteDatabase('SOMETHING');
				store_auth_key_pair().then(resolve);
			}
		};
	});
}

export function get_auth_public_key(): Promise<string> {
	return new Promise(resolve => {
		try {
			indexedDB.open('SOMETHING', 143).onsuccess = ({ target }) => {
				const database = (target as IDBOpenDBRequest).result;
				const store = database.transaction('SOMETHING', 'readonly').objectStore('SOMETHING');
				store.openCursor().onsuccess = async ({ target }) => {
					const { publicKey } = (target as IDBRequest<IDBCursorWithValue>).result.value as DatabaseItem;
					const exported = await crypto.subtle.exportKey('raw', publicKey);
					resolve(base64.fromArrayBuffer(exported, false));
				};
			};
		} catch (err) {
			console.warn(err);
			indexedDB.deleteDatabase('SOMETHING');
			store_auth_key_pair().then(get_auth_public_key).then(resolve);
		}
	});
}


function encode_request_body(body?: any) {
	if (!body)
		return '';
	if (body instanceof URLSearchParams)
		return base64.fromString(body.toString());
	if (body instanceof ArrayBuffer)
		return base64.fromArrayBuffer(body, false);
	return base64.fromString(JSON.stringify(body));
}

export function sign_api_request(path: string, method: string, body?: any): Promise<Record<string, string>> {
	return new Promise(resolve => {
		indexedDB.open('SOMETHING', 143).onsuccess = ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			const store = database.transaction('SOMETHING', 'readonly').objectStore('SOMETHING');
			store.openCursor().onsuccess = async ({ target }) => {
				const { privateKey } = (target as IDBRequest<IDBCursorWithValue>).result.value as DatabaseItem;

				const signature = await crypto.subtle.sign({
					name: 'ECDSA',
					hash: { name: 'SHA-384' }
				}, privateKey, new TextEncoder().encode(`${method} /v0/${path};${encode_request_body(body)}`));
				resolve({
					'haku-sig': base64.fromArrayBuffer(signature)
				});
			};
		};
	});
}

interface DatabaseItem {
	publicKey: CryptoKey
	privateKey: CryptoKey
}