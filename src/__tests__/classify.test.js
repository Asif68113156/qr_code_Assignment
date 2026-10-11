import { classify, isUrl } from '../utils/classify';

describe('classify()', () => {
  it.each([
    ['https://react.dev', 'url'],
    ['WIFI:T:WPA;S:Lab;P:pass;;', 'wifi'],
    ['mailto:a@b.com', 'email'],
    ['user@example.com', 'email'],
    ['+91 98765 43210', 'phone'],
    ['upi://pay?pa=abc@bank', 'upi'],
    ['hello world', 'text'],
  ])('%s -> %s', (input, expected) => {
    expect(classify(input)).toBe(expected);
  });

  it('isUrl only accepts http(s)', () => {
    expect(isUrl('http://x.com')).toBe(true);
    expect(isUrl('ftp://x.com')).toBe(false);
    expect(isUrl('not a url')).toBe(false);
  });
});
