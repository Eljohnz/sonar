const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { readDemoSongs, readDemoLikes, writeDemoValue } = require(path.join(process.env.SONAR_TEST_BUILD, 'lib/demoStorage.js'))
const { createSpotifyPreviewLoader, getSpotifyPreview } = require(path.join(process.env.SONAR_TEST_BUILD, 'lib/spotify.js'))

const url = 'https://open.spotify.com/track/1234567890123456789012'
const otherUrl = 'https://open.spotify.com/track/abcdefghijklmnopqrstuv'
const song = {
  id: 'local-song', user_id: null, spotify_url: url, spotify_id: '1234567890123456789012',
  title: 'Saved song', artist: 'Saved artist', album: null, caption: null, cover_url: null,
  visual_style: 'minimal', minimal_colors: { background: '#123456', text: '#FFFFFF', accent: '#ABCDEF' },
  status: 'published', created_at: '2026-10-15T00:00:00Z',
}
const storage = raw => ({ getItem: () => raw })

test('invalid JSON and non-array saved data recover to empty collections', () => {
  for (const raw of ['{', 'null', '{}', '42', '"saved"']) {
    assert.deepEqual(readDemoSongs(storage(raw)), [])
    assert.deepEqual(readDemoLikes(storage(raw)), [])
  }
})

test('mixed saved songs retain valid entries, skip broken rows, and remove duplicates', () => {
  const saved = [null, {}, song, { ...song }, { ...song, id: 'bad-style', visual_style: {} },
    { ...song, id: 'bad-date', created_at: 'invalid' }, { ...song, id: 'demo-1' },
    { ...song, id: 'bad-title', title: 123 }, { ...song, id: 'blank-artist', artist: ' ' }]
  const result = readDemoSongs(storage(JSON.stringify(saved)))
  assert.equal(result.length, 1)
  assert.equal(result[0].title, song.title)
  assert.equal(result[0].spotify_id, song.spotify_id)
})

test('legacy minimal palettes survive recovery and a save/reload cycle', () => {
  const result = readDemoSongs(storage(JSON.stringify([song])))
  assert.deepEqual(result[0].visual_colors.minimal, song.minimal_colors)
  let saved
  assert.equal(writeDemoValue('sonar_songs', result, { setItem: (_key, value) => { saved = value } }), true)
  assert.deepEqual(readDemoSongs(storage(saved)), result)
})

test('all four custom palettes survive recovery while malformed colors use safe defaults', () => {
  const palettes = {
    album: { background: '#111111', text: '#EEEEEE', accent: '#AABBCC' },
    equalizer: { background: '#222222', text: '#FFFFFF', bars: '#ABCDEF', grid: '#445566' },
    vinyl: { background: '#334455', text: '#FFFFFF', record: '#000000', accent: '#123456' },
    minimal: song.minimal_colors,
  }
  const valid = readDemoSongs(storage(JSON.stringify([{ ...song, visual_colors: palettes }])))
  assert.deepEqual(valid[0].visual_colors, palettes)
  const broken = readDemoSongs(storage(JSON.stringify([{ ...song, visual_colors: { album: { text: 10 } } }])))
  assert.match(broken[0].visual_colors.album.text, /^#[0-9a-f]{6}$/i)
})

test('optional malformed fields do not break rendering or produce invalid player links', () => {
  const result = readDemoSongs(storage(JSON.stringify([{ ...song, caption: {}, album: 7,
    cover_url: 'javascript:alert(1)', spotify_url: 'invalid', spotify_id: 'invalid' }])))
  assert.equal(result[0].caption, null)
  assert.equal(result[0].album, null)
  assert.equal(result[0].cover_url, null)
  assert.equal(result[0].spotify_url, null)
  assert.equal(result[0].spotify_id, null)
})

test('likes keep distinct nonempty string IDs only', () => {
  assert.deepEqual(readDemoLikes(storage('[null, {}, 5, "", " ", "demo-1", "demo-1", "local-song"]')), ['demo-1', 'local-song'])
})

test('denied reads, denied writes, and quota errors never escape storage helpers', () => {
  const denied = { getItem: () => { throw new Error('SecurityError') } }
  assert.deepEqual(readDemoSongs(denied), [])
  assert.deepEqual(readDemoLikes(denied), [])
  for (const message of ['SecurityError', 'QuotaExceededError']) {
    assert.equal(writeDemoValue('sonar_songs', [song], { setItem: () => { throw new Error(message) } }), false)
  }
})

test('a blocked localStorage getter is also guarded', t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { get localStorage() { throw new Error('SecurityError') } } })
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'window', previous); else delete globalThis.window })
  assert.deepEqual(readDemoSongs(), [])
  assert.deepEqual(readDemoLikes(), [])
  assert.equal(writeDemoValue('sonar_likes', ['demo-1']), false)
})

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function requestQueue(t) {
  const requests = []
  t.mock.method(globalThis, 'fetch', (_url, options) => {
    const response = deferred()
    requests.push({ ...response, signal: options.signal })
    return response.promise
  })
  return requests
}
const response = title => ({ ok: true, json: async () => ({ title, thumbnail_url: 'https://example.com/cover.jpg' }) })

test('a late older response cannot replace the newest track preview', async t => {
  const requests = requestQueue(t)
  const loader = createSpotifyPreviewLoader()
  const old = loader.load(url)
  const latest = loader.load(otherUrl)
  assert.equal(requests[0].signal.aborted, true)
  requests[1].resolve(response('New song'))
  assert.equal((await latest).title, 'New song')
  requests[0].resolve(response('Old song'))
  assert.equal(await old, null)
  assert.equal(loader.pending, false)
})

test('cancelling on a link change ignores a late response and clears pending state', async t => {
  const requests = requestQueue(t)
  const loader = createSpotifyPreviewLoader()
  const old = loader.load(url)
  loader.cancel()
  assert.equal(requests[0].signal.aborted, true)
  assert.equal(loader.pending, false)
  requests[0].resolve(response('Cancelled song'))
  assert.equal(await old, null)
})

test('cancellation during JSON decoding still discards the previous track', async t => {
  const decoded = deferred()
  const started = deferred()
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: () => { started.resolve(); return decoded.promise } }))
  const loader = createSpotifyPreviewLoader()
  const old = loader.load(url)
  await started.promise
  loader.cancel()
  decoded.resolve({ title: 'Old decoded song' })
  assert.equal(await old, null)
})

test('older failures do not stop or report errors for an active newer request', async t => {
  const requests = requestQueue(t)
  const loader = createSpotifyPreviewLoader()
  const old = loader.load(url)
  const latest = loader.load(otherUrl)
  requests[0].reject(new Error('Old network failure'))
  assert.equal(await old, null)
  assert.equal(loader.pending, true)
  requests[1].resolve(response('Current song'))
  assert.equal((await latest).title, 'Current song')
})

test('current request failures remain visible and allow retry', async t => {
  const requests = requestQueue(t)
  const loader = createSpotifyPreviewLoader()
  const failed = loader.load(url)
  requests[0].reject(new Error('Network failure'))
  await assert.rejects(failed, /Network failure/)
  assert.equal(loader.pending, false)
  const retry = loader.load(url)
  requests[1].resolve(response('Recovered song'))
  assert.equal((await retry).title, 'Recovered song')
})

test('unexpected Spotify metadata cannot enter the form as non-string values', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ title: 42, thumbnail_url: {} }) }))
  assert.deepEqual(await getSpotifyPreview(url), { title: '', cover: null })
})
