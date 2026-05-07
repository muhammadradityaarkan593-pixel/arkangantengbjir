export default {
  async fetch(request) {
    const html = await import('./haha.html', { assert: { type: 'text' } });
    return new Response(html.default, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
};
