pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }
        stage('Build Frontend') {
            steps {
                bat 'npm run build'
            }
        }
        stage('Docker Build') {
            steps {
                bat 'docker build -t eventsphere-frontend .'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
