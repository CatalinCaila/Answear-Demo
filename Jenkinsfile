pipeline {
  agent any

  environment {
    NODE_ENV = 'test'
    REPORT_DIR = 'allure-results'
    ADMIN_EMAIL = credentials('ADMIN_EMAIL')
    ADMIN_PASSWORD = credentials('ADMIN_PASSWORD')
    USER_EMAIL = credentials('USER_EMAIL')
    USER_PASSWORD = credentials('USER_PASSWORD')
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

    stage('Prepare .env') {
      steps {
        bat '''
          echo ADMIN_EMAIL=%ADMIN_EMAIL% > .env
          echo ADMIN_PASSWORD=%ADMIN_PASSWORD% >> .env
          echo USER_EMAIL=%USER_EMAIL% >> .env
          echo USER_PASSWORD=%USER_PASSWORD% >> .env
        '''
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

      bat 'del .env'
    }

    failure {
      mail to: 'catalin.caila@gmail.com',
        subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
        body: "Something went wrong with the Jenkins pipeline. Check logs here: ${env.BUILD_URL}"
    }
  }
}