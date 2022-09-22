const {Client} = require('contensis-delivery-api');

let config = { 
	rootUrl: 'https://cms-chesheast.cloud.contensis.com/',
	accessToken: 'QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I',
	projectId: 'website',
	language: 'en-GB',
	versionStatus: 'published',
	pageSize: 50
};

async function loadEntries() {
	let client = Client.create(config);
	let res = await client.entries.list({
		contentTypeId: 'testComment',
		pageOptions: { pageIndex: 0, pageSize: 10 },
		orderBy: ['myComment']
	});
	console.log(res.items);
}

loadEntries();
