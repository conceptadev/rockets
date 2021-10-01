import { Order } from './order.entity';

describe('OrdersEntity', () => {
  it('should be valid', () => {
    const order = new Order();
    expect(order).toEqual({
      id: undefined,
      name: undefined,
      description: undefined,
    });
  });
});
