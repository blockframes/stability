export const update = (x: any, key: string, f: any) => {
  return { ...x, ...(x[key] !== undefined ? { [key]: f(x[key]) } : {}) }
}

export const dateToMS = (x: Date): number => x.getTime()
