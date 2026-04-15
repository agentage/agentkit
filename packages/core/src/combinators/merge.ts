/**
 * Merge N async generators that yield T and return R — interleaves yielded
 * values in arrival order, collects returns into an R[] at the end.
 *
 * Used by `parallel` to stream child events as they arrive while preserving
 * ordered access to each child's final CtxRunResult.
 */
export async function* mergeGenerators<T, R>(
  gens: Array<AsyncGenerator<T, R, void>>
): AsyncGenerator<T, R[], void> {
  const pending = new Map<number, Promise<{ i: number; res: IteratorResult<T, R> }>>();
  gens.forEach((g, i) =>
    pending.set(
      i,
      g.next().then((res) => ({ i, res }))
    )
  );

  const results: R[] = new Array(gens.length);
  while (pending.size > 0) {
    const { i, res } = await Promise.race([...pending.values()]);
    if (res.done) {
      results[i] = res.value;
      pending.delete(i);
    } else {
      yield res.value;
      pending.set(
        i,
        gens[i].next().then((r) => ({ i, res: r }))
      );
    }
  }
  return results;
}
