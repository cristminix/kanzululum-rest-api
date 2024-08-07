export function crc32Id(input: string) {
  const data = new TextEncoder().encode(input)
  const checksum = crc32(data)

  return checksum.toString(16)
}
const CRC32_TABLE: Uint32Array = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let crc = i
  for (let j = 8; j > 0; j--) {
    if (crc & 1) {
      crc = (crc >>> 1) ^ 0xedb88320
    } else {
      crc = crc >>> 1
    }
  }
  CRC32_TABLE[i] = crc
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    const tableIndex = (crc ^ byte) & 0xff
    crc = (crc >>> 8) ^ CRC32_TABLE[tableIndex]
  }
  return crc ^ 0xffffffff
}
