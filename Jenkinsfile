pipeline {
    agent any

    environment {
        NODE_ENV = "${params.ENVIRONMENT}"
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

        stage('🔑 Generate Auth State') {
    environment {
        ENV = "${params.ENVIRONMENT}"
    }
    steps {
        withCredentials([
            usernamePassword(credentialsId: 'USER_EMAIL_0', usernameVariable: 'USER_EMAIL_0', passwordVariable: 'USER_PASSWORD_0'),
            usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0'),
            usernamePassword(credentialsId: 'USER_EMAIL_1', usernameVariable: 'USER_EMAIL_1', passwordVariable: 'USER_PASSWORD_1'),
            usernamePassword(credentialsId: 'ADMIN_EMAIL_1', usernameVariable: 'ADMIN_EMAIL_1', passwordVariable: 'ADMIN_PASSWORD_1')
        ]) {
            echo "📌 Generating authentication state files for ${ENV}..."
            bat "set ENV=${ENV} && npm run auth:generate"
        }
    }
    post {
        success {
            echo "✅ Auth state generated successfully."
        }
        failure {
            error "❌ Failed to generate auth state files."
        }
    }
}

        stage('🔧 Run Playwright Tests') {
            steps {
                echo "📌 Running Playwright tests in ${NODE_ENV} environment..."
                bat "npm run test:${NODE_ENV}"
            }
            post {
                always {
                    echo "📌 Archiving test artifacts and reports..."
                    archiveArtifacts artifacts: 'test-results/**/*.*, playwright-report/**/*.*', allowEmptyArchive: true
                }
                failure {
                    echo "❌ Playwright tests failed."
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
                    echo "📌 Archiving Allure reports..."
                    archiveArtifacts artifacts: "${ALLURE_REPORT}/**/*.*", allowEmptyArchive: true
                    allure includeProperties: false, results: [[path: "${ALLURE_RESULTS}"]]
                }
                failure {
                    echo "❌ Allure report generation failed."
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline succeeded! Allure reports available."
        }
        failure {
            echo "❌ Pipeline failed! Check logs and reports."
        }
        always {
            echo "🎯 Pipeline execution completed."
        }
    }
}
