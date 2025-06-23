export const fetcher = <T>(input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json() as Promise<T>);