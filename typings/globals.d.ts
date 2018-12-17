interface Array<T> {
  flatMap<E>(callback: (t: T) => Array<E>): Array<E>
}
