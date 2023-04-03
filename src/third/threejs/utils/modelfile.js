/**
 * code = LoadType.DRC
 * name = LoadType.values[code].name
 */
export const FileType = {
  UNKNOWN: 0,
  DRC: 1,
  STL: 2,
  PLY: 3,
  MQ: 4,
  OBJ: 5,
  values: {
    0: { name: 'unknown', value: 0 },
    1: { name: 'drc', value: 1 },
    2: { name: 'stl', value: 2 },
    3: { name: 'ply', value: 3 },
    4: { name: 'mq', value: 4 },
    5: { name: 'obj', value: 5 },
  },
}
Object.freeze(FileType)

function supportExt(nameOrPath) {
  let cleanNameOrPath = nameOrPath.split('?OSSAccessKeyId')[0]
  const pos1 = cleanNameOrPath.lastIndexOf('/')
  const name = cleanNameOrPath.substr(pos1 + 1)
  const ext = name.substr(name.lastIndexOf('.') + 1)
  for (let idx = 5; idx > 0; idx--) {
    if (FileType.values[idx].name === ext) {
      return FileType.values[idx].value
    }
  }
  return 0
}

function extFile(path, ftype) {
  const ext = FileType.values[ftype].name
  const str1 = `.${ext}`
  const str2 = `.${ext}?`
  // console.log('-ext', path, ftype, str1, str2);
  return path.endsWith(str1) || path.indexOf(str2) > 0
}

export function isModelFile(name) {
  let ft = supportExt(name)
  return ft !== 0
}

export function toFileType(path) {
  if (extFile(path, FileType.DRC)) {
    return FileType.DRC
  } else if (extFile(path, FileType.MQ)) {
    return FileType.MQ
  } else if (extFile(path, FileType.STL)) {
    return FileType.STL
  } else if (extFile(path, FileType.PLY)) {
    return FileType.PLY
  } else if (extFile(path, FileType.OBJ)) {
    return FileType.OBJ
  }
  return FileType.UNKNOWN
}
