

const fs = require('fs');

let TRANSLATION = {}




let fileList = [];

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

const processFiles = () => {
	console.log(fileData);
	TRANSLATION = JSON.parse(fileData.translation);
	let aws_settings = JSON.parse(fileData.aws_settings);
	delete fileData.aws_settings;



	let provision_settings = JSON.parse(fileData.provision_settings);

	for(var fileName in fileData){
		if(fileName.indexOf("aws.") == 0){
			aws_settings[fileName.substring(4)] = fileData[fileName];
		}

	}
	console.log(JSON.stringify(aws_settings,null,4));

	let html = fileData["template.html"];
	html = html.replace("<!--CLOUD SETTINGS-->",makeTable(aws_settings));
	html = html.replace("<!--APP SETTINGS-->",makeTable(aws_settings));
	html = html.replace("<!--OS SETTINGS-->",makeTable(aws_settings));
	fs.writeFile("index.html",html,(err) => {
		console.log("done");
	});
}

fs.readdir('./',(err,data) => {
	for(var file of data){
		if(file[0] == "."){

		}else if(file.indexOf(["setup.js","index.html","setup.sh"]) > -1){

		}else{
			fileList.push(file);
		}
	}
	readFiles(processFiles);
});