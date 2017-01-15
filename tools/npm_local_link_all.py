#!/usr/bin/env python

import sys
import os

ardefact_root_folder = sys.argv[1]
sub_folders = os.listdir(ardefact_root_folder)

exclude = ['.DS_Store', '.idea']

for sub_folder in sub_folders:
	if sub_folder in exclude:
		continue
	sub_folder_path = os.path.join(ardefact_root_folder, sub_folder)
	for sub_folder_link in sub_folders:
		if sub_folder_link in exclude:
			continue
		if sub_folder == sub_folder_link:
			continue

		sub_folder_link_path = os.path.join(ardefact_root_folder, sub_folder_link)
		print sub_folder_path, sub_folder_link_path
		os.system('cd %s; npm link ../%s' % (sub_folder_path, sub_folder_link))
