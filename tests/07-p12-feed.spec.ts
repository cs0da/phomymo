import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });

test('P12 feed setting controls the commands sent after the raster', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const feedCounts = await page.evaluate(async () => {
    const { loadPrinterDefinitions, print } = await import('/printer.js');
    await loadPrinterDefinitions();

    const counts: number[] = [];
    for (const feed of [0, 16, 32, 48]) {
      const sent: number[][] = [];
      const transport = {
        send: async (bytes: Uint8Array) => { sent.push(Array.from(bytes)); },
        delay: async () => {},
        waitForResponse: async () => {},
      };
      await print(transport, {
        data: new Uint8Array(16),
        widthBytes: 2,
        heightLines: 8,
      }, { isBLE: true, deviceName: 'P12 PRO', feed });
      counts.push(sent.filter(bytes => bytes.join(',') === '27,100,13').length);
    }
    return counts;
  });

  expect(feedCounts).toEqual([0, 1, 2, 3]);
});
