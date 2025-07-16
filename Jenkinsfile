pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    REPORT_DIR = 'allure-results'
  }

  tools {
    nodejs 'NodeJS 22.15.0'
  }

  stages {
    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        bat 'npm ci'
        bat 'npx playwright install --with-deps'
      }
    }

    stage('Test') {
      steps {
        bat 'npx playwright test --reporter=list,allure-playwright'
      }
    }

    stage('Generate Allure Report') {
      steps {
        bat 'npx allure generate allure-results --clean -o allure-report'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'allure-report/**', fingerprint: true
    }
  }
}
