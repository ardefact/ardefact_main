#!/bin/bash

# look at all git top folders and run git pull in each one

for d in /home/www-data/reviewboard_repos/*/ ; do
	echo "Updating $d"
	pushd "$d"; git pull
	popd
done
