pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    choice(name: 'TEST_ENV',  choices: ['dev', 'qa', 'stage', 'prod'], description: 'Select environment')
    choice(name: 'TEST_ROLE', choices: ['user', 'admin'],            description: 'Select role')
    choice(name: 'TEST_TAGS', choices: ['@smoke', '@regression', '@api', '@search'], description: 'Playwright grep tag')
  }

  environment {
    ALLURE_RESULTS = 'allure-results'
    ALLURE_REPORT  = 'allure-report'
    CI = 'true'
  }

  stages {

    stage('🧰 Sync Jenkins Parameters') {
      steps {
        script {
          properties([
            parameters([
              choice(name: 'TEST_ENV',  choices: ['dev', 'qa', 'stage', 'prod'], description: 'Select environment'),
              choice(name: 'TEST_ROLE', choices: ['user', 'admin'],              description: 'Select role'),
              choice(name: 'TEST_TAGS', choices: ['@smoke', '@regression', '@api', '@search'], description: 'Playwright grep tag')
            ])
          ])
        }
      }
    }

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

    stage('🚨 Lint & Typecheck') {
      steps {
        echo "📌 Running ESLint & TypeScript checks..."
        bat 'npm run lint'
        // run typecheck if you have it; fallback to tsc
        bat 'npm run typecheck || npx tsc -p . --noEmit'
      }
    }

    stage('🔑 Generate Auth State') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
          usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
]) {
  echo "📌 Running for ${params.TEST_ENV} / role ${params.TEST_ROLE}..."
  bat """
    set TEST_ENV=${params.TEST_ENV}
    set TEST_ROLE=${params.TEST_ROLE}
    npm run auth:generate
  """
}
      }
      post {
        success { echo '✅ Auth state generated successfully.' }
        failure { error '❌ Failed to generate auth state files.' }
      }
    }

    stage('🔧 Run Playwright Tests') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
          usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
        ]) {
          echo "📌 Running Playwright in ${params.TEST_ENV} as ${params.TEST_ROLE} with tag ${params.TEST_TAGS}..."
          bat """
            set TEST_ENV=${params.TEST_ENV}
            set TEST_ROLE=${params.TEST_ROLE}
            npx playwright test --grep "${params.TEST_TAGS}" --grep-invert "@quarantine" --reporter=line
          """
        }
      }
      post {
        always {
          echo "📌 Archiving test artifacts..."
          archiveArtifacts artifacts: 'playwright-report/**/*.*', allowEmptyArchive: true
          archiveArtifacts artifacts: 'test-results/**/*.*', allowEmptyArchive: true
        }
        failure { echo '❌ Playwright tests failed.' }
      }
    }

    stage('📊 Generate Allure Report') {
      steps {
        echo "📌 Generating Allure report..."
        bat 'npm run allure:generate'
      }
      post {
        always {
          echo "📌 Publishing Allure..."
          archiveArtifacts artifacts: "${ALLURE_REPORT}/**/*.*", allowEmptyArchive: true
          allure includeProperties: false, results: [[path: "${ALLURE_RESULTS}"]]
        }
      }
    }
  }

  post {
    success { echo '✅ Pipeline succeeded! Allure reports available.' }
    failure { echo '❌ Pipeline failed! Check logs and reports.' }
    always  { echo '🎯 Pipeline execution completed.' }
  }
}
