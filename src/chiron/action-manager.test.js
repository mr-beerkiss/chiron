/* eslint-env jest */

import actionManager from './action-manager'

describe('action manager API', () => {
  let actions

  beforeEach(() => {
    actions = actionManager()
  })

  const action = {
    label: 'test',
    input: ['test', 'testing', 'testable']
  }

  it('has a public API', () => {
    expect(typeof actions.learnAction).toBe('function')
    expect(typeof actions.executeAction).toBe('function')
  })

  it('throws an error if invalid input type is provided', () => {
    const thrownMsg = 'action must be present and must be an object'
    expect(actions.learnAction.bind(actions)).toThrow(thrownMsg)
    const dodgyArgs = [null, 'A string', 43.5, [1, 2, 3]]
    dodgyArgs.forEach(a => expect(actions.learnAction.bind(actions, a)).toThrow(thrownMsg))
  })

  it('validates its input object', () => {
    const badAction = {}
    expect(actions.learnAction.bind(actions, badAction)).toThrow('Action must have a label')
    badAction.label = 'Some label'
    expect(actions.learnAction.bind(actions, badAction)).toThrow('Action must have an input string or array')
    badAction.input = []
    expect(actions.learnAction.bind(actions, badAction)).toThrow('Action input cannot be an empty array')
    badAction.input = ['some keyword']
    expect(actions.learnAction.bind(actions, badAction)).toThrow('Action output must be a string or function')
    badAction.output = 'some response'
    expect(actions.learnAction.bind(actions, badAction)).toBeTruthy()
  })

  it('executes a learned action with a function output', () => {
    const actionFnOutput = {
      ...action,
      output: () => 'clearly you are trying to make a test!'
    }
    const expectedValue = 'clearly you are trying to make a test!'
    actions.learnAction(actionFnOutput)
    expect(actions.executeAction(actionFnOutput.label)).toEqual(expectedValue)
  })

  it('executes a learned action with a string output', () => {
    const someString = 'some string that I just made up'
    const actionStrOutput = {
      ...action,
      output: someString
    }
    actions.learnAction(actionStrOutput)
    expect(actions.executeAction(actionStrOutput.label)).toEqual(someString)
  })

  it('returns null if the supplied action does not exist', () => {
    expect(actions.executeAction('NonExistantAction')).toBeNull()
  })
})
