import { Event } from './event';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';

describe('Event', () => {
  describe('Without value typing', () => {
    class TestEvent extends Event {}

    describe('static key', () => {
      it('should equal prefixed name of the class', async () => {
        expect(`${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`).toEqual(
          TestEvent.key,
        );
      });
    });

    describe('instance key', () => {
      it('should equal prefixed name of constructed class', async () => {
        const test = new TestEvent();
        expect(`${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`).toEqual(test.key);
      });
    });

    describe('values', () => {
      it('should be an empty array if no values passed to constuctor', async () => {
        const test = new TestEvent();
        expect(test.values).toEqual([]);
      });
    });
  });

  describe('With single parameter typing', () => {
    type TestEventValue = { z: string };

    class TestEvent extends Event<TestEventValue> {}

    describe('values', () => {
      it('should equal values passed to constructor', async () => {
        const test = new TestEvent({ z: 'foo' });
        const testValues: TestEventValue[] = test.values;
        expect(testValues).toEqual([{ z: 'foo' }]);
      });
    });
  });

  describe('With multiple parameter typing', () => {
    type TestEventValues = [boolean, number, string, { z: string }];

    class TestEvent extends Event<TestEventValues> {}

    describe('values', () => {
      it('should equal values passed to constructor', async () => {
        const test = new TestEvent(true, 1, 'a', { z: 'foo' });
        const testValues: TestEventValues = test.values;
        expect(testValues).toEqual([true, 1, 'a', { z: 'foo' }]);
      });
    });
  });
});
