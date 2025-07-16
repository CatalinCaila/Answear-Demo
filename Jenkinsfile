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

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx playwright install --with-deps'
        bat 'npm install -D allure-commandline'
      }
    }

    stage('Run Playwright Tests') {
      steps {
        bat 'npx playwright test --reporter=line,allure-playwright'
      }
    }

    stage('Generate Allure Report') {
      steps {
        bat 'npx allure-commandline generate %REPORT_DIR% --clean -o allure-report'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'allure-report/**', fingerprint: true

      allure([
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
