def testSuccess = false

pipeline {
  agent none

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('test') {
      environment {
	      NPM_TOKEN = "na"
      }
      agent any
      steps {
        sh 'yarn'
        sh 'yarn bootstrap'
        sh 'yarn clean'
        sh 'yarn build-all'
        script {
          testSuccess = 0 == sh(returnStatus: true, script: 'yarn test')
        }
      }
      post {
        always {
          script {
            def color = testSuccess ? "good" : "danger"
            slackSend(
              channel: "#protocol-duty",
              color: color,
              message: "\n *[ethereum-sdk] [${env.GIT_BRANCH}] Test Summary*: " + (testSuccess ? "SUCCESS" : "FAILED")
            )
          }
        }
      }
    }
    stage('build and deploy') {
      agent any
      when { tag "v*" }
      steps {
        withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
          sh 'yarn'
          sh 'yarn bootstrap'
          sh 'yarn clean'
          sh 'yarn build-all'
          sh 'yarn publish-all'
        }
      }
    }
  }
  post {
    always {
      node("") {
        cleanWs()
      }
    }
  }
}
