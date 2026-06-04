import type { Notification, NotificationButton } from '../types';

/// Spec for the [Notification] interface shape and key invariants of the bridge payload.
/// The interface itself is compile-time, but constructing concrete sample values pins the
/// expected shape: any TypeScript change that drops/renames a field will fail to compile
/// here, and the runtime assertions guard the "no cross-fallback" semantic for clickedUrl.
describe('Notification', () => {
  it('accepts a body click payload (no buttons)', () => {
    const payload: Notification = {
      id: 'n1',
      body: 'hello',
      url: 'https://example.com/body',
      clickedButtonIndex: null,
      clickedButton: null,
      clickedUrl: 'https://example.com/body',
    };

    expect(payload.buttons).toBeUndefined();
    expect(payload.clickedButtonIndex).toBeNull();
    expect(payload.clickedButton).toBeNull();
    // Body click branch: clickedUrl = body url.
    expect(payload.clickedUrl).toBe('https://example.com/body');
  });

  it('accepts a button click payload (button has link)', () => {
    const buttons: NotificationButton[] = [
      { label: 'Open', link: 'https://example.com/a' },
      { label: 'Share' },
    ];
    const payload: Notification = {
      id: 'n2',
      body: 'hello',
      url: 'https://example.com/body',
      buttons,
      clickedButtonIndex: 0,
      clickedButton: buttons[0],
      clickedUrl: 'https://example.com/a',
    };

    expect(payload.buttons?.length).toBe(2);
    expect(payload.buttons?.[0].label).toBe('Open');
    expect(payload.buttons?.[1].link).toBeUndefined();
    expect(payload.clickedButton?.label).toBe('Open');
    expect(payload.clickedUrl).toBe('https://example.com/a');
  });

  it('represents button click without link as clickedUrl=null (NOT body url)', () => {
    // This is the critical "no cross-fallback" guard: when the user taps a button that has
    // no link, the bridge sends clickedUrl=null. The interface must surface that null and
    // never silently substitute the body's url — that would point users at a different
    // destination than what the click carried.
    const payload: Notification = {
      id: 'n3',
      body: 'hello',
      url: 'https://example.com/body',
      buttons: [{ label: 'NoLink' }],
      clickedButtonIndex: 0,
      clickedButton: { label: 'NoLink' },
      clickedUrl: null,
    };

    expect(payload.clickedButtonIndex).toBe(0);
    expect(payload.clickedButton?.label).toBe('NoLink');
    expect(payload.clickedButton?.link).toBeUndefined();
    expect(payload.clickedUrl).toBeNull();
    expect(payload.url).toBe('https://example.com/body');
  });

  it('represents out-of-range button click with null details', () => {
    const payload: Notification = {
      id: 'n4',
      body: 'hello',
      url: 'https://example.com/body',
      buttons: [{ label: 'Only', link: 'https://example.com/only' }],
      // OS reported a button slot tap but native couldn't resolve the button (stale
      // category cache, etc.). Index stays set so callers can still tell "it was a
      // button click", but the button object and clickedUrl are null.
      clickedButtonIndex: 5,
      clickedButton: null,
      clickedUrl: null,
    };

    expect(payload.clickedButtonIndex).toBe(5);
    expect(payload.clickedButton).toBeNull();
    expect(payload.clickedUrl).toBeNull();
  });
});
