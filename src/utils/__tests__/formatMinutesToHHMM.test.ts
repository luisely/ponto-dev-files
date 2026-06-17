import { formatMinutesToHHMM } from '../formatMinutesToHHMM'

describe('formatMinutesToHHMM', () => {
  test('converte minutos corretamente', () => {
    expect(formatMinutesToHHMM(0)).toBe('00:00')
    expect(formatMinutesToHHMM(5)).toBe('00:05')
    expect(formatMinutesToHHMM(60)).toBe('01:00')
    expect(formatMinutesToHHMM(75)).toBe('01:15')
    expect(formatMinutesToHHMM(150)).toBe('02:30')
  })

  test('funciona com horas maiores que 24', () => {
    expect(formatMinutesToHHMM(1500)).toBe('25:00')
  })
})
