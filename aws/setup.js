

const fs = require('fs');

let TRANSLATION = {


}

const fileList = ["translation","template.html","provision_settings","aws_settings","ami-id","local-hostname"];

const fileData = {};

const makeTable = (data) => {
	let rows = [];
	for(var key in data){
		var value = data[key];
		if(!!value && !!TRANSLATION[key]){
			let row = `<tr><th>${TRANSLATION[key]}</th><td>${value}</td></tr>`;
			rows.push(row);
		}
	}
	let rowsTogether = rows.join('');
	return `<table>${rowsTogether}</table>`
}

const readFiles = (callback) => {
	if(fileList.length){
		let fileName = fileList.pop();
		fs.readFile(fileName,(err,data) => {
			if(!!err){
				console.error(`Could not load file ${fileName}`)
				throw err;
			}
			fileData[fileName] = data.toString();
			readFiles(callback);
		})
	}else{
		callback();
	}
}


readFiles(() => {
	TRANSLATION = JSON.parse(fileData.translation);
	let aws_settings = JSON.parse(fileData.aws_settings);
	let provision_settings = JSON.parse(fileData.provision_settings);
	aws_settings.ami_id = fileData["ami-id"];
	aws_settings.local_hostname = fileData["local-hostname"];

	let html = fileData["template.html"];
	html = html.replace("<!--CLOUD SETTINGS-->",makeTable(aws_settings));
	html = html.replace("<!--APP SETTINGS-->",makeTable(aws_settings));
	html = html.replace("<!--OS SETTINGS-->",makeTable(aws_settings));
	fs.writeFile("index.html",html,(err) => {
		console.log("done");
	});
});