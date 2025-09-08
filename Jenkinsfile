pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    choice(name: 'TEST_ENV',  choices: ['dev','qa','stage','prod'], description: 'Select environment')
    choice(name: 'TEST_ROLE', choices: ['user','admin'],            description: 'Select role')

    choice(
      name: 'TEST_FILTER',
      choices: [
        'All tests',
        '@smoke',
        '@api',
        '@search',
        '@smoke|@api',                       // OR
        '@search|@compare',
        '(?=.*@ui)(?=.*@search)',            // AND
        '(?=.*@ui)(?=.*(@search|@compare))', // AND + OR
        'Custom'
      ],
      description: 'Preset Playwright --grep. Pick "Custom" to use CUSTOM_TAGS.'
    )

    string(
      name: 'CUSTOM_TAGS',
      defaultValue: '',
      description: 'Only used when TEST_FILTER=Custom. Examples: @smoke|@api  or  (?=.*@ui)(?=.*@search)'
    )
  }

  environment {
    ALLURE_RESULTS = 'allure-results'
    ALLURE_REPORT  = 'allure-report'
    CI = 'true'
  }

  stages {

    // Ensures the job shows the same parameters as this Jenkinsfile
    stage('🧰 Sync Jenkins Parameters') {
      steps {
        script {
          properties([
            parameters([
              choice(name: 'TEST_ENV',  choices: ['dev','qa','stage','prod'], description: 'Select environment'),
              choice(name: 'TEST_ROLE', choices: ['user','admin'],            description: 'Select role'),
              choice(
                name: 'TEST_FILTER',
                choices: [
                  'All tests',
                  '@smoke',
                  '@api',
                  '@search',
                  '@smoke|@api',
                  '@search|@compare',
                  '(?=.*@ui)(?=.*@search)',
                  '(?=.*@ui)(?=.*(@search|@compare))',
                  'Custom'
                ],
                description: 'Preset Playwright --grep. Pick "Custom" to use CUSTOM_TAGS.'
              ),
              string(name: 'CUSTOM_TAGS', defaultValue: '', description: 'Used when TEST_FILTER=Custom.')
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
        // Windows-safe fallback to tsc if "typecheck" script is missing or fails
        bat '''
          call npm run typecheck
          if errorlevel 1 (
            echo No "typecheck" script or it failed. Running "npx tsc -p . --noEmit" as fallback...
            npx tsc -p . --noEmit
          )
        '''
      }
    }

    stage('🔑 Generate Auth State') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
          usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
        ]) {
          echo "📌 Generating auth state for ${params.TEST_ENV} / role ${params.TEST_ROLE}..."
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
          script {
            def selected = params.TEST_FILTER?.trim()
            def custom   = params.CUSTOM_TAGS?.trim()
            def grepExpr = ''

            if (selected == 'Custom') {
              grepExpr = custom
            } else if (selected != 'All tests') {
              grepExpr = selected
            }

            def grepArg = grepExpr ? "--grep \"${grepExpr}\"" : ""  // empty = run all tests

            echo "📌 ENV=${params.TEST_ENV}, ROLE=${params.TEST_ROLE}, GREP=${grepExpr ?: 'ALL'}, invert=@quarantine"
            bat """
              set TEST_ENV=${params.TEST_ENV}
              set TEST_ROLE=${params.TEST_ROLE}
              npx playwright test ${grepArg} --grep-invert "@quarantine" --reporter=line
            """
          }
        }
      }
      post {
        always {
          echo "📌 Archiving test artifacts..."
          archiveArtifacts artifacts: 'playwright-report/**/*.*', allowEmptyArchive: true
          archiveArtifacts artifacts: 'test-results/**/*.*',      allowEmptyArchive: true
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
