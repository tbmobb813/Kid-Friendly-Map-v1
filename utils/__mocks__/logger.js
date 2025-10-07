const mockLog = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
  getLogs: jest.fn(() => []),
  clearLogs: jest.fn(),
  exportLogs: jest.fn(() => ''),
};

module.exports = {
  __esModule: true,
  default: mockLog,
  log: mockLog,
};
