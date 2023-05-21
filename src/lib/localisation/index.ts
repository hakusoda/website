import { create } from '@voxeliface/svelte-localisation';

import data from './data';
import { LOCALES } from '../constants';
const numFormatter = new Intl.NumberFormat();
const [t, trans, locale] = create(LOCALES[0], data, LOCALES, {
	number: value => numFormatter.format(parseInt(value)),
	time_ago: (value, trans) => {
		const diff = Date.now() - new Date(value).getTime();
		const year = Math.floor(diff / 31536000000);
		if (year > 0)
			return trans(ta(5, year), [year]);

		const month = Math.floor(diff / 2628000000);
		if (month > 0)
			return trans(ta(4, month), [month]);

		const day = Math.floor(diff / 86400000);
		if (day > 0)
			return trans(ta(3, day), [day]);

		const hour = Math.floor(diff / 3600000);
		if (hour > 0)
			return trans(ta(2, hour), [hour]);

		const minute = Math.floor(diff / 60000);
		if (minute > 0)
			return trans(ta(1, minute), [minute]);

		const second = Math.floor(diff / 1000);
		return trans(ta(0, second), [second]);
	}
});

const ta = (id: number, val: number): any => `time_ago.${id}_${val === 1 ? 1 : 0}`;
export { t, trans, locale };