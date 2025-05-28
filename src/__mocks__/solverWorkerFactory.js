exports.createSolverWorker = () => ({
  postMessage: () => {},
  terminate: () => {},
  onmessage: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
  onerror: null,
  onmessageerror: null,
  // @ts-ignore
  CLOSED: 0, CLOSING: 0, CONNECTING: 0, OPEN: 0, readyState: 0, url: '',
}); 