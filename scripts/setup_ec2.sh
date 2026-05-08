#!/bin/bash

# BITS Equipment Portal - EC2 Setup Script
# Run this as root or with sudo

echo "Updating system..."
sudo yum update -y

echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Installing Java 17 (Corretto)..."
sudo yum install -y java-17-amazon-corretto-devel

echo "Installing Maven..."
sudo yum install -y maven

echo "Installing Node.js & NPM..."
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

echo "Installing Jenkins..."
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum upgrade
sudo yum install -y jenkins
sudo systemctl daemon-reload
sudo systemctl start jenkins
sudo systemctl enable jenkins

echo "--------------------------------------------------"
echo "Setup Complete!"
echo "Jenkins Initial Admin Password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "--------------------------------------------------"
echo "IMPORTANT: Open ports 80, 81, 82, 8081, 8082, 8083, and 8080 in your Security Group!"
