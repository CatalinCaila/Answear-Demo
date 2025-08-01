pipeline {
    agent any

    environment {
        NODE_ENV       = "${params.ENVIRONMENT}"
        ALLURE_RESULTS = "allure-results"
        ALLURE_REPORT  = "allure-report"

        // Worker-scoped credentials
        ADMIN_EMAIL_0     = credentials('ADMIN_EMAIL_0')
        ADMIN_PASSWORD_0  = credentials('ADMIN_PASSWORD_0')
        USER_EMAIL_0      = credentials('USER_EMAIL_0')
        USER_PASSWORD_0   = credentials('USER_PASSWORD_0')

        ADMIN_EMAIL_1     = credentials('ADMIN_EMAIL_1')
        ADMIN_PASSWORD_1  = credentials('ADMIN_PASSWORD_1')
        USER_EMAIL_1      = credentials('USER_EMAIL_1')
        USER_PASSWORD_1   = credentials('USER_PASSWORD_1')
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
                echo "📌 Running Playwright tests in %NODE_ENV% environment..."
                bat "npm run test:%NODE_ENV%"
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
