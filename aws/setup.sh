#!/bin/bash

curl http://169.254.169.254/latest/dynamic/instance-identity/document > aws_settings;
curl http://169.254.169.254/latest/meta-data/ami-id > aws.ami_id;
curl http://169.254.169.254/latest/meta-data/local-hostname > aws.local_hostname;
curl http://169.254.169.254/latest/meta-data/public-hostname > aws.public_hostname;
curl http://169.254.169.254/latest/user-data > provision_settings;
curl http://169.254.169.254/latest/meta-data/local-ipv4 > aws.local_ipv4;
curl http://169.254.169.254/latest/meta-data/public-ipv4 > aws.public_ipv4;

node setup.js;

mv index.html /html/index.html;



