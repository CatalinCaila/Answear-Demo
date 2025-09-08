pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')              // hard cap for the whole pipeline
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    // CSV list of environments; default = run all
    string(name: 'ENVS', defaultValue: 'dev,qa,stage,prod', description: 'Comma-separated envs to include (e.g., "dev,qa").')

    // Tag filtering (Playwright --grep)
    choice(
      name: 'TEST_FILTER',
      choices: [
        'All tests',
        '@smoke',
        '@api',
        '@search',
        '@regression',
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
      description: 'Used when TEST_FILTER=Custom. Examples: @smoke|@api  or  (?=.*@ui)(?=.*@search)'
    )

    // Optional auth setup (disabled by default)
    booleanParam(name: 'GENERATE_AUTH', defaultValue: false, description: 'Run auth setup before tests (enable only if required).')
  }

  environment {
    ALLURE_RESULTS = 'allure-results'
    ALLURE_REPORT  = 'allure-report'
    CI = 'true'
  }

  stages {

    // keep job parameters in sync with this file
    stage('🧰 Sync Jenkins Parameters') {
      steps {
        script {
          properties([parameters([
            string(name: 'ENVS', defaultValue: 'dev,qa,stage,prod', description: 'CSV envs to include'),
            choice(name: 'TEST_FILTER',
              choices: [
                'All tests','@smoke','@api','@search','@regression',
                '@smoke|@api','@search|@compare',
                '(?=.*@ui)(?=.*@search)',
                '(?=.*@ui)(?=.*(@search|@compare))',
                'Custom'
              ],
              description: 'Preset grep'
            ),
            string(name: 'CUSTOM_TAGS', defaultValue: '', description: 'Used when TEST_FILTER=Custom'),
            booleanParam(name: 'GENERATE_AUTH', defaultValue: false, description: 'Run auth setup before tests')
          ])])
        }
      }
    }

    // clean previous reports so runs don’t mix
    stage('🧹 Clean Previous Results') {
      steps {
        echo "📌 Cleaning old reports and results..."
        bat '''
          if exist playwright-report rmdir /s /q playwright-report
          if exist test-results rmdir /s /q test-results
          if exist allure-results rmdir /s /q allure-results
          if exist allure-report rmdir /s /q allure-report
        '''
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
        // Windows-safe fallback to tsc if "typecheck" is missing or fails
        bat '''
          call npm run typecheck
          if errorlevel 1 (
            echo Fallback: npx tsc -p . --noEmit
            npx tsc -p . --noEmit
          )
        '''
      }
    }

    // run the suite per-environment (no role axis)
    stage('🧪 Run Matrix') {
      matrix {
        axes {
          axis { name 'TEST_ENV'; values 'dev', 'qa', 'stage', 'prod' }
        }

        // Only run envs included in ENVS CSV
        when {
          expression {
            def envs = (params.ENVS ?: '').toLowerCase().split(/\s*,\s*/).findAll{ it }
            return envs.contains(TEST_ENV.toLowerCase())
          }
        }

        stages {
          stage('🔑 Generate Auth State (optional)') {
            when { expression { return params.GENERATE_AUTH } }
            steps {
              withCredentials([
                usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
                usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
              ]) {
                timeout(time: 10, unit: 'MINUTES') {
                  echo "📌 Generating auth for ENV=${TEST_ENV}"
                  // Adjust to your repo’s setup (role-agnostic if possible).
                  bat """
                    set TEST_ENV=${TEST_ENV}
                    npm run auth:generate
                  """
                }
              }
            }
            post {
              failure { echo '❌ Auth generation failed (disable GENERATE_AUTH to bypass).' }
            }
          }

          stage('🔧 Run Playwright Tests') {
            steps {
              script {
                def selected = params.TEST_FILTER?.trim()
                def custom   = params.CUSTOM_TAGS?.trim()
                def grepExpr = (selected == 'Custom') ? custom : (selected != 'All tests' ? selected : '')
                def grepArg  = grepExpr ? "--grep \"${grepExpr}\"" : ""

                echo "📌 ENV=${TEST_ENV}, GREP=${grepExpr ?: 'ALL'}, invert=@quarantine"
                timeout(time: 30, unit: 'MINUTES') {
                  retry(1) {
                    bat """
                      set TEST_ENV=${TEST_ENV}
                      npx playwright test ${grepArg} --grep-invert "@quarantine" --reporter=line
                    """
                  }
                }
              }
            }
            post {
              always {
                echo "📌 Archiving artifacts for ${TEST_ENV}"
                archiveArtifacts artifacts: 'playwright-report/**/*.*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'test-results/**/*.*',      allowEmptyArchive: true
              }
            }
          }
        }
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
