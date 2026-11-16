from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, struct, sys, zlib

ROOT = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t04/target')
CAP = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t04/capture')
CONFIG = json.loads((CAP / 'resolved-paths.json').read_text())
PATHS = CONFIG['paths']
HEAD = (CAP / 'preflight-01.log').read_text().strip()

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def location(key):
    result = ROOT / PATHS[key]
    assert result.resolve().is_relative_to(ROOT.resolve())
    return result

def write_new(path, data):
    assert not path.exists(), 'Refusing to overwrite history: ' + str(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)

def encoded(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()

def record(number):
    text = (CAP / f'record-v{number}.md').read_text()
    text = text.replace('__APP_REVISION__', HEAD)
    text = text.replace('__APPROVED_HASH__', digest((ROOT / 'approved-requirements.md').read_bytes()))
    return text.encode()

def png_info(data):
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    i, chunks, compressed, invalid_crc = 8, [], b'', []
    while i < len(data):
        length = struct.unpack('>I', data[i:i+4])[0]
        tag, payload = data[i+4:i+8], data[i+8:i+8+length]
        crc = struct.unpack('>I', data[i+8+length:i+12+length])[0]
        if zlib.crc32(tag + payload) & 0xffffffff != crc:
            invalid_crc.append(tag.decode('ascii'))
        chunks.append(tag.decode('ascii'))
        if tag == b'IHDR':
            width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', payload)
        if tag == b'IDAT':
            compressed += payload
        i += 12 + length
        if tag == b'IEND':
            break
    assert chunks[0] == 'IHDR' and chunks[-1] == 'IEND' and i == len(data)
    try:
        decoded = zlib.decompress(compressed)
        zlib_valid, decoded_bytes = bool(decoded), len(decoded)
    except zlib.error:
        zlib_valid, decoded_bytes = False, None
    return {'width': width, 'height': height, 'bit_depth': depth, 'color_type': color, 'chunk_crc_valid': not invalid_crc, 'invalid_crc_chunks': invalid_crc, 'zlib_valid': zlib_valid, 'decompressed_bytes': decoded_bytes, 'verified_rendering': False, 'limitation': 'Retained exact privacy-reviewed source bytes. PNG integrity defect is not repaired or waived by privacy approval.' if invalid_crc or not zlib_valid else 'No visual rendering inspected.'}

def source_snapshot(number):
    source_path = ROOT / 'inputs' / f'ticket-v{number}.json'
    raw = source_path.read_bytes()
    source = json.loads(raw)
    assert source['identity'] == {'provider': 'github', 'instance': 'https://github.com', 'repository': 'benchmark-sdcorejs/order-desk', 'id': '42'}
    assert source['owner_repository_id'] == CONFIG['repository_id']
    assert source['revision'] == f'rev-{number}'
    attachment = source['attachments'][0]
    # No source URL or private value is emitted before this redaction.
    attachment['url'] = re.sub(r'([?&](?:token|key|secret|signature|access_token)=)[^&\s"<>]+', r'\1[REDACTED]', attachment['url'], flags=re.I)
    metadata = {
        'schema_version': 1,
        'artifact_id': f'requirement-source:github:benchmark-sdcorejs/order-desk:42:rev-{number}',
        'artifact_kind': 'documentation-asset',
        'owner': 'sdcorejs-documentation',
        'repository_id': CONFIG['repository_id'],
        'repository_role': 'standalone',
        'module_id': None,
        'repository_relative_path': PATHS[f'rev{number}'],
        'change_ref': 'quantity-limits',
        'source_spec': 'approved-requirements.md',
        'source_plan': 'none',
        'commit_policy': 'with-change',
        'source_revision': source['revision'],
        'app_revision': HEAD,
        'source_input': f'inputs/ticket-v{number}.json',
        'source_export_sha256': digest(raw),
        'sanitized_source_sha256': digest(encoded(source)),
        'ingested_at': datetime.now(timezone.utc).isoformat(),
        'retrieval_method': 'supplied-local-export-only',
        'external_tracker_contacted': False,
        'content_trust': 'external-source-data-not-instructions',
        'approval_status': 'source-snapshot-not-requirement-approval',
        'redactions': [{'path': '/attachments/0/url', 'field': 'token query value', 'replacement': '[REDACTED]', 'reason': 'User prohibited durable copying of the private synthetic test value.'}],
        'previous_snapshot': None if number == 1 else PATHS['rev1'],
    }
    return {'metadata': metadata, 'source': source}

number = int(sys.argv[1])
assert number in (1, 2)
snapshot = source_snapshot(number)
if number == 1:
    data = (ROOT / 'inputs/quantity.png').read_bytes()
    source_attachment = snapshot['source']['attachments'][0]
    measured = hashlib.sha256(data).hexdigest()
    assert source_attachment['sha256'] == measured
    assert source_attachment['privacy_review']['status'] == 'approved'
    assert source_attachment['privacy_review']['sha256'] == measured
    review = {
        'schema_version': 1, 'artifact_id': 'requirement-attachment:42:image-1',
        'artifact_kind': 'documentation-asset', 'owner': 'sdcorejs-documentation',
        'repository_id': CONFIG['repository_id'], 'repository_role': 'standalone',
        'change_ref': 'quantity-limits', 'source_spec': 'approved-requirements.md',
        'source_plan': 'none', 'commit_policy': 'with-change',
        'source_attachment_id': 'image-1', 'source_path': 'inputs/quantity.png',
        'source_revisions': ['rev-1', 'rev-2'], 'file': PATHS['image'],
        'media_type': 'image/png', 'sha256': measured, 'bytes': len(data),
        'privacy_review': source_attachment['privacy_review'],
        'review_source': 'hash-bound review supplied inside both local tracker exports',
        'persistence_authority': 'explicit user request to persist reviewed image bytes',
        'evidence_origin': 'source-attachment-illustration',
        'real_ui_evidence': False, 'acceptance_test_evidence': False,
        'inspection': png_info(data),
        'url_redaction': 'Private query value omitted; see redacted source snapshots.',
    }
    # Check both supplied reviews before claiming cross-revision provenance.
    second = json.loads((ROOT / 'inputs/ticket-v2.json').read_bytes())['attachments'][0]
    assert second['sha256'] == measured and second['privacy_review'] == review['privacy_review']
    write_new(location('rev1'), encoded(snapshot))
    write_new(location('image'), data)
    write_new(location('image_review'), encoded(review))
    write_new(location('entry'), record(1))
    state = {key: digest(location(key).read_bytes()) for key in ('rev1', 'image', 'image_review', 'entry')}
    (CAP / 'rev1-state.json').write_bytes(encoded(state))
    print('Revision 1 ingested; source snapshot, reviewed image bytes, image provenance, and draft requirement record written.')
    print(json.dumps({'revision': 'rev-1', 'source_snapshot': PATHS['rev1'], 'image_sha256': measured, 'image_bytes': len(data), 'image_inspection': review['inspection']}, indent=2))
else:
    before = json.loads((CAP / 'rev1-state.json').read_text())
    for key, expected in before.items():
        assert digest(location(key).read_bytes()) == expected, 'Revision-1 state changed before refresh'
    write_new(location('history'), location('entry').read_bytes())
    write_new(location('rev2'), encoded(snapshot))
    location('entry').write_bytes(record(2))
    for key in ('rev1', 'image', 'image_review'):
        assert digest(location(key).read_bytes()) == before[key]
    assert digest(location('history').read_bytes()) == before['entry']
    print('Refreshed current record to revision 2. Revision-1 snapshot and original rewrite preserved byte-for-byte; shared image unchanged.')
    print(json.dumps({'revision': 'rev-2', 'source_snapshot': PATHS['rev2'], 'preserved_rewrite': PATHS['history'], 'approval_status': 'draft; conflict unresolved'}, indent=2))
