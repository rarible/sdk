import type {
  Commitment,
  Connection,
  PublicKey,
  SignatureStatus,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js"
import { Transaction } from "@solana/web3.js"
import type { SolanaSigner } from "@rarible/solana-common"
import { getUnixTs, sleep } from "@rarible/solana-common"
import type { TransactionOrVersionedTransaction } from "@rarible/solana-common/src"
import type { DebugLogger } from "../logger/debug-logger"
import type { TransactionResult } from "../types"

export interface ITransactionPreparedInstructions {
  instructions: TransactionInstruction[]
  signers: SolanaSigner[]
  orderId?: PublicKey
}

export async function sendTransactionWithRetry(
  connection: Connection,
  wallet: SolanaSigner,
  instructions: TransactionInstruction[],
  signers: SolanaSigner[],
  commitment: Commitment,
  logger?: DebugLogger,
): Promise<TransactionResult> {
  const transaction = new Transaction({ feePayer: wallet.publicKey })
  instructions.forEach(instruction => transaction.add(instruction))
  transaction.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash

  let signedTransaction: TransactionOrVersionedTransaction = transaction
  if (signers.length > 0) {
    signedTransaction = await wallet.signTransaction(signedTransaction)
    for (let signer of signers) {
      signedTransaction = await signer.signTransaction(signedTransaction)
    }
  } else {
    signedTransaction = await wallet.signTransaction(signedTransaction)
  }

  return await sendSignedTransaction(
    {
      connection,
      signedTransaction,
      initialTransaction: transaction,
    },
    logger,
  )
}

export async function sendSignedTransaction(
  {
    signedTransaction,
    initialTransaction,
    connection,
    timeout = 1000 * 60,
  }: {
    signedTransaction: TransactionOrVersionedTransaction
    initialTransaction: Transaction
    connection: Connection
    sendingMessage?: string
    sentMessage?: string
    successMessage?: string
    timeout?: number
  },
  logger?: DebugLogger,
): Promise<TransactionResult> {
  const rawTransaction = signedTransaction.serialize()
  const startTime = getUnixTs()
  let slot = 0

  const txId: TransactionSignature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
  })

  logger?.log("Started awaiting confirmation for", txId)

  let done = false
  ;(async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      })
      await sleep(500)
    }
  })()

  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txId,
      timeout,
      connection,
      "processed",
      true,
      logger,
    )

    if (!confirmation) {
      throw new Error("Timed out awaiting confirmation on transaction")
    }
    if (confirmation.err) {
      logger?.error(confirmation.err)
      throw new Error("Transaction failed: Custom instruction error")
    }

    slot = confirmation?.slot || 0
  } catch (err: any) {
    logger?.error("Confirmation awaiting error caught", err)

    throw prettifyBlockchainError(err)
  } finally {
    done = true
  }

  logger?.log("Latency (ms)", txId, getUnixTs() - startTime)
  return { txId, slot }
}

function prettifyBlockchainError(err: any) {
  try {
    const stringError = JSON.stringify(err)
    if (!stringError.includes("InstructionError")) return err

    if (stringError.includes("3012")) {
      return new Error("Transaction execution error: Order was already executed or cancelled")
    }

    if (stringError.includes("1")) {
      return new Error("Transaction execution error: Insufficient funds")
    }

    return err
  } catch (e) {
    return err
  }
}

async function awaitTransactionSignatureConfirmation(
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = "recent",
  queryStatus = false,
  logger?: DebugLogger,
): Promise<SignatureStatus | null | void> {
  let done = false
  let status: SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  }
  let subId = 0
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) return
      done = true
      logger?.log("Rejecting for timeout...")
      reject({ timeout: true })
    }, timeout)
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          }
          if (result.err) {
            logger?.log("Rejected via websocket", result.err)
            reject(status)
          } else {
            logger?.log("Resolved via websocket", result)
            resolve(status)
          }
        },
        commitment,
      )
    } catch (e) {
      done = true
      logger?.error("WS error in setup", txid, e)
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      ;(async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([txid])
          status = signatureStatuses && signatureStatuses.value[0]
          if (!done) {
            if (!status) {
              logger?.log("REST null result for", txid, status)
            } else if (status.err) {
              logger?.error("REST error for", txid, status)
              done = true
              reject(status.err)
            } else if (!status.confirmations) {
              logger?.log("REST no confirmations for", txid, status)
            } else {
              logger?.log("REST confirmation for", txid, status)
              done = true
              resolve(status)
            }
          }
        } catch (e) {
          if (!done) {
            logger?.error("REST connection error: txid", txid, e)
          }
        }
      })()
      await sleep(4000)
    }
  })

  done = true
  logger?.log("Returning status", status)
  return status
}
