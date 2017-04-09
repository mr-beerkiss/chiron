/* eslint-env jest */
import chiron from '.'

describe('chiron', () => {
  const defaultGreeting = 'Hello, I`m Chiron!'

  let defaultBot = chiron()


  it('has some default actions', () => {
    expect(defaultBot.responses.respond('hello')).toEqual(defaultGreeting)
  })
})
