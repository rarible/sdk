@Library('shared-library') _

def pipelineConfig = [
    "buildCommand": "yarn && yarn build-example",
    "buildResultDirPath": "packages/example/build"
]

pipeline {
    agent any

    options {
      disableConcurrentBuilds()
      timeout(time: 1, unit: 'HOURS')
    }

    stages {
      stage('prepare') {
        steps {
          script {
            utils.enrinchMissedPipelineConfigs(pipelineConfig)
            env.DOCKER_REGISTRY = "rarible"
            env.DOCKER_REGISTRY_CREDS = "rarible-docker-hub"
            env.AGENT_IMAGE = utils.getAgentImage(pipelineConfig['buildWith'], pipelineConfig['baseImageTag'])
          }
        }
      }
      
      stage("build") {
        agent {
          docker {
            image "${env.AGENT_IMAGE}-dev"
            registryCredentialsId env.DOCKER_REGISTRY_CREDS
            args utils.dockerAgentArgs()
            reuseNode true
          }
        }
        when {
          anyOf { branch 'main'; branch 'master'; branch 'develop'; branch 'release/*'; branch 'cicd' }
        }
        steps { script {
          if (pipelineConfig.containsKey('buildCommand')) {
            sh(pipelineConfig['buildCommand'])
          } else {
            utils.runStage(pipelineConfig, 'build')
          }
        }}
      }

      stage('deploy') {
        agent {
          docker {
            image "${env.DOCKER_REGISTRY}/node:16"
            registryCredentialsId env.DOCKER_REGISTRY_CREDS
            args utils.dockerAgentArgs()
            reuseNode true
          }
        }
        when {
          anyOf { branch 'main'; branch 'master'; branch 'develop'; branch 'release/*'; branch 'cicd' }
        }
        steps {
          sh '''
              npm install gh-pages
              if [ "${pipelineconfig.get('ghPagesRepoUrl','')" = "" ]; then
                gh-pages -m "deploy ${env.GIT_COMMIT}" -d ${pipelineConfig['buildResultDirPath']}
              else
                gh-pages -m "deploy ${env.GIT_COMMIT}" -d ${pipelineConfig['buildResultDirPath']} -r ${pipelineconfig['ghPagesRepoUrl']}
              fi
          '''
        }
      }
    }

    post {
      always { cleanWs(deleteDirs: true, disableDeferredWipeout: true) }
    }
}