pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    REPORT_DIR = 'allure-results'
  }

  tools {
    nodejs 'NodeJS 22.15.0'
    allure 'Allure 2.34.1' // matches Jenkins configured tool name
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

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx playwright install --with-deps'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        bat 'npx playwright test --reporter=line,allure-playwright'
      }
    }

    stage('Generate Allure Report') {
      steps {
        bat 'allure generate %REPORT_DIR% --clean -o allure-report'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'allure-report/**', fingerprint: true

      allure([
        commandline: 'Allure 2.34.1',
        results: [[path: 'allure-results']],
        reportBuildPolicy: 'ALWAYS'
      ])
    }

    failure {
      mail to: 'your-email@example.com',
        subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
        body: "Something went wrong with the Jenkins pipeline. Check logs here: ${env.BUILD_URL}"
    }
  }
}
