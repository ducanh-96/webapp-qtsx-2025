describe('SecurityService constructor setInterval (98-103)', () => {
  it('should set up cleanup interval in constructor', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = jest
      .spyOn(global, 'setInterval')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => 123 as any);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SecurityService } = require('../securityService');
    new SecurityService();
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 5 * 60 * 1000);
    spy.mockRestore();
  });
});
