# -*- mode: ruby -*-
# vi: set ft=ruby :

vagrant_user = "vagrant"

# code directories
this_path = File.absolute_path(__FILE__)
ardefact_dir = File.expand_path("..", this_path)
code_share_host_path = File.expand_path("..", ardefact_dir)
code_share_guest_path ="/media/ardefact_code"

# overlayfs directories
overlay_mount = "/home/#{vagrant_user}/src"
overlay_lower = code_share_guest_path
overlay_upper = "/home/#{vagrant_user}/.overlay"

# "default" vm config
guest_ip = "192.168.56.111"
guest_mem = "4096"
guest_swap = "4096"
hostname = "ardefact.local"


Vagrant.configure(2) do |config|
  config.vm.box = "trusty-cloud-image"
  config.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.box_download_checksum = "5c2854b524d2945b42ff1017e14bdc989ca1b042038fb97a298ecc0d8c118097"
  config.vm.box_download_checksum_type = "sha256"

   config.ssh.forward_agent = true

  # mount the host shared folder
  config.vm.synced_folder code_share_host_path, code_share_guest_path, mount_options: ["ro"]

  config.vm.provider "virtualbox" do |vb|
    vb.memory = guest_mem
  end

  # ubuntu cloud image has no swapfile by default, set one up
  config.vm.provision "shell", inline: <<-SCRIPT
    if ! grep -q swapfile /etc/fstab; then
      echo 'swapfile not found. Adding swapfile.'
      fallocate -l #{guest_swap}M /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap defaults 0 0' >> /etc/fstab
    else
      echo 'swapfile found. No changes made.'
    fi
  SCRIPT

  # set up the overlay filesystem
  config.vm.provision "shell", inline: <<-SCRIPT
    if [ ! -d #{overlay_mount} ]; then
      echo "creating overlay mount directory #{overlay_mount}"
      sudo -u #{vagrant_user} mkdir #{overlay_mount}
    fi

    if [ ! -d #{overlay_upper} ]; then
      echo "creating overlay upper directory #{overlay_upper}"
      sudo -u #{vagrant_user} mkdir #{overlay_upper}
    fi

    echo "mounting overlayfs (lower: #{overlay_lower}, upper: #{overlay_upper}, mount: #{overlay_mount})"
    mount -t overlayfs overlayfs -o lowerdir=#{overlay_lower},upperdir=#{overlay_upper} #{overlay_mount}

    # setup mongoDb
    sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
    echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

    sudo apt-get update

    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y build-essential nodejs git vim pgadmin3 default-jre zsh mongodb-org ack-grep
    npm install -g bower
    npm install -g jshint
    npm install -g bunyan

    # setup zsh
   cd "/home/#{vagrant_user}"; sudo -u #{vagrant_user} wget https://raw.githubusercontent.com/lan17/home/master/.zshrc
    chsh -s /usr/bin/zsh #{vagrant_user}

    # put mount command as convenience into home
    cd "/home/#{vagrant_user}"; echo "mount -t overlayfs overlayfs -o lowerdir=#{overlay_lower},upperdir=#{overlay_upper} #{overlay_mount}" > mount_overlayfs.sh; chmod +x mount_overlayfs.sh

    ssh-keyscan -H github.com >> /home/${vagrant_user}/.ssh/known_hosts
    chown ${vagrant_user} /home/${vagrant_user}/.ssh

	# to make npm link easier
    chown #{vagrant_user} /usr/lib/node_modules
  SCRIPT

  config.vm.define "default", primary: true do |ardefactlocal|
      ardefactlocal.vm.hostname = hostname
      # host-only network interface
      ardefactlocal.vm.network "private_network", ip: guest_ip

      config.vm.network "forwarded_port", guest: 27017, host: 27017

  end


end
