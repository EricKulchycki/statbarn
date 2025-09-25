export function splitAtIndex(str: string, index: number): [string, string] {
  // Get the part of the string before the specified index
  const firstPart = str.slice(0, index)

  // Get the part of the string from the specified index to the end
  const secondPart = str.slice(index)

  return [firstPart, secondPart]
}
