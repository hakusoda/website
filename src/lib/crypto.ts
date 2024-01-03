import base64 from '@hexagon/base64';
function getStoreCount(store: IDBObjectStore): Promise<number> {
	return new Promise(resolve => {
		store.count().onsuccess = ({ target }) => resolve((target as IDBRequest<number>).result);
	});
}

export function storeKeyPairForAuthentication() {
	const request = indexedDB.open('SOMETHING');
	request.onupgradeneeded = ({ target }) =>
		(target as IDBOpenDBRequest).result.createObjectStore('SOMETHING', { autoIncrement: true });
	request.onsuccess = async ({ target }) => {
		const database = (target as IDBOpenDBRequest).result;
		try {
			const store = database.transaction(['SOMETHING'], 'readonly').objectStore('SOMETHING');
			if (!await getStoreCount(store)) {
				const { publicKey, privateKey } = await crypto.subtle.generateKey({
					name: 'ECDSA',
					namedCurve: 'P-384',
				}, false, ['sign', 'verify']);

				const store = database.transaction(['SOMETHING'], 'readwrite').objectStore('SOMETHING');
				store.put({ publicKey, privateKey });
			}
		} catch (err) {
			console.warn(err);
			indexedDB.deleteDatabase('SOMETHING');
			storeKeyPairForAuthentication();
		}
	};
}

export function getPublicKey(): Promise<string> {
	return new Promise(resolve => {
		indexedDB.open('SOMETHING', 143).onsuccess = ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			const store = database.transaction('SOMETHING', 'readonly').objectStore('SOMETHING');
			store.openCursor().onsuccess = async ({ target }) => {
				const { publicKey } = (target as IDBRequest<IDBCursorWithValue>).result.value as DatabaseItem;
				const exported = await crypto.subtle.exportKey('raw', publicKey);
				resolve(base64.fromArrayBuffer(exported, false));
			};
		};
	});
}

export function generateAuthenticationHeader(): Promise<string> {
	return new Promise(resolve => {
		indexedDB.open('SOMETHING', 143).onsuccess = ({ target }) => {
			const database = (target as IDBOpenDBRequest).result;
			const store = database.transaction('SOMETHING', 'readonly').objectStore('SOMETHING');
			store.openCursor().onsuccess = async ({ target }) => {
				const { privateKey } = (target as IDBRequest<IDBCursorWithValue>).result.value as DatabaseItem;
				const body = new Uint8Array(64);
				crypto.getRandomValues(body);
				
				const signature = await crypto.subtle.sign({
					name: 'ECDSA',
					hash: { name: 'SHA-384' }
				}, privateKey, body);
				resolve(`${base64.fromArrayBuffer(signature, false)}:${base64.fromArrayBuffer(body, false)}`);
			};
		};
	});
}

interface DatabaseItem {
	publicKey: CryptoKey
	privateKey: CryptoKey
}