/* eslint-env mocha */
import { assert, expect } from 'chai'

import darrensBot, { ActionTypes } from '.'

describe('darrens bot', () => {

  let bot = darrensBot()

  it('has an API', () => {
    assert.isFunction(bot.learn)
    assert.isFunction(bot.respond)
    assert.isFunction(bot.getAction)
    assert.isFunction(bot.getActions)
  })

  it('has some default actions', () => {
    expect(bot.respond('hello')).to.equal('Hello!')
  })

  describe('respond API', () => {
    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and be of type string'
      expect(bot.respond).to.throw(thrownMsg)
      const dodgyArgs = [null, 45.1, [1, 2, 3], {foo: 'bar'}]
      dodgyArgs.forEach(a => expect(bot.respond.bind(bot, a)).to.throw(thrownMsg))
      expect(bot.respond.bind(bot, 'This should be ok')).to.be.ok
    })

    it('returns a default message when it doesn\'t understand the input', () => {
      expect(bot.respond('dflkasjglasjlgas')).to.equal('I\'m sorry, I don\'t know what to do about that')
    })

    it('can use various keywords to perform the same action', () => {
      const keywords = ['hi', 'hello', 'hey', 'howdy']
      keywords.forEach(k => expect(bot.respond(k)).to.equal('Hello!'))
    })

    it('doesn`t care about input case', () => {
      const keywords = ['hi', 'HI', 'Hi', 'hI']
      keywords.forEach(k => expect(bot.respond(k)).to.equal('Hello!'))
    })
  })

  describe('learn API', () => {
    beforeEach(() => {
      bot = darrensBot()
    })

    const action = {
      label: 'test',
      type: ActionTypes.SAY,
      keywords: ['test', 'testing', 'testable'],
      response: 'Clearly you running a test!'
    }

    it('throws an error if invalid input type is provided', () => {
      const thrownMsg = 'Input must be present and must be an object'
      expect(bot.learn).to.throw(thrownMsg)
      const dodgyArgs = [null, 'A string', 43.5, [1, 2, 3]]
      dodgyArgs.forEach(a => expect(bot.learn.bind(bot, a)).to.throw(thrownMsg))
    })

    it('validates its input object', () => {
      const badAction = {}
      expect(bot.learn.bind(bot, badAction)).to.throw('Action must have a label')
      badAction.label = 'Some label'
      expect(bot.learn.bind(bot, badAction)).to.throw('Action type is not valid')
      badAction.type = Symbol('faulty-action')
      expect(bot.learn.bind(bot, badAction)).to.throw('Action type is not valid')
      badAction.type = ActionTypes.SAY
      expect(bot.learn.bind(bot, badAction)).to.throw('Action must have a keywords array')
      badAction.keywords = []
      expect(bot.learn.bind(bot, badAction)).to.throw('Action must have at least one keyword')
      badAction.keywords = ['some keyword']
      expect(bot.learn.bind(bot, badAction)).to.throw('Action must supply a response string')
      badAction.response = 'some response'
      expect(bot.learn.bind(bot, badAction)).to.be.ok
    })

    it('returns an learned action', () => {
      bot.learn(action)
      expect(bot.getAction(action.label)).to.deep.equal(action)
    })

    it('learns a new action and responds accordingly', () => {
      bot.learn(action)
      action.keywords.forEach(kw => expect(bot.respond(kw)).to.equal(action.response))
    })
  })
})
