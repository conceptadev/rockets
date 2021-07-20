import { EmailModule } from './index';
import { EmailService } from './index';

describe('Index', () => {
  it('EmailModule should be imported', () => {
    expect(EmailModule).toBeInstanceOf(Function);
  });
  it('EmailService should be imported', () => {
    expect(EmailService).toBeInstanceOf(Function);
  });
});
