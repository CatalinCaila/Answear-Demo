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
        cleanWs(deleteDirs: true)
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

    stage('Prepare .env Securely') {
      steps {
        withCredentials([
          string(credentialsId: 'ADMIN_EMAIL', variable: 'ADMIN_EMAIL'),
          string(credentialsId: 'ADMIN_PASSWORD', variable: 'ADMIN_PASSWORD'),
          string(credentialsId: 'USER_EMAIL', variable: 'USER_EMAIL'),
          string(credentialsId: 'USER_PASSWORD', variable: 'USER_PASSWORD')
        ]) {
          bat '''
            echo ADMIN_EMAIL=%ADMIN_EMAIL% > .env
            echo ADMIN_PASSWORD=%ADMIN_PASSWORD% >> .env
            echo USER_EMAIL=%USER_EMAIL% >> .env
            echo USER_PASSWORD=%USER_PASSWORD% >> .env
          '''
        }
      }
    }

    stage('Run Playwright Tests') {
      steps {
        bat 'npx playwright test --reporter=line,allure-playwright'
      }
    }

    stage('Generate Allure Report') {
      steps {
        bat '"%ALLURE_HOME%\\bin\\allure.bat" generate %REPORT_DIR% --clean -o allure-report'
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

      bat 'del /f .env'
    }

    failure {
      mail to: 'catalin.caila@gmail.com',
        subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
        body: "Something went wrong with the Jenkins pipeline. Check logs here: ${env.BUILD_URL}"
    }
  }
}
