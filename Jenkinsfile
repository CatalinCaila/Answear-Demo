pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    // CSV list of envs; leave default to run ALL
    string(name: 'ENVS', defaultValue: 'dev,qa,stage,prod', description: 'Comma-separated envs to include (e.g., "dev,qa").')

    choice(
      name: 'TEST_FILTER',
      choices: [
        'All tests',
        '@smoke',
        '@api',
        '@search',
        '@regression',
        '@smoke|@api',
        '@search|@compare',
        '(?=.*@ui)(?=.*@search)',
        '(?=.*@ui)(?=.*(@search|@compare))',
        'Custom'
      ],
      description: 'Preset Playwright --grep. Pick "Custom" to use CUSTOM_TAGS.'
    )

    string(
      name: 'CUSTOM_TAGS',
      defaultValue: '',
      description: 'Used when TEST_FILTER=Custom. Examples: @smoke|@api  or  (?=.*@ui)(?=.*@search)'
    )
  }

  environment {
    ALLURE_RESULTS = 'allure-results'
    ALLURE_REPORT  = 'allure-report'
    CI = 'true'
  }

  stages {
    // Keep job parameters in sync with this file
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
            string(name: 'CUSTOM_TAGS', defaultValue: '', description: 'Used when TEST_FILTER=Custom')
          ])])
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
        bat '''
          call npm run typecheck
          if errorlevel 1 (
            echo Fallback: npx tsc -p . --noEmit
            npx tsc -p . --noEmit
          )
        '''
      }
    }

    // 🚀 Matrix only over envs
    stage('🧪 Run Matrix') {
      matrix {
        axes {
          axis { name 'TEST_ENV'; values 'dev', 'qa', 'stage', 'prod' }
        }

        // Only run combinations included in ENVS CSV
        when {
          expression {
            def envs = (params.ENVS ?: '').toLowerCase().split(/\s*,\s*/).findAll{ it }
            return envs.contains(TEST_ENV.toLowerCase())
          }
        }

        stages {
          stage('🔑 Generate Auth State') {
            steps {
              withCredentials([
                usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
                usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
              ]) {
                echo "📌 Generating auth for ENV=${TEST_ENV}"
                bat """
                  set TEST_ENV=${TEST_ENV}
                  npm run auth:generate
                """
              }
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
                  def grepExpr = (selected == 'Custom') ? custom : (selected != 'All tests' ? selected : '')
                  def grepArg  = grepExpr ? "--grep \"${grepExpr}\"" : ""

                  echo "📌 ENV=${TEST_ENV}, GREP=${grepExpr ?: 'ALL'}, invert=@quarantine"
                  bat """
                    set TEST_ENV=${TEST_ENV}
                    npx playwright test ${grepArg} --grep-invert "@quarantine" --reporter=line
                  """
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
