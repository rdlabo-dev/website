import assert from 'node:assert/strict';
import test from 'node:test';
import { apiMarkdown } from './docgen-api';

test('indexes method overloads by their first parameter while preserving the aggregate entry', () => {
  const api = apiMarkdown({
    api: {
      methods: [
        {
          name: 'addListener',
          signature: "(eventName: 'ready', listenerFunc: () => void): Promise<void>",
          parameters: [{ type: "'ready'" }],
        },
        {
          name: 'addListener',
          signature: '(eventName: Events.Done, listenerFunc: () => void): Promise<void>',
          parameters: [{ type: 'Events.Done' }],
        },
      ],
    },
  });

  assert.match(api.get('addListener') ?? '', /addListener\('ready', \.\.\.\)/);
  assert.match(api.get('addListener') ?? '', /addListener\(Events\.Done, \.\.\.\)/);
  assert.match(api.get('addListener.ready') ?? '', /addListener\('ready', \.\.\.\)/);
  assert.doesNotMatch(api.get('addListener.ready') ?? '', /Events\.Done/);
  assert.match(api.get('addListener.Events') ?? '', /addListener\(Events\.Done, \.\.\.\)/);
  assert.match(api.get('addListener.Events.Done') ?? '', /addListener\(Events\.Done, \.\.\.\)/);
});
