import {
  EventModule,
  Event,
  EventSync,
  EventAsync,
  EventListener,
  EventListenerOn,
  EventDispatchService,
  EventDispatchException,
  EventListenService,
  EventListenException,
  EventListenerException,
} from './index';

describe('Index', () => {
  it('EventModule should be exported', () => {
    expect(EventModule).toBeInstanceOf(Function);
  });
  it('Event should be exported', () => {
    expect(Event).toBeInstanceOf(Function);
  });
  it('EventAsync should be exported', () => {
    expect(EventAsync).toBeInstanceOf(Function);
  });
  it('EventSync should be exported', () => {
    expect(EventSync).toBeInstanceOf(Function);
  });
  it('EventListener should be exported', () => {
    expect(EventListener).toBeInstanceOf(Function);
  });
  it('EventListenOn should be exported', () => {
    expect(EventListenerOn).toBeInstanceOf(Function);
  });
  it('EventDispatchException should be exported', () => {
    expect(EventDispatchException).toBeInstanceOf(Function);
  });
  it('EventListenException should be exported', () => {
    expect(EventListenException).toBeInstanceOf(Function);
  });
  it('EventListenerException should be exported', () => {
    expect(EventListenerException).toBeInstanceOf(Function);
  });
  it('EventDispatchService should be exported', () => {
    expect(EventDispatchService).toBeInstanceOf(Function);
  });
  it('EventListenService should be exported', () => {
    expect(EventListenService).toBeInstanceOf(Function);
  });
});
