pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE = 'docker-compose'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Compile & Test') {
            steps {
                dir('nexus-backend') {
                    // Using shell for Linux EC2
                    sh 'mvn clean compile test'
                }
            }
        }
        
        stage('Build Artifacts') {
            steps {
                parallel(
                    "Backend": {
                        dir('nexus-backend') {
                            sh 'mvn package -DskipTests'
                        }
                    },
                    "Frontend": {
                        dir('nexus-frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                )
            }
        }
        
        stage('Approval (Main only)') {
            when { branch 'main' }
            steps {
                input message: 'Deploy to Production?', ok: 'Yes'
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    def profile = ""
                    def fePort = ""
                    def bePort = ""
                    def dbPort = ""
                    def envName = ""
                    
                    switch(env.BRANCH_NAME) {
                        case 'main':
                            profile = 'prod'
                            fePort = '80'
                            bePort = '8081'
                            dbPort = '3306'
                            envName = 'prod'
                            break
                        case 'uat':
                            profile = 'uat'
                            fePort = '81'
                            bePort = '8082'
                            dbPort = '3307'
                            envName = 'uat'
                            break
                        case 'develop':
                            profile = 'develop'
                            fePort = '82'
                            bePort = '8083'
                            dbPort = '3308'
                            envName = 'develop'
                            break
                    }
                    
                    if (profile) {
                        echo "Deploying to ${profile} environment..."
                        sh """
                            export SPRING_PROFILES_ACTIVE=${profile}
                            export ENV_NAME=${envName}
                            export FE_PORT=${fePort}
                            export BE_PORT=${bePort}
                            export DB_PORT=${dbPort}
                            ${DOCKER_COMPOSE} -p nexus-${envName} up --build -d
                        """
                    } else {
                        echo "Skipping deployment for branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "Successfully deployed ${env.BRANCH_NAME}!"
        }
        failure {
            echo "Build/Deployment failed for ${env.BRANCH_NAME}. Check logs."
        }
    }
}
