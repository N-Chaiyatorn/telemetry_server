// Serializes command
/**
 * Returns a buffer of a number - basically!
 * @param {number} num - The number you want to seriallize
 * @param {number} bits - Total number of bits of the number in the buffer
 * @param {type} type - Either a "U", "I" or "F"
 * @return a big-endian buffer array of the number
 */
function numBuff (num, bits, type) {
  const buff = Buffer.alloc(bits / 8)
  switch (type.substring(0, 1)) {
    case 'U': {
      // Unsigned Int
      switch (bits) {
        case 8: {
          buff.writeUInt8(num)
          break
        }
        case 16: {
          buff.writeUInt16BE(num)
          break
        }
        case 32: {
          buff.writeUInt32BE(num)
          break
        }
        default: {
          // Invalid bits
          console.log('[ERROR] Invalid number of bits: ' + bits)
          break
        }
      }

      break
    }

    case 'F': {
      // Floating Point
      switch (bits) {
        case 32: {
          buff.writeFloatBE(num)
          break
        }
        default: {
          // Invalid bits
          console.log('[ERROR] Invalid number of bits: ' + bits)
          break
        }
      }

      break
    }

    case 'I': {
      // Integer
      switch (bits) {
        case 8: {
          buff.writeInt8BE(num)
          break
        }
        case 16: {
          buff.writeInt16BE(num)
          break
        }
        case 32: {
          buff.writeInt32BE(num)
          break
        }
        default: {
          // Invalid bits
          console.log('[ERROR] Invalid number of bits: ' + bits)
          break
        }
      }

      break
    }

    default: {
      // Invalid type
      console.log('[ERROR] Invalid Type: ' + type)
      break
    }
  }

  return buff
}

/*
   * Concantinates buffers
   */

function concatBuffs (buffArr) {
  const totalLength = buffArr.reduce((total, b) => total + b.length, 0)
  return Buffer.concat(buffArr, totalLength)
}

/*
* Converts a string to a buffer (inserts length in front)
*/
function strBuff (str) {
  const lenBuff = numBuff(str.length, 16, 'U')
  const strBuff = Buffer.from(str)
  return concatBuffs([lenBuff, strBuff])
}

/*
* Converts a string to a buffer (inserts length in front)
*/
function checksumGenerator (buffer) {
  const crc = require('crc')
  const checksumBuffer = ((buffer) => {
    return numBuff(crc.crc32(buffer), 32, 'U')
  })(buffer)
  return checksumBuffer
}

/**
 * Function to serialize commands
 * @param {object} usrCommand - object generated by client specs (opCode, arguments)
 * @param {string} target     - name of deployment or target build
 * @return {Buffer} - Node buffer array of command packet bytes
 */
function fprimeSerializer (usrCommand, target) {
  /*
    // Commands follow the following format\
    // header + (32-bit)(32-bit)Descriptor +
    */
  const commandDict = require(`../res/${target}Dictionary.json`)[target].commands

  const header = Buffer.from([0xde, 0xad, 0xbe, 0xef])
  const desc = 0

  let length = 8 // Length in bytes
  const opcode = usrCommand.opCode
  const types = commandDict[opcode.toString()].arguments.map((a) => a)

  const argBufferArr = usrCommand.arguments.map(function (a, i) {
    if (types[i] == 'string') {
      const stringBuffed = strBuff(a)
      length += stringBuffed.length
      return stringBuffed
    } else if (Array.isArray(types[i])) {
      const enumArray = types[i][1]
      const enumVal = ((enumArray) => {
        for (let j = 0; j < enumArray.length; j++) {
          if (a === enumArray[j][0]) { return j }
        }
      })(enumArray)
      length += 32 / 8
      return numBuff(enumVal, 32, 'I')
    } else {
      const bits = parseInt(types[i].substring(1))
      length += (bits / 8)
      return numBuff(a, bits, types[i])
    }
  })

  const commandBufferArgs = concatBuffs(argBufferArr)

  const commandBuffArray = [header, numBuff(length, 32, 'U'), numBuff(desc, 32, 'U'), numBuff(opcode, 32, 'U'), commandBufferArgs]

  const checksumBuff = checksumGenerator(concatBuffs(commandBuffArray))

  commandBuffArray.push(checksumBuff)

  return concatBuffs(commandBuffArray)
}

// Export
module.exports = {
  fprimeSerializer: fprimeSerializer
}
