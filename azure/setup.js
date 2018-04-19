
const os = require('os');
const fs = require('fs');

let TRANSLATION = {}


let fileList = [];

const fileData = {};

const getOSData = () => {
	let data = {
		cores:os.cpus().length,
		freemem:os.freemem(),
		totalmem:os.totalmem(),
		hostname:os.hostname(),
		arch:os.arch(),
		platform:os.platform(),
		release:os.release(),
		net_inf:os.networkInterfaces(),

	};
	return data;

};

const makeNetTable = (data) => {
	var rows = [];
	for(var inf in data){
		let subcols = [];
		data[inf].forEach((subdata) => {
			let col = "<table>";
				col += `<tr><th>${subdata.family}</th></tr>`;
				col += `<tr><td>ip address:${subdata.address}</td></tr>`;
				col += `<tr><td>network mask:${subdata.netmask}</td></tr>`;
				col += `<tr><td>mac address:${subdata.mac}</td></tr>`;
				col += `<tr><td>cidr:${subdata.cidr}</td></tr>`;
				col += "</table>";
				subcols.push(col);
		});
		let row = `<tr><td><b>${inf}</b></td><td>${subcols.join("</td><td>")}</td>`;
		rows.push(row);
	}
	return `<table>${rows.join("")}</table>`;
}


const makeTable = (data) => {
	let rows = [];
	for(var key in data){
		var value = data[key];
		if(!!value && !!TRANSLATION[key]){
			if(key == "net_inf"){
				value = makeNetTable(value);
			}
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

	TRANSLATION = JSON.parse(fileData.translation);
	let azure_settings = JSON.parse(fileData.azure_settings);
	let azure_network = azure_settings.network;
	azure_settings = azure_settings.compute;
	delete fileData.azure_settings;
	
	
	
	if(azure_network && azure_network.interface && azure_network.interface.length){
		let ipv4 = azure_network.interface[0].ipv4;
		console.log(JSON.stringify(ipv4,null,4));
		if(ipv4.ipAddress.length){
			azure_settings.local_ipv4 = ipv4.ipAddress[0].privateIpAddress;
			azure_settings.public_ipv4 = ipv4.ipAddress[0].publicIpAddress;			
		}
		if(ipv4.subnet.length){
			azure_settings.subnet = ipv4.subnet[0].address + "/" + (ipv4.subnet[0].prefix || 0);
		}
	}
	console.log(JSON.stringify(azure_settings,null,4));
	
	let provision_settings = JSON.parse(fileData.provision_settings || "{}");

	for(var fileName in fileData){
		if(fileName.indexOf("azure.") == 0){
			azure_settings[fileName.substring(4)] = fileData[fileName];
		}
	}


	let html = fileData["template.html"];
	html = html.replace("<!--CLOUD SETTINGS-->",makeTable(azure_settings));
	html = html.replace("<!--APP SETTINGS-->",makeTable(azure_settings));
	html = html.replace("<!--OS SETTINGS-->",makeTable(getOSData()));
	html = html.replace("<!--TIME-->",new Date().toISOString());
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