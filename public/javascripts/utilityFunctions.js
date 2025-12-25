export function debounce(fn, delay) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
}

export function somethingElse(simpleExample) {
	return simpleExample
}
