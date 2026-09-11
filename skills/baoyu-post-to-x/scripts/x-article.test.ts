import assert from 'node:assert/strict';
import test from 'node:test';

import { CLICK_WRITE_BUTTON_EXPRESSION } from './x-article.ts';

test('CLICK_WRITE_BUTTON_EXPRESSION clicks the closest clickable Write button ancestor', () => {
  let innerClicked = false;
  let outerClicked = false;

  const inner = {
    click() {
      innerClicked = true;
    },
    closest(selector: string) {
      assert.equal(selector, 'a, button, [role="button"]');
      return {
        click() {
          outerClicked = true;
        },
      };
    },
  };

  const previousDocument = globalThis.document;
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      querySelector(selector: string) {
        assert.equal(selector, '[data-testid="empty_state_button_text"]');
        return inner;
      },
    },
  });

  try {
    Function(CLICK_WRITE_BUTTON_EXPRESSION)();
  } finally {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: previousDocument,
    });
  }

  assert.equal(outerClicked, true);
  assert.equal(innerClicked, false);
});
