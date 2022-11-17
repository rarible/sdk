@Library('shared-library') _

def pipelineConfig = [:]

withCredentials([string(credentialsId: 'sdk-solana-devnet-node-endpoint', variable: 'SOLANA_CUSTOM_ENDPOINT')]) {
  pipelineAppCI(pipelineConfig)
}
