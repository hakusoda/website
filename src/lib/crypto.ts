import base64 from '@hexagon/base64';
function getStoreCount(store: IDBObjectStore): Promise<number> {
	return new Promise(resolve => {
		store.count().onsuccess = ({ target }) => resolve((target as IDBRequest<number>).result);
	});
}

export function storeKeyPairForAuthentication(): Promise<void> {
	return new Promise(resolve => {
		const request = indexedDB.open('SOMETHING', 143);
		request.onupgradeneeded = ({ target }) =>
			(target as IDBOpenDBRequest).result.createObjectStore('SOMETHING', { autoIncrement: true });
		request.onsuccess = async ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			try {
				const store = database.transaction(['SOMETHING'], 'readonly').objectStore('SOMETHING');
				if (!await getStoreCount(store)) {
					const { publicKey, privateKey } = await crypto.subtle.generateKey({
						name: 'ECDSA',
						namedCurve: 'P-384'
					}, false, ['sign', 'verify']);

					const store = database.transaction(['SOMETHING'], 'readwrite').objectStore('SOMETHING');
					store.put({ publicKey, privateKey });
				}
				resolve();
			} catch (err) {
				console.warn(err);
				indexedDB.deleteDatabase('SOMETHING');
				storeKeyPairForAuthentication().then(resolve);
			}
		};
	});
}

export function getPublicKey(): Promise<string> {
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
			storeKeyPairForAuthentication().then(getPublicKey).then(resolve);
		}
	});
}


function encodeBody(body?: any) {
	if (!body)
		return '';
	if (body instanceof URLSearchParams)
		return base64.fromString(body.toString());
	if (body instanceof ArrayBuffer)
		return base64.fromArrayBuffer(body, false);
	return base64.fromString(JSON.stringify(body));
}

export function signApiRequest(path: string, method: string, body?: any): Promise<Record<string, string>> {
	return new Promise(resolve => {
		indexedDB.open('SOMETHING', 143).onsuccess = ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			const store = database.transaction('SOMETHING', 'readonly').objectStore('SOMETHING');
			store.openCursor().onsuccess = async ({ target }) => {
				const { privateKey } = (target as IDBRequest<IDBCursorWithValue>).result.value as DatabaseItem;

				const signature = await crypto.subtle.sign({
					name: 'ECDSA',
					hash: { name: 'SHA-384' }
				}, privateKey, new TextEncoder().encode(`${method} /v0/${path};${encodeBody(body)}`));
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