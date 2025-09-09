pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')              // hard cap for the whole pipeline
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    // --- ENVIRONMENTS ---
    booleanParam(name: 'RUN_DEV',   defaultValue: true,  description: 'Run tests on DEV')
    booleanParam(name: 'RUN_QA',    defaultValue: true,  description: 'Run tests on QA')
    booleanParam(name: 'RUN_STAGE', defaultValue: true,  description: 'Run tests on STAGE')
    booleanParam(name: 'RUN_PROD',  defaultValue: false, description: 'Run tests on PROD')

    // --- TAGS ---
    booleanParam(name: 'TAG_SMOKE',      defaultValue: false, description: 'Run @smoke tests')
    booleanParam(name: 'TAG_API',        defaultValue: false, description: 'Run @api tests')
    booleanParam(name: 'TAG_SEARCH',     defaultValue: false, description: 'Run @search tests')
    booleanParam(name: 'TAG_REGRESSION', defaultValue: false, description: 'Run @regression tests')
    booleanParam(name: 'TAG_COMPARE',    defaultValue: false, description: 'Run @compare tests')
    booleanParam(name: 'TAG_UI',         defaultValue: false, description: 'Run @ui tests')

    // Optional auth setup
    booleanParam(name: 'GENERATE_AUTH', defaultValue: false, description: 'Run auth setup before tests (enable only if required).')
  }

  environment {
    ALLURE_RESULTS = 'allure-results'
    ALLURE_REPORT  = 'allure-report'
    CI = 'true'
  }

  stages {

    // 🧹 Clean previous reports
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
        bat '''
          call npm run typecheck
          if errorlevel 1 (
            echo Fallback: npx tsc -p . --noEmit
            npx tsc -p . --noEmit
          )
        '''
      }
    }

    // 🧪 Run matrix of environments
    stage('🧪 Run Matrix') {
      matrix {
        axes {
          axis { name 'TEST_ENV'; values 'dev', 'qa', 'stage', 'prod' }
        }

        // rulează doar mediile bifate
        when {
          expression {
            def flags = [
              dev  : params.RUN_DEV,
              qa   : params.RUN_QA,
              stage: params.RUN_STAGE,
              prod : params.RUN_PROD
            ]
            return (flags[TEST_ENV.toLowerCase()] ?: false)
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
                  bat """
                    set TEST_ENV=${TEST_ENV}
                    set DOTENV_FLOW_ENV=${TEST_ENV}

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
              withCredentials([
                usernamePassword(credentialsId: 'USER_EMAIL_0',  usernameVariable: 'USER_EMAIL_0',  passwordVariable: 'USER_PASSWORD_0'),
                usernamePassword(credentialsId: 'ADMIN_EMAIL_0', usernameVariable: 'ADMIN_EMAIL_0', passwordVariable: 'ADMIN_PASSWORD_0')
              ]) {
                script {
                  // --- Construim GREP în funcție de tag-urile bifate ---
                  def tags = []
                  if (params.TAG_SMOKE)      tags << '@smoke'
                  if (params.TAG_API)        tags << '@api'
                  if (params.TAG_SEARCH)     tags << '@search'
                  if (params.TAG_REGRESSION) tags << '@regression'
                  if (params.TAG_COMPARE)    tags << '@compare'
                  if (params.TAG_UI)         tags << '@ui'

                  def grepExpr = tags ? tags.join('|') : ''
                  def grepArg  = grepExpr ? "--grep \"${grepExpr}\"" : ""

                  echo "📌 ENV=${TEST_ENV}, TAGS=${grepExpr ?: 'ALL'}, invert=@quarantine"
                  timeout(time: 30, unit: 'MINUTES') {
                    retry(1) {
                      bat """
                        set TEST_ENV=${TEST_ENV}
                        set DOTENV_FLOW_ENV=${TEST_ENV}

                        npx playwright test ${grepArg} --grep-invert "@quarantine" --reporter=line
                      """
                    }
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
