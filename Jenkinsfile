pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '0'
        COMPOSE_DOCKER_CLI_BUILD = '0'
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
                    sh 'mvn clean compile test'
                }
            }
        }

        stage('Build Artifacts') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('nexus-backend') {
                            sh 'mvn package -DskipTests'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('nexus-frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Approval (Main only)') {
            when { branch 'main' }
            steps {
                input message: "Deploy to Production?", ok: "Deploy"
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def envName = "develop"
                    def fePort = "5000"
                    def bePort = "5080"
                    def dbPort = "5306"

                    if (env.BRANCH_NAME == 'main') {
                        envName = "main"
                        fePort = "7000"
                        bePort = "7080"
                        dbPort = "7306"
                    } else if (env.BRANCH_NAME == 'uat') {
                        envName = "uat"
                        fePort = "6000"
                        bePort = "6080"
                        dbPort = "6306"
                    }

                    echo "Deploying to ${envName} environment..."
                    sh """
                        export SPRING_PROFILES_ACTIVE=${envName}
                        export ENV_NAME=${envName}
                        export FE_PORT=${fePort}
                        export BE_PORT=${bePort}
                        export DB_PORT=${dbPort}
                        docker-compose -p nexus-${envName} up --build -d
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Finished build for ${env.BRANCH_NAME}"
        }
        success {
            echo "Successfully deployed ${env.BRANCH_NAME}!"
        }
        failure {
            echo "Build/Deployment failed for ${env.BRANCH_NAME}. Check logs."
        }
    }
}
