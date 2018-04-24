#!/bin/bash

cd /ug/ugprov/azure;

git pull;


cat  /var/lib/waagent/ovf-env.xml > /ug/ugprov/azure/ovf.xml;

curl -H Metadata:true "http://169.254.169.254/metadata/instance?api-version=2017-08-01" > azure_settings;

node setup.js;

mv -f index.html /html/index.html;



