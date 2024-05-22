export async function promiseSettledRequest<T extends readonly unknown[] | []>(
  requests: T,
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> | undefined }> {
  const response = await Promise.allSettled(requests)
  // @ts-ignore
  return response.map(v => (v.status === "fulfilled" ? v.value : undefined))
}
