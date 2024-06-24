import { validTextInputRegex } from "./helpers"

export const validInput = (value: string) =>{
  return value.trim().length && validTextInputRegex.test(value)
}
