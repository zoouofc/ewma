#!/usr/bin/env bash

# Update db/schema.sql
# Author Mitchell Sawatzky

echo -e 'Updating schema.sql as MYSQL user root'
mysqldump -h localhost -u root -p --no-data "ewma" | egrep -v "(^SET|^/\*\!)" | sed 's/ AUTO_INCREMENT=[0-9]*\b//' > ./db/schema.sql
