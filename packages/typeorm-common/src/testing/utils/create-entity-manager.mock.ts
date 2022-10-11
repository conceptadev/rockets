export function createEntityManagerMock() {
  const EntityManagerMock = class {
    public connection = { driver: { transactionSupport: 'simple' } };
    async transaction(...args: Array<unknown>) {
      if (args[0] instanceof Function) {
        return args[0]();
      } else if (args[1] instanceof Function) {
        return args[1]();
      }
    }
  };

  return new EntityManagerMock();
}
