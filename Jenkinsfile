pipeline {
    agent any

    environment {
        NODE_ENV       = "${params.ENVIRONMENT}"
        ALLURE_RESULTS = "allure-results"
        ALLURE_REPORT  = "allure-report"
    }

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'prod'], description: 'Select the testing environment')
    }

    stages {

        stage('🔍 Checkout') {
            steps {
                echo "📌 Checking out source code..."
                checkout scm
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo "📌 Installing project dependencies..."
                bat 'npm ci'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('🚨 Lint & Code Quality') {
            steps {
                echo "📌 Running ESLint for static code analysis..."
                bat 'npm run lint'
            }
        }

        stage('🔧 Run Playwright Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'USER_EMAIL_0', variable: 'USER_EMAIL_0'),
                    string(credentialsId: 'USER_PASSWORD_0', variable: 'USER_PASSWORD_0'),
                    string(credentialsId: 'ADMIN_EMAIL_0', variable: 'ADMIN_EMAIL_0'),
                    string(credentialsId: 'ADMIN_PASSWORD_0', variable: 'ADMIN_PASSWORD_0'),
                    string(credentialsId: 'USER_EMAIL_1', variable: 'USER_EMAIL_1'),
                    string(credentialsId: 'USER_PASSWORD_1', variable: 'USER_PASSWORD_1'),
                    string(credentialsId: 'ADMIN_EMAIL_1', variable: 'ADMIN_EMAIL_1'),
                    string(credentialsId: 'ADMIN_PASSWORD_1', variable: 'ADMIN_PASSWORD_1')
                ]) {
                    echo "📌 Running Playwright tests in %NODE_ENV% environment..."
                    bat "npm run test:%NODE_ENV%"
                }
            }
            post {
                always {
                    echo "📌 Archiving test artifacts and reports..."
                    archiveArtifacts artifacts: 'test-results/**/*.*, playwright-report/**/*.*', allowEmptyArchive: true
                }
            }
        }

        stage('📊 Generate Allure Report') {
            steps {
                echo "📌 Generating Allure test report..."
                bat 'npm run allure:generate'
            }
            post {
                always {
                    echo "📌 Archiving Allure results..."
                    archiveArtifacts artifacts: "${ALLURE_REPORT}/**/*.*", allowEmptyArchive: true
                    allure includeProperties: false, results: [[path: "${ALLURE_RESULTS}"]]
                }
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline completed. Check Allure reports for details."
        }
        failure {
            echo "❌ Pipeline failed. Check logs and reports for debugging."
        }
    }
}
